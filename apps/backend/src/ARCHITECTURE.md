# Backend 架构说明

本项目采用类似 NestJS 的模块化架构，将不同职责的代码分离到不同的文件夹中。

## 目录结构

```
src/
├── constants/        # 常量和配置
│   ├── pg-errors.ts     # PostgreSQL 错误码映射
│   └── index.ts
├── filters/          # 异常过滤器 - 统一处理错误
│   ├── exception.filter.ts
│   └── index.ts
├── guards/           # 守卫 - 权限控制和访问保护
│   ├── auth.guard.ts
│   ├── role.guard.ts
│   └── index.ts
├── interceptors/     # 拦截器 - 响应拦截和转换
│   ├── response.interceptor.ts
│   └── index.ts
├── middlewares/      # 中间件 - 请求预处理
│   ├── access-log.ts
│   ├── auth.ts
│   ├── operation-log.ts
│   └── index.ts
├── pipes/            # 管道 - 数据验证和转换
│   ├── validation.pipe.ts
│   └── index.ts
└── modules/          # 业务模块
    ├── auth/
    ├── user/
    └── ...
```

## 各模块职责

### 1. Constants (常量)

用于存放项目中的常量、配置映射等固定数据。

**已实现：**

- `PG_ERROR_MAP`: PostgreSQL 错误码到用户友好提示的映射表（支持 50+ 种错误码）
- `isDatabaseError()`: 判断是否为数据库错误
- `getDbErrorMessage()`: 获取数据库错误的友好提示
- `getDbErrorInfo()`: 获取完整的错误信息对象

**示例使用：**

```typescript
import { getDbErrorInfo, PG_ERROR_MAP } from "./constants/index.js";

const { isDbError, message, code } = getDbErrorInfo(err);
if (isDbError) {
  console.log(`数据库错误码: ${code}, 提示: ${message}`);
}
```

**支持的错误类型：**

- 完整性约束违反 (23503, 23505, 23502, 23514)
- 事务回滚 (40P01)
- 资源不足 (53000, 53100, 53200, 53300)
- 操作中断 (57000, 57014)
- 连接异常 (08000, 08003, 08004, 08006, 08007)
- 语法错误或访问规则违反 (42000, 42501, 42601, 42602, 42622, 42939)
- 数据异常 (22000, 22001, 22003, 22004, 22005, 22012, 22021, 22026)
- 无效事务状态 (25000, 25001, 25006)
- 对象不在先决条件状态 (55000, 55006, 55P02, 55P03)
- PL/pgSQL 错误 (P0000, P0001, P0002, P0003, P0004)

### 2. Filters (过滤器)

用于捕获和处理应用程序中的异常，类似 NestJS 的 Exception Filter。

**示例使用：**

```typescript
import { globalExceptionFilter } from "./filters/index.js";

app.onError(globalExceptionFilter);
```

**已实现：**

- `globalExceptionFilter`: 全局异常过滤器，处理所有错误并记录日志

### 2. Interceptors (拦截器)

用于在响应发送给客户端之前或之后执行逻辑，类似 NestJS 的 Interceptor。

**示例使用：**

```typescript
import { responseInterceptor } from "./interceptors/index.js";

app.use("*", responseInterceptor);
```

**已实现：**

- `responseInterceptor`: 统一响应格式，为 Context 添加 `ok()` 和 `fail()` 方法

### 3. Guards (守卫)

用于权限控制，决定请求是否能够到达路由处理器，类似 NestJS 的 Guard。

**示例使用：**

```typescript
import { roleGuard, permissionGuard } from "./guards/index.js";

// 只有管理员可以访问
app.use("/api/admin/*", roleGuard(["admin"]));

// 需要特定权限
app.use("/api/users/*", permissionGuard(["user:read", "user:write"]));
```

**已实现：**

- `roleGuard`: 角色守卫，检查用户角色
- `permissionGuard`: 权限守卫，检查用户权限
- `superAdminGuard`: 超级管理员守卫

### 4. Pipes (管道)

用于数据验证和转换，在请求数据到达处理器之前进行处理，类似 NestJS 的 Pipe。

**示例使用：**

```typescript
import { validationPipe, parseIntPipe } from "./pipes/index.js";
import { z } from "zod";

// 验证请求体
const userSchema = z.object({
  username: z.string(),
  email: z.string().email(),
});

app.use("/api/users", validationPipe(userSchema));

// 转换参数
app.use("/api/users/:id", parseIntPipe("id"));
```

**已实现：**

- `validationPipe`: Zod schema 验证管道
- `parseIntPipe`: 参数转换为整数管道

### 5. Middlewares (中间件)

用于请求预处理，如日志记录、认证等。

**示例使用：**

```typescript
import { loggerMiddleware } from "./logger.js";
import { accessLogMiddleware, operationLogMiddleware } from "./middlewares/index.js";

app.use("*", loggerMiddleware);
app.use("/api/*", accessLogMiddleware);
app.use("/api/*", operationLogMiddleware);
```

**已实现：**

- `loggerMiddleware`: 请求日志中间件
- `accessLogMiddleware`: 访问日志中间件
- `operationLogMiddleware`: 操作日志中间件
- `authMiddleware`: JWT 认证中间件

## 执行顺序

在 Hono 中，中间件的执行顺序非常重要：

```typescript
// 1. 安全和跨域配置
app.use("/api/*", secureHeaders());
app.use("/*", cors());

// 2. 日志中间件
app.use("*", loggerMiddleware);
app.use("/api/*", accessLogMiddleware);
app.use("/api/*", operationLogMiddleware);

// 3. 拦截器（响应格式化）
app.use("*", responseInterceptor);

// 4. 全局异常过滤器
app.onError(globalExceptionFilter);
```

## 扩展指南

### 添加新的过滤器

在 `filters/` 目录下创建新文件：

```typescript
// filters/custom.filter.ts
export async function customFilter(err: Error, c: Context) {
  // 处理特定类型的错误
  return c.json({ code: 400, message: "自定义错误消息" }, 400);
}

// filters/index.ts
export * from "./custom.filter.js";
```

### 添加新的守卫

在 `guards/` 目录下创建新文件：

```typescript
// guards/custom.guard.ts
export function customGuard() {
  return async (c: Context, next: Next) => {
    // 检查条件
    if (!someCondition) {
      return c.json({ code: 403, message: "访问被拒绝" }, 403);
    }
    await next();
  };
}

// guards/index.ts
export * from "./custom.guard.js";
```

### 添加新的管道

在 `pipes/` 目录下创建新文件：

```typescript
// pipes/custom.pipe.ts
export function customPipe() {
  return async (c: Context, next: Next) => {
    // 转换或验证数据
    const data = await c.req.json();
    const transformed = transformData(data);
    c.set("transformedData", transformed);
    await next();
  };
}

// pipes/index.ts
export * from "./custom.pipe.js";
```

## 最佳实践

1. **单一职责**：每个过滤器、守卫、管道只负责一件事
2. **命名规范**：使用 `.filter.ts`、`.guard.ts`、`.pipe.ts`、`.interceptor.ts` 后缀
3. **导出模块**：每个文件夹都有 `index.ts` 统一导出
4. **类型安全**：使用 TypeScript 和 Zod 确保类型安全
5. **错误处理**：在过滤器中统一处理所有异常
6. **日志记录**：在适当的中间件中记录必要的日志信息
