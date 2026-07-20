import { db } from "../../db/index.js";
import { permissions } from "@forge/shared";
import { eq, asc } from "drizzle-orm";

export class PermissionService {
  async list() {
    return await db.select().from(permissions).orderBy(asc(permissions.order), asc(permissions.id));
  }

  async tree() {
    const list = await this.list();
    const map = new Map<number, any>();
    const roots: any[] = [];

    // 初始化 Map，克隆数据并添加 children 属性
    for (const item of list) {
      map.set(item.id, { ...item, children: [] });
    }

    // 建立树形双向父子关联
    for (const item of list) {
      const node = map.get(item.id);
      if (item.parentId && map.has(item.parentId)) {
        map.get(item.parentId).children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  async create(data: {
    code?: string;
    name: string;
    type: "menu" | "button" | "catalogue";
    parentId?: number | null;
    routeName?: string | null;
    routePath?: string | null;
    component?: string | null;
    pathParam?: string | null;
    i18nKey?: string | null;
    order?: number;
    iconType?: string;
    icon?: string | null;
    status?: string;
    buttons?: { code: string; name: string }[];
  }) {
    const { buttons, ...menuData } = data;

    if (!menuData.code) {
      menuData.code =
        "menu:" +
        (menuData.routeName ||
          menuData.routePath?.replace(/\//g, "_").replace(/^_/, "") ||
          Math.random().toString(36).substring(2, 9));
    }

    return await db.transaction(async (tx) => {
      const [menuResult] = await tx
        .insert(permissions)
        .values(menuData as any)
        .returning();

      if (buttons && buttons.length > 0 && menuResult.type === "menu") {
        const buttonValues = buttons.map((btn) => ({
          code: btn.code,
          name: btn.name,
          type: "button" as const,
          parentId: menuResult.id,
          status: menuResult.status ?? "active",
        }));
        await tx.insert(permissions).values(buttonValues);
      }

      return menuResult;
    });
  }

  async update(
    id: number,
    data: {
      code?: string;
      name: string;
      type: "menu" | "button" | "catalogue";
      parentId?: number | null;
      routeName?: string | null;
      routePath?: string | null;
      component?: string | null;
      pathParam?: string | null;
      i18nKey?: string | null;
      order?: number;
      iconType?: string;
      icon?: string | null;
      status?: string;
    },
  ) {
    if (!data.code) {
      data.code =
        "menu:" +
        (data.routeName ||
          data.routePath?.replace(/\//g, "_").replace(/^_/, "") ||
          Math.random().toString(36).substring(2, 9));
    }

    const [result] = await db
      .update(permissions)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(permissions.id, id))
      .returning();
    return result;
  }

  async delete(id: number) {
    // 检查是否有子级节点，防止产生孤立节点
    const children = await db
      .select()
      .from(permissions)
      .where(eq(permissions.parentId, id))
      .limit(1);
    if (children.length > 0) {
      throw new Error("该菜单权限下包含子节点，请先删除子节点");
    }
    const [result] = await db.delete(permissions).where(eq(permissions.id, id)).returning();
    return result;
  }

  async deleteMany(ids: number[]) {
    return await db.transaction(async (tx) => {
      const results = [];
      for (const id of ids) {
        const children = await tx
          .select()
          .from(permissions)
          .where(eq(permissions.parentId, id))
          .limit(1);
        if (children.length > 0 && !ids.includes(children[0].id)) {
          throw new Error("该菜单权限下包含子节点，请先删除子节点");
        }
        const [result] = await tx.delete(permissions).where(eq(permissions.id, id)).returning();
        results.push(result);
      }
      return results;
    });
  }
}

export const permissionService = new PermissionService();
