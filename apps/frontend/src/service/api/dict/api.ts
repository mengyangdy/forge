/**
 * Dict API 模块
 *
 * 基于 Hono RPC 客户端推导
 */

import { client, unwrap } from "@/service/client";

import type {
  DictDataCreateParams,
  DictDataSearchParams,
  DictDataUpdateParams,
  DictTypeCreateParams,
  DictTypeSearchParams,
  DictTypeUpdateParams,
} from "./types";

export const dictApi = {
  // 获取全量字典包
  all: () => {
    return unwrap(client.api.dict.all.$get());
  },

  // 1. 查询字典类型列表
  listTypes: (params: DictTypeSearchParams) => {
    const { current: page, size: pageSize, name, type } = params;
    const queryParams: Record<string, string> = {
      page: String(page),
      pageSize: String(pageSize),
    };
    if (name) queryParams.name = name;
    if (type) queryParams.type = type;

    return unwrap(client.api.dict.type.list.$get({ query: queryParams }));
  },

  // 2. 新增字典类型
  createType: (data: DictTypeCreateParams) => {
    return unwrap(client.api.dict.type.create.$post({ json: data }));
  },

  // 3. 修改字典类型
  updateType: (id: number, data: DictTypeUpdateParams) => {
    return unwrap(client.api.dict.type[":id"].$put({ param: { id: String(id) }, json: data }));
  },

  // 4. 删除字典类型
  removeType: (id: number) => {
    return unwrap(client.api.dict.type[":id"].$delete({ param: { id: String(id) } }));
  },

  // 5. 查询字典明细数据列表
  listData: (params: DictDataSearchParams) => {
    const { current: page, size: pageSize, dictType, label } = params;
    return unwrap(
      client.api.dict.data.list.$get({
        query: {
          page: String(page),
          pageSize: String(pageSize),
          dictType,
          ...(label ? { label } : {}),
        },
      }),
    );
  },

  // 6. 新增字典明细数据
  createData: (data: DictDataCreateParams) => {
    return unwrap(client.api.dict.data.create.$post({ json: data }));
  },

  // 7. 修改字典明细数据
  updateData: (id: number, data: DictDataUpdateParams) => {
    return unwrap(client.api.dict.data[":id"].$put({ param: { id: String(id) }, json: data }));
  },

  // 8. 删除字典明细数据
  removeData: (id: number) => {
    return unwrap(client.api.dict.data[":id"].$delete({ param: { id: String(id) } }));
  },
};

export const dictKeys = {
  all: ["dict"] as const,
  types: () => [...dictKeys.all, "types"] as const,
  typeList: (params: DictTypeSearchParams) => [...dictKeys.types(), params] as const,
  data: () => [...dictKeys.all, "data"] as const,
  dataList: (params: DictDataSearchParams) => [...dictKeys.data(), params] as const,
  globalAll: () => [...dictKeys.all, "globalAll"] as const,
};
