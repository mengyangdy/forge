/**
 * 守卫示例
 * 类似 NestJS 的 Guard，用于权限控制和访问保护
 *
 * 使用示例：
 * app.use('/api/admin/*', roleGuard(['admin']))
 */

import type { Context, Next } from "hono";

/**
 * 角色守卫工厂函数
 * 创建一个守卫中间件，用于检查用户是否具有指定角色
 */
export function roleGuard(allowedRoles: string[]) {
  return async (c: Context, next: Next) => {
    const user = c.get("user");

    if (!user) {
      return c.json(
        {
          code: 401,
          message: "未授权访问",
        },
        401,
      );
    }

    if (!allowedRoles.includes(user.role)) {
      return c.json(
        {
          code: 403,
          message: "权限不足",
        },
        403,
      );
    }

    await next();
  };
}

/**
 * 权限守卫工厂函数
 * 创建一个守卫中间件，用于检查用户是否具有指定权限
 */
export function permissionGuard(requiredPermissions: string[]) {
  return async (c: Context, next: Next) => {
    const user = c.get("user");

    if (!user) {
      return c.json(
        {
          code: 401,
          message: "未授权访问",
        },
        401,
      );
    }

    const userPermissions = user.permissions || [];
    const hasPermission = requiredPermissions.every((perm) => userPermissions.includes(perm));

    if (!hasPermission) {
      return c.json(
        {
          code: 403,
          message: "权限不足",
        },
        403,
      );
    }

    await next();
  };
}

/**
 * 超级管理员守卫
 * 仅允许超级管理员访问
 */
export const superAdminGuard = roleGuard(["super_admin"]);
