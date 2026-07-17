import { OpenAPIHono } from "@hono/zod-openapi";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { Scalar } from "@scalar/hono-api-reference";
import auth from "./modules/auth/auth.controller.js";
import user from "./modules/user/user.controller.js";
import role from "./modules/role/role.controller.js";
import permission from "./modules/permission/permission.controller.js";
import department from "./modules/department/department.controller.js";
import systemLog from "./modules/system-log/system-log.controller.js";
import project from "./modules/project/project.controller.js";
import online from "./modules/system-online/online.controller.js";
import dict from "./modules/dict/dict.controller.js";
import storage from "./modules/storage/storage.controller.js";
import { serveStatic } from "@hono/node-server/serve-static";
import job from "./modules/job/job.controller.js";
import { jobService } from "./modules/job/job.service.js";
import route from "./modules/route/route.controller.js";

import { env } from "./config.js";
import { loggerMiddleware } from "./logger.js";
import { operationLogMiddleware } from "./middlewares/operation-log.js";
import { accessLogMiddleware } from "./middlewares/access-log.js";
import { globalExceptionFilter } from "./filters/index.js";
import { responseInterceptor } from "./interceptors/index.js";

const app = new OpenAPIHono();

// 注册 Bearer JWT 认证安全组件（在所有挂载的路由中可被描述为安全校验方式）
app.openAPIRegistry.registerComponent("securitySchemes", "BearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
  description: "请输入登录后返回的 accessToken。格式为 Bearer {token}",
});

// 1. 网络安全加固、跨域配置与请求追踪日志
app.use("/api/*", secureHeaders());
app.use("/uploads/*", serveStatic({ root: "./public" }));
app.use(
  "/*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);
app.use("*", loggerMiddleware);
app.use("/api/*", accessLogMiddleware);
app.use("/api/*", operationLogMiddleware);

// 2. 统一成功与失败响应拦截中间件
app.use("*", responseInterceptor);

// 3. 统一错误/异常处理
app.onError(globalExceptionFilter);

app.get("/", (c) => c.text("Forge Backend is Running v0.1.0"));

// 动态导出 OpenAPI 规约 JSON，聚合所有 api 路由的定义信息
// 注意：OpenAPI 文档路径仍保持 /api/openapi.json，因为 routes 是挂载在 /api 下的
app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: {
    title: "Forge Admin API Reference",
    version: "1.0.0",
    description: "Forge Admin 企业级全栈管理系统后端接口文档，基于 Hono & Scalar 构建。",
  },
});

// OpenAPI 文档的完整路径会是 /api/openapi.json
app.get(
  "/scalar",
  Scalar({
    pageTitle: "Forge Admin API Reference",
    spec: {
      url: "/openapi.json",
    },
  }),
);

// 挂载子路由器并进行链式调用，以导出类型安全的 AppType 路由定义
// 统一使用 /api 前缀，避免在每个路由中重复添加
const api = new OpenAPIHono();

api
  .route("/auth", auth)
  .route("/user", user)
  .route("/role", role)
  .route("/permission", permission)
  .route("/system-log", systemLog)
  .route("/project", project)
  .route("/system-online", online)
  .route("/dict", dict)
  .route("/storage", storage)
  .route("/jobs", job)
  .route("/department", department)
  .route("/route", route);

// 将所有API路由挂载到 /api 路径下
const routes = app.route("/api", api);

const port = env.PORT;

// 初始化定时任务中心和 Workers
await jobService.init();

serve({ fetch: app.fetch, port });
console.log(`Forge Backend listening on http://localhost:${port}`);

export type AppType = typeof routes;
