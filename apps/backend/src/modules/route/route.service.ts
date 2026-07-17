import { db } from "../../db/index.js";
import { permissions, userToRoles, roleToPermissions } from "@forge/shared";
import { eq, and, inArray } from "drizzle-orm";

export class RouteService {
  async getUserRoutes(userId: number) {
    // 1. 获取用户的角色
    const userRoles = await db
      .select({ roleId: userToRoles.roleId })
      .from(userToRoles)
      .where(eq(userToRoles.userId, userId));

    if (userRoles.length === 0) {
      return { home: "home", routes: [] };
    }

    const roleIds = userRoles.map((r) => r.roleId);

    // 2. 查询这些角色下激活的菜单和目录权限
    const userPermissionsList = await db
      .select({
        id: permissions.id,
        code: permissions.code,
        name: permissions.name,
        type: permissions.type,
        parentId: permissions.parentId,
        routeName: permissions.routeName,
        routePath: permissions.routePath,
        component: permissions.component,
        pathParam: permissions.pathParam,
        i18nKey: permissions.i18nKey,
        order: permissions.order,
        iconType: permissions.iconType,
        icon: permissions.icon,
        status: permissions.status,
      })
      .from(roleToPermissions)
      .innerJoin(permissions, eq(roleToPermissions.permissionId, permissions.id))
      .where(
        and(
          inArray(roleToPermissions.roleId, roleIds),
          eq(permissions.status, "active"),
          inArray(permissions.type, ["menu", "catalogue"]),
        ),
      );

    // 3. 去重并按照 order 排序
    const uniqueMap = new Map<number, (typeof userPermissionsList)[0]>();
    for (const item of userPermissionsList) {
      uniqueMap.set(item.id, item);
    }
    const sortedList = Array.from(uniqueMap.values()).sort((a, b) => a.order - b.order);

    // 4. 将扁平数据格式化为前端路由 Payload 结构
    const routesPayload = sortedList.map((p) => {
      const handle = {
        title: p.name,
        icon: p.icon,
        order: p.order,
        type: p.type as "menu" | "catalogue",
        i18nKey: p.i18nKey,
        localIcon: p.iconType === "local" ? p.icon : null,
      };

      return {
        id: p.id,
        parentId: p.parentId,
        path: p.routePath || "",
        name: p.routeName || "",
        layout: p.parentId === null ? ("admin" as const) : undefined,
        handle,
      };
    });

    // 5. 构建树形结构
    const payloadMap = new Map<number, any>();
    const roots: any[] = [];

    for (const item of routesPayload) {
      payloadMap.set(item.id, { ...item, children: [] });
    }

    for (const item of routesPayload) {
      const node = payloadMap.get(item.id);
      if (item.parentId && payloadMap.has(item.parentId)) {
        payloadMap.get(item.parentId).children.push(node);
      } else {
        roots.push(node);
      }
    }

    // 清理空子集数组
    function cleanChildren(nodes: any[]) {
      for (const node of nodes) {
        if (node.children && node.children.length === 0) {
          delete node.children;
        } else if (node.children) {
          cleanChildren(node.children);
        }
      }
    }
    cleanChildren(roots);

    return {
      home: "/home",
      routes: roots,
    };
  }
}

export const routeService = new RouteService();
