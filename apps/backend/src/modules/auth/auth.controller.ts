import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { authService } from "./auth.service.js";
import { HTTPException } from "hono/http-exception";
import { authMiddleware } from "../../middlewares/auth.js";

import { success } from "../../utils/response.js";

const app = new OpenAPIHono();

// Refresh Token 校验 Schema
const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "缺少 Refresh Token"),
});

// Logout 校验 Schema
const logoutSchema = z.object({
  userId: z.number(),
});

// Register 校验 Schema
const registerSchema = z.object({
  username: z.string().min(2, "用户名最少 2 个字符").max(50),
  password: z.string().min(6, "密码最少 6 位"),
  nickname: z.string().max(50).nullable().optional(),
  phone: z.string().max(11).nullable().optional(),
});

// 1. 注册
const registerRoute = createRoute({
  method: "post",
  path: "/register",
  summary: "用户自主注册",
  tags: ["认证模块 Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: registerSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.number(),
            message: z.string(),
            data: z.object({
              id: z.number(),
              username: z.string(),
              nickname: z.string().nullable(),
              status: z.string(),
            }),
          }),
        },
      },
      description: "注册成功",
    },
  },
});

// 2. 初始化超级管理员用户
const initAdminRoute = createRoute({
  method: "post",
  path: "/init-admin",
  summary: "初始化超级管理员账号",
  tags: ["认证模块 Auth"],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.number(),
            message: z.string(),
            data: z.object({
              username: z.string(),
              nickname: z.string(),
            }),
          }),
        },
      },
      description: "初始化成功",
    },
  },
});

const passwordLoginSchema = z.object({
  type: z.literal("password").optional(),
  username: z.string().min(1, "用户名不能为空"),
  password: z.string().min(1, "密码不能为空"),
});

const codeLoginSchema = z.object({
  type: z.literal("code"),
  phone: z.string().min(11, "手机号格式不正确").max(11),
  code: z.string().min(1, "验证码不能为空"),
});

const loginUnionSchema = z.union([passwordLoginSchema, codeLoginSchema]);

// 3. 登录
const loginRoute = createRoute({
  method: "post",
  path: "/login",
  summary: "用户登录",
  tags: ["认证模块 Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: loginUnionSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            code: z.number(),
            data: z.object({
              token: z.string(),
              refreshToken: z.string(),
            }),
          }),
        },
      },
      description: "登录成功",
    },
  },
});

// 4. 刷新token
const refreshTokenRoute = createRoute({
  method: "post",
  path: "/refresh-token",
  summary: "刷新 Access Token",
  tags: ["认证模块 Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: refreshTokenSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.number(),
            data: z.object({
              token: z.string(),
            }),
          }),
        },
      },
      description: "刷新成功",
    },
  },
});

// 5. 登出
const logoutRoute = createRoute({
  method: "post",
  path: "/logout",
  summary: "安全退出登录",
  tags: ["认证模块 Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: logoutSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.number(),
            message: z.string(),
          }),
        },
      },
      description: "退出登录成功",
    },
  },
});

// 6. 获取用户信息
const getUserInfoRoute = createRoute({
  method: "get",
  path: "/getUserInfo",
  summary: "获取当前登录用户信息",
  tags: ["认证模块 Auth"],
  security: [{ BearerAuth: [] }],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.number(),
            data: z.object({
              userId: z.string(),
              username: z.string(),
              nickname: z.string().nullable(),
              roles: z.array(z.string()),
              buttons: z.array(z.string()),
            }),
          }),
        },
      },
      description: "成功获取用户信息",
    },
  },
});

// 7. 重置密码
const resetPasswordSchema = z.object({
  phone: z.string().min(11, "手机号格式不正确").max(11),
  password: z.string().min(6, "新密码最少 6 位"),
  code: z.string().min(1, "验证码不能为空"),
});

const resetPasswordRoute = createRoute({
  method: "post",
  path: "/reset-password",
  summary: "重置密码",
  tags: ["认证模块 Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: resetPasswordSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.number(),
            message: z.string(),
          }),
        },
      },
      description: "密码重置成功",
    },
  },
});

app.use("/getUserInfo", authMiddleware);

const routes = app
  .openapi(registerRoute, async (c) => {
    try {
      const { username, password, nickname, phone } = c.req.valid("json");
      const result = await authService.register(username, password, nickname, phone);
      return c.json(
        {
          code: 0,
          message: "注册成功，欢迎加入 Forge！",
          data: result,
        },
        200,
      );
    } catch (error: any) {
      const status =
        error.message.includes("已被注册") ||
        error.message.includes("已被使用") ||
        error.message.includes("已被")
          ? 400
          : 500;
      throw new HTTPException(status, { message: error.message });
    }
  })
  .openapi(initAdminRoute, async (c) => {
    try {
      const result = await authService.initAdmin();
      return c.json(
        {
          code: 0,
          message: "Forge 初始超管账号制造成功！",
          data: result,
        },
        200,
      );
    } catch (error: any) {
      const status = error.message.includes("已初始化") ? 400 : 500;
      throw new HTTPException(status, { message: error.message });
    }
  })
  .openapi(loginRoute, async (c) => {
    try {
      const body = c.req.valid("json");
      const ip = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || null;
      const userAgent = c.req.header("user-agent") || null;
      const result = await authService.login(body, ip, userAgent);
      return c.json(success(result, "登录成功"), 200);
    } catch (error: any) {
      const status =
        error.message.includes("错误") ||
        error.message.includes("禁用") ||
        error.message.includes("验证码")
          ? 400
          : 500;
      throw new HTTPException(status, { message: error.message });
    }
  })
  .openapi(refreshTokenRoute, async (c) => {
    try {
      const { refreshToken } = c.req.valid("json");
      const result = await authService.refreshToken(refreshToken);
      return c.json(
        {
          code: 0,
          data: result,
        },
        200,
      );
    } catch (error: any) {
      const status = error.message.includes("过期") || error.message.includes("失效") ? 401 : 403;
      throw new HTTPException(status, { message: error.message });
    }
  })
  .openapi(logoutRoute, async (c) => {
    try {
      const { userId } = c.req.valid("json");
      await authService.logout(userId);
      return c.json(
        {
          code: 0,
          message: "已安全退出登录",
        },
        200,
      );
    } catch (error: any) {
      throw new HTTPException(500, { message: "退出登录失败: " + error.message });
    }
  })
  .openapi(getUserInfoRoute, async (c) => {
    const currentUser = c.get("currentUser");
    if (!currentUser) {
      throw new HTTPException(401, { message: "未登录或登录状态已失效" });
    }

    return c.json(
      {
        code: 0,
        data: {
          userId: String(currentUser.id),
          username: currentUser.username,
          nickname: currentUser.nickname,
          roles: currentUser.roles,
          buttons: currentUser.permissions,
        },
      },
      200,
    );
  })
  .openapi(resetPasswordRoute, async (c) => {
    try {
      const { phone, password } = c.req.valid("json");
      await authService.resetPasswordByPhone(phone, password);
      return c.json({ code: 0, message: "密码重置成功，请使用新密码重新登录" }, 200);
    } catch (error: any) {
      const status =
        error.message.includes("未绑定") || error.message.includes("不存在") ? 400 : 500;
      throw new HTTPException(status, { message: error.message });
    }
  });

export default routes;
