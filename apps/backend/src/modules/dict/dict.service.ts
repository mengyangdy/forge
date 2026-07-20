import { db } from "../../db/index.js";
import { dictTypes, dictData } from "@forge/shared";
import { eq, and, like, sql, asc, inArray } from "drizzle-orm";
import { redis } from "../../db/redis.js";

const CACHE_KEY = "sys:dict:all";

export class DictService {
  // 清除 Redis 字典全局缓存
  async clearCache() {
    try {
      await redis.del(CACHE_KEY);
    } catch (err) {
      console.warn("⚠️ [Redis] 清除字典缓存失败:", err);
    }
  }

  // 1. 获取全量激活的字典包 (带有双重 Redis 缓存机制)
  async getAllDicts() {
    // 尝试读取 Redis 缓存
    try {
      const cached = await redis.get(CACHE_KEY);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {}
      }
    } catch (err) {
      console.warn("⚠️ [Redis] 读取字典缓存失败，回退数据库:", err);
    }

    // 缓存未命中：从数据库拉取
    const activeTypes = await db
      .select({ type: dictTypes.type })
      .from(dictTypes)
      .where(eq(dictTypes.status, "active"));

    const activeTypeCodes = activeTypes.map((t) => t.type);

    if (activeTypeCodes.length === 0) {
      return {};
    }

    const allData = await db
      .select({
        dictType: dictData.dictType,
        label: dictData.label,
        value: dictData.value,
        listClass: dictData.listClass,
      })
      .from(dictData)
      .where(and(eq(dictData.status, "active"), inArray(dictData.dictType, activeTypeCodes)))
      .orderBy(asc(dictData.sort));

    // 分组组装字典包
    const dictMap: Record<string, { label: string; value: string; listClass: string | null }[]> =
      {};

    for (const data of allData) {
      if (!dictMap[data.dictType]) {
        dictMap[data.dictType] = [];
      }
      dictMap[data.dictType].push({
        label: data.label,
        value: data.value,
        listClass: data.listClass,
      });
    }

    // 写入 Redis 缓存，失效时间 24 小时 (86400 秒)
    try {
      await redis.set(CACHE_KEY, JSON.stringify(dictMap), "EX", 86400);
    } catch (err) {
      console.warn("⚠️ [Redis] 写入字典缓存失败:", err);
    }

    return dictMap;
  }

  // =================== 字典类型管理 (CRUD) ===================

  async listTypes(page: number, pageSize: number, filters: { name?: string; type?: string }) {
    const offset = (page - 1) * pageSize;
    const whereClauses = [];

    if (filters.name) {
      whereClauses.push(like(dictTypes.name, `%${filters.name}%`));
    }
    if (filters.type) {
      whereClauses.push(like(dictTypes.type, `%${filters.type}%`));
    }

    const where = and(...whereClauses);

    const list = await db
      .select()
      .from(dictTypes)
      .where(where)
      .limit(pageSize)
      .offset(offset)
      .orderBy(dictTypes.id);

    const [countRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(dictTypes)
      .where(where);
    const total = Number(countRes?.count || 0);

    return { list, total };
  }

  async createType(data: {
    name: string;
    type: string;
    status: string;
    description?: string | null;
  }) {
    const [exists] = await db
      .select()
      .from(dictTypes)
      .where(eq(dictTypes.type, data.type))
      .limit(1);

    if (exists) {
      throw new Error("字典类型唯一标识已存在");
    }

    const [newType] = await db.insert(dictTypes).values(data).returning();
    await this.clearCache();
    return newType;
  }

  async updateType(
    id: number,
    data: { name: string; type: string; status: string; description?: string | null },
  ) {
    // 检查冲突
    const [exists] = await db
      .select()
      .from(dictTypes)
      .where(and(eq(dictTypes.type, data.type), sql`${dictTypes.id} != ${id}`))
      .limit(1);

    if (exists) {
      throw new Error("该字典类型唯一标识已被占用");
    }

    const [oldType] = await db.select().from(dictTypes).where(eq(dictTypes.id, id)).limit(1);

    const result = await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(dictTypes)
        .set(data)
        .where(eq(dictTypes.id, id))
        .returning();

      // 如果修改了 type 标识，级联更新明细表里的类型标识
      if (oldType && oldType.type !== data.type) {
        await tx
          .update(dictData)
          .set({ dictType: data.type })
          .where(eq(dictData.dictType, oldType.type));
      }
      return updated;
    });

    await this.clearCache();
    return result;
  }

  async deleteType(id: number) {
    const [oldType] = await db.select().from(dictTypes).where(eq(dictTypes.id, id)).limit(1);
    if (!oldType) return;

    await db.transaction(async (tx) => {
      // 级联物理删除关联的字典数据明细
      await tx.delete(dictData).where(eq(dictData.dictType, oldType.type));
      await tx.delete(dictTypes).where(eq(dictTypes.id, id));
    });

    await this.clearCache();
  }

  // =================== 字典数据项明细管理 (CRUD) ===================

  async listData(page: number, pageSize: number, dictType: string, label?: string) {
    const offset = (page - 1) * pageSize;
    const whereClauses = [eq(dictData.dictType, dictType)];

    if (label) {
      whereClauses.push(like(dictData.label, `%${label}%`));
    }

    const where = and(...whereClauses);

    const list = await db
      .select()
      .from(dictData)
      .where(where)
      .limit(pageSize)
      .offset(offset)
      .orderBy(asc(dictData.sort));

    const [countRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(dictData)
      .where(where);
    const total = Number(countRes?.count || 0);

    return { list, total };
  }

  async createData(data: {
    dictType: string;
    label: string;
    value: string;
    sort?: number;
    listClass?: string | null;
    status: string;
    description?: string | null;
  }) {
    const [newVal] = await db.insert(dictData).values(data).returning();
    await this.clearCache();
    return newVal;
  }

  async updateData(
    id: number,
    data: {
      dictType: string;
      label: string;
      value: string;
      sort?: number;
      listClass?: string | null;
      status: string;
      description?: string | null;
    },
  ) {
    const [updated] = await db.update(dictData).set(data).where(eq(dictData.id, id)).returning();
    await this.clearCache();
    return updated;
  }

  async deleteData(id: number) {
    await db.delete(dictData).where(eq(dictData.id, id));
    await this.clearCache();
  }
}

export const dictService = new DictService();
