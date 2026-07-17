import type { Context, Next } from "hono";
import { verify } from "hono/jwt";
import { HTTPException } from "hono/http-exception";
import { db } from "../db/index.js";
import { env } from "../config.js";
import { users, userToRoles, roles, roleToPermissions, permissions } from "@forge/shared";
import { eq } from "drizzle-orm";
import { redis } from "../db/redis.js";

/**
 * 全局用户 JWT 鉴权中间件
 * 自动关联角色与权限，并将用户信息缓存到 Redis
 */
export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new HTTPException(401, { message: "缺少 Authorization Bearer Token" });
  }

  const token = authHeader.substring(7);

  try {
    const payload = await verify(token, env.JWT_ACCESS_SECRET, "HS256");
    const userId = payload.userId as number;

    // 🚀 0. 检验 Redis 在线状态锁，实现即时强退 (Kickout)
    const onlineSessionStr = await redis.get(`auth:online:${userId}`);
    if (!onlineSessionStr) {
      throw new HTTPException(401, { message: "您的会话已失效，或已被管理员强制下线，请重新登录" });
    }

    // 节流更新在线活跃时间 (上次活跃超 1 分钟才写入)
    try {
      const onlineSession = JSON.parse(onlineSessionStr);
      const now = Date.now();
      const lastActive = new Date(onlineSession.lastActiveTime).getTime();
      if (now - lastActive > 60 * 1000) {
        onlineSession.lastActiveTime = new Date().toISOString();
        await redis.set(
          `auth:online:${userId}`,
          JSON.stringify(onlineSession),
          "EX",
          60 * 60 * 24 * 7,
        );
      }
    } catch {}

    const cacheKey = `user:session:${userId}`;

    // 🚀 1. 尝试从 Redis 中获取已经缓存的用户角色和权限信息
    const cachedSession = await redis.get(cacheKey);
    if (cachedSession) {
      const currentUser = JSON.parse(cachedSession);
      c.set("currentUser", currentUser);
      return await next();
    }

    // 2. 缓存未命中：从 PostgreSQL 数据库查询用户信息
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user || user.status === "disabled") {
      throw new HTTPException(401, { message: "用户不存在或已被禁用" });
    }

    // 🚀 获取用户所属的角色列表
    const userRolesList = await db
      .select({ code: roles.code })
      .from(userToRoles)
      .innerJoin(roles, eq(userToRoles.roleId, roles.id))
      .where(eq(userToRoles.userId, userId));

    const roleCodes = userRolesList.map((r) => r.code);

    // 获取角色对应的核心权限列表
    let permissionCodes: string[] = [];
    if (roleCodes.length > 0) {
      const userPermissionsList = await db
        .select({ code: permissions.code })
        .from(userToRoles)
        .innerJoin(roleToPermissions, eq(userToRoles.userId, roleToPermissions.roleId))
        .innerJoin(permissions, eq(roleToPermissions.permissionId, permissions.id))
        .where(eq(userToRoles.userId, userId));

      permissionCodes = Array.from(new Set(userPermissionsList.map((p) => p.code)));
    }

    const currentUser = {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      roles: roleCodes,
      permissions: permissionCodes,
    };

    // 🚀 3. 写入 Redis 缓存，过期时间设为 10 分钟 (600 秒)
    await redis.set(cacheKey, JSON.stringify(currentUser), "EX", 600);

    // 写入强类型 Hono Context variables，后续逻辑中 c.get("currentUser") 完美提示！
    c.set("currentUser", currentUser);

    await next();
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    throw new HTTPException(401, { message: "登录凭证已过期或无效" });
  }
};
