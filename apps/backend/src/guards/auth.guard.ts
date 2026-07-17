/**
 * 认证守卫
 * 用于权限控制和访问保护
 */

import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";

/**
 * 权限校验守卫
 * 检查用户是否具有指定的权限码
 *
 * @param permissionCode - 权限码，如 "sys:user:list"
 * @returns Hono 中间件
 *
 * @example
 * app.use("/api/user/list", requirePermission("sys:user:list"));
 */
export const requirePermission = (permissionCode: string) => {
  return async (c: Context, next: Next) => {
    const currentUser = c.get("currentUser");
    if (!currentUser) {
      throw new HTTPException(401, { message: "未登录或登录状态失效" });
    }

    // 超管账号拥有全局系统权限，sys:admin 作为万能钥匙
    const isSuperAdmin =
      currentUser.roles.includes("ROLE_SUPER_ADMIN") ||
      currentUser.permissions.includes("sys:admin");

    if (!isSuperAdmin && !currentUser.permissions.includes(permissionCode)) {
      throw new HTTPException(403, { message: `操作拒绝：您缺少必要权限 [${permissionCode}]` });
    }

    await next();
  };
};

/**
 * 角色校验守卫
 * 检查用户是否具有指定的角色
 *
 * @param roleCode - 角色码，如 "ROLE_ADMIN"
 * @returns Hono 中间件
 *
 * @example
 * app.use("/api/admin/*", requireRole("ROLE_ADMIN"));
 */
export const requireRole = (roleCode: string) => {
  return async (c: Context, next: Next) => {
    const currentUser = c.get("currentUser");
    if (!currentUser) {
      throw new HTTPException(401, { message: "未登录或登录状态失效" });
    }

    const isSuperAdmin = currentUser.roles.includes("ROLE_SUPER_ADMIN");

    if (!isSuperAdmin && !currentUser.roles.includes(roleCode)) {
      throw new HTTPException(403, { message: `操作拒绝：您缺少必要角色 [${roleCode}]` });
    }

    await next();
  };
};

/**
 * 多权限校验守卫（AND 逻辑）
 * 用户必须同时拥有所有权限
 *
 * @param permissionCodes - 权限码数组
 * @returns Hono 中间件
 *
 * @example
 * app.use("/api/special", requireAllPermissions(["sys:user:list", "sys:user:create"]));
 */
export const requireAllPermissions = (permissionCodes: string[]) => {
  return async (c: Context, next: Next) => {
    const currentUser = c.get("currentUser");
    if (!currentUser) {
      throw new HTTPException(401, { message: "未登录或登录状态失效" });
    }

    const isSuperAdmin =
      currentUser.roles.includes("ROLE_SUPER_ADMIN") ||
      currentUser.permissions.includes("sys:admin");

    if (!isSuperAdmin) {
      const hasAll = permissionCodes.every((code) => currentUser.permissions.includes(code));
      if (!hasAll) {
        throw new HTTPException(403, {
          message: `操作拒绝：您缺少必要权限 [${permissionCodes.join(", ")}]`,
        });
      }
    }

    await next();
  };
};

/**
 * 多权限校验守卫（OR 逻辑）
 * 用户只需要拥有其中一个权限即可
 *
 * @param permissionCodes - 权限码数组
 * @returns Hono 中间件
 *
 * @example
 * app.use("/api/view", requireAnyPermission(["sys:user:list", "sys:role:list"]));
 */
export const requireAnyPermission = (permissionCodes: string[]) => {
  return async (c: Context, next: Next) => {
    const currentUser = c.get("currentUser");
    if (!currentUser) {
      throw new HTTPException(401, { message: "未登录或登录状态失效" });
    }

    const isSuperAdmin =
      currentUser.roles.includes("ROLE_SUPER_ADMIN") ||
      currentUser.permissions.includes("sys:admin");

    if (!isSuperAdmin) {
      const hasAny = permissionCodes.some((code) => currentUser.permissions.includes(code));
      if (!hasAny) {
        throw new HTTPException(403, {
          message: `操作拒绝：您缺少以下任意一个权限 [${permissionCodes.join(", ")}]`,
        });
      }
    }

    await next();
  };
};
