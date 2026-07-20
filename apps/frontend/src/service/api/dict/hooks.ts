import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";
import type { PaginatingQueryRecord, SemiTableQueryHookOptions } from "@/shared/web-ui-compose";

import { dictApi, dictKeys } from "./api";
import type {
  AllDictsResponse,
  DictDataListItem,
  DictDataListResponse,
  DictDataSearchParams,
  DictTypeListItem,
  DictTypeListResponse,
  DictTypeSearchParams,
} from "./types";

/**
 * 字典类型列表 Query Hook (支持后端翻页和过滤)
 */
export function useDictTypeQuery<Data = PaginatingQueryRecord<DictTypeListItem>>(
  params: DictTypeSearchParams,
  options?: SemiTableQueryHookOptions<PaginatingQueryRecord<DictTypeListItem>, Data>,
) {
  return useQuery<DictTypeListResponse, Error, Data>({
    ...(options as any),
    queryKey: dictKeys.typeList(params),
    queryFn: () => dictApi.listTypes(params),
    select: (res) => {
      const pageResult = {
        records: res.list,
        current: params.current,
        size: params.size,
        total: res.total,
      } satisfies PaginatingQueryRecord<DictTypeListItem>;

      if (options?.select) {
        return options.select(pageResult as any);
      }
      return pageResult as unknown as Data;
    },
  });
}

/**
 * 字典明细数据列表 Query Hook (支持后端翻页和过滤)
 */
export function useDictDataQuery<Data = PaginatingQueryRecord<DictDataListItem>>(
  params: DictDataSearchParams,
  options?: SemiTableQueryHookOptions<PaginatingQueryRecord<DictDataListItem>, Data>,
) {
  return useQuery<DictDataListResponse, Error, Data>({
    ...(options as any),
    queryKey: dictKeys.dataList(params),
    queryFn: () => dictApi.listData(params),
    select: (res) => {
      const pageResult = {
        records: res.list,
        current: params.current,
        size: params.size,
        total: res.total,
      } satisfies PaginatingQueryRecord<DictDataListItem>;

      if (options?.select) {
        return options.select(pageResult as any);
      }
      return pageResult as unknown as Data;
    },
  });
}

/**
 * 全量激活字典缓存 Query Hook (用于表单下拉绑定和表格标签转义)
 */
export function useAllDictsQuery(
  options?: Omit<UseQueryOptions<AllDictsResponse, Error>, "queryFn" | "queryKey">,
) {
  return useQuery<AllDictsResponse, Error>({
    ...options,
    queryKey: dictKeys.globalAll(),
    queryFn: () => dictApi.all(),
    staleTime: 1000 * 60 * 30, // 默认缓存 30 分钟
    gcTime: 1000 * 60 * 60, // 垃圾回收时间 1 小时
  });
}

/**
 * 业务消费字典的开箱即用 Hook
 * @param dictType 字典类型编码，例如 "sys_status"
 */
export function useDict(dictType: string) {
  const { data: dicts = {} } = useAllDictsQuery();
  const options = dicts[dictType] || [];

  // 根据键值翻译为中文 Label
  const translate = (value: string) => {
    const item = options.find((opt) => opt.value === value);
    return item ? item.label : value;
  };

  // 根据键值获取 Tag 预设颜色
  const getTagColor = (value: string) => {
    const item = options.find((opt) => opt.value === value);
    const classMap: Record<string, string> = {
      primary: "blue",
      success: "green",
      warning: "amber",
      danger: "red",
      info: "grey",
    };
    return item?.listClass ? classMap[item.listClass] || "grey" : "grey";
  };

  return {
    options,
    translate,
    getTagColor,
  };
}
