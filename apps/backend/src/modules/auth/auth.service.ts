import bcrypt from "bcryptjs";
import { db } from "../../db/index.js";
import { users, roles, userToRoles, departments } from "@forge/shared";
import { sign, verify } from "hono/jwt";
import { eq } from "drizzle-orm";
import { env } from "../../config.js";
import { redis } from "../../db/redis.js";

const JWT_ACCESS_SECRET = env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = env.JWT_REFRESH_SECRET;

export class AuthService {
  private async getOrCreateDefaultDept(client: any) {
    const [defaultDept] = await client
      .select()
      .from(departments)
      .where(eq(departments.name, "默认部门"))
      .limit(1);

    if (defaultDept) {
      return defaultDept;
    }

    const [insertedDept] = await client
      .insert(departments)
      .values({ name: "默认部门" })
      .onConflictDoNothing()
      .returning();

    if (insertedDept) {
      return insertedDept;
    }

    const [retryDept] = await client
      .select()
      .from(departments)
      .where(eq(departments.name, "默认部门"))
      .limit(1);

    if (retryDept) {
      return retryDept;
    }

    throw new Error("默认部门初始化失败");
  }

  /**
   * 用户自主注册逻辑
   */
  async register(
    username: string,
    password: string,
    nickname?: string | null,
    phone?: string | null,
  ) {
    // 1. 检查用户名冲突
    const [existUser] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (existUser) {
      throw new Error("用户名已被注册");
    }

    if (phone) {
      const [existPhone] = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
      if (existPhone) {
        throw new Error("该手机号已被注册");
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return await db.transaction(async (tx) => {
      // 2. 确保存在默认部门（新注册用户默认归属），不存在则自动初始化
      const defaultDept = await this.getOrCreateDefaultDept(tx);

      // 3. 写入用户表
      const [newUser] = await tx
        .insert(users)
        .values({
          username,
          password: hashedPassword,
          nickname: nickname || username,
          phone: phone || null,
          status: "active",
          departmentId: defaultDept.id,
        })
        .returning();

      // 4. 寻找默认的普通用户角色 ROLE_USER，不存在则自动初始化它
      let defaultRole = await tx
        .select()
        .from(roles)
        .where(eq(roles.code, "ROLE_USER"))
        .limit(1)
        .then((res) => res[0]);

      if (!defaultRole) {
        const [newRole] = await tx
          .insert(roles)
          .values({
            code: "ROLE_USER",
            name: "普通用户",
            description: "自主注册用户的默认系统角色",
          })
          .returning();
        defaultRole = newRole;
      }

      // 5. 绑定默认角色
      await tx.insert(userToRoles).values({
        userId: newUser.id,
        roleId: defaultRole.id,
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...safeUser } = newUser;
      return safeUser;
    });
  }

  /**
   * 初始化超级管理员账号
   */
  async initAdmin() {
    const existUsers = await db.select().from(users).limit(1);
    if (existUsers.length > 0) {
      throw new Error("系统已初始化，拒绝重复创建超管账号");
    }

    const hashedPassword = await bcrypt.hash("123456", 10);

    // 确保存在默认部门（超管默认归属），不存在则自动初始化
    const defaultDept = await this.getOrCreateDefaultDept(db);

    await db.insert(users).values({
      username: "admin",
      password: hashedPassword,
      nickname: "超级管理员",
      status: "active",
      departmentId: defaultDept.id,
    });

    return {
      username: "admin",
      nickname: "超级管理员",
    };
  }

  /**
   * 用户登录逻辑
   */
  async login(
    params: {
      username?: string;
      password?: string;
      phone?: string;
      code?: string;
      type?: "password" | "code";
    },
    ip: string | null = null,
    userAgent: string | null = null,
  ) {
    let user;
    if (params.type === "code") {
      const { phone, code } = params;
      if (code !== "0000") {
        throw new Error("验证码错误");
      }
      if (!phone) {
        throw new Error("手机号不能为空");
      }
      [user] = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
      if (!user) {
        throw new Error("该手机号未注册，请先注册账号");
      }
    } else {
      const { username, password } = params;
      if (!username || !password) {
        throw new Error("用户名和密码不能为空");
      }
      [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
      if (!user) {
        throw new Error("账号或密码错误");
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error("账号或密码错误");
      }
    }

    if (user.status === "disabled") {
      throw new Error("账号已被禁用");
    }

    // 签署 Access Token
    const accessToken = await sign(
      {
        userId: user.id,
        username: user.username,
        exp: Math.floor(Date.now() / 1000) + 60 * 120, // 2小时
      },
      JWT_ACCESS_SECRET,
    );

    // 签署 Refresh Token
    const refreshToken = await sign(
      {
        userId: user.id,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7天
      },
      JWT_REFRESH_SECRET,
    );

    // 将 Refresh Token 缓存于 Redis 作为白名单
    await redis.set(`auth:refresh_token:${user.id}`, refreshToken, "EX", 60 * 60 * 24 * 7);

    // 🚀 初始化在线会话 session，存入 Redis，生命周期与 RefreshToken 同步 (7 天)
    const onlineSession = {
      userId: user.id,
      username: user.username,
      nickname: user.nickname,
      ip,
      userAgent,
      loginTime: new Date().toISOString(),
      lastActiveTime: new Date().toISOString(),
    };
    await redis.set(
      `auth:online:${user.id}`,
      JSON.stringify(onlineSession),
      "EX",
      60 * 60 * 24 * 7,
    );

    return {
      token: accessToken,
      refreshToken,
    };
  }

  /**
   * 刷新 Access Token 逻辑
   */
  async refreshToken(refreshToken: string) {
    // 校验 Token 签名和是否过期
    const payload = await verify(refreshToken, JWT_REFRESH_SECRET, "HS256");
    const userId = payload.userId as number;

    // 校验 Redis 白名单
    const storedToken = await redis.get(`auth:refresh_token:${userId}`);
    if (storedToken !== refreshToken) {
      throw new Error("凭证已失效，请重新登录");
    }

    // 校验用户状态
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user || user.status === "disabled") {
      throw new Error("用户不存在或已被禁用");
    }

    // 签署新的 Access Token
    const newAccessToken = await sign(
      {
        userId: user.id,
        username: user.username,
        exp: Math.floor(Date.now() / 1000) + 60 * 120,
      },
      JWT_ACCESS_SECRET,
    );

    return { token: newAccessToken };
  }

  /**
   * 安全退出登录
   */
  async logout(userId: number) {
    // 1. 删除 Redis 中的 RefreshToken 白名单
    await redis.del(`auth:refresh_token:${userId}`);

    // 2. 删除缓存的用户角色与权限 Session
    await redis.del(`user:session:${userId}`);

    // 3. 删除在线用户会话 Session
    await redis.del(`auth:online:${userId}`);
  }

  async resetPasswordByPhone(phone: string, newPassword: string) {
    const [user] = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
    if (!user) {
      throw new Error("手机号未绑定账号，请先注册");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    // 清除该用户的所有在线会话缓存
    await redis.del(`user:session:${user.id}`);
    await redis.del(`auth:refresh_token:${user.id}`);
    await redis.del(`auth:online:${user.id}`);
  }
}

export const authService = new AuthService();
