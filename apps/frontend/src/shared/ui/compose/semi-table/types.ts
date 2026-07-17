import type { ColumnProps, TableProps } from "@douyinfe/semi-ui/lib/es/table";
import type { FormApi } from "@douyinfe/semi-ui/lib/es/form";
import type { QueryKey, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { Key, ReactNode } from "react";

/** 后端分页列表的最小结构（表格 hook 共用约定）。 */
export interface PaginatingQueryRecord<T = any> {
  current: number;
  records: T[];
  size: number;
  total: number;
}

export type GetTableDataFromResponse<Response> =
  Response extends PaginatingQueryRecord<infer T> ? T : never;

export type TableDataWithIndex<T> = T & {
  index: number;
};

/** Semi 表格列。 */
export type SemiTableColumn<T extends Record<string, any> = any> = ColumnProps<T>;

export type SemiTableColumnFixed = "left" | "right" | "unFixed";

export type SemiTableColumnCheckTitle = ReactNode | ((...args: any[]) => ReactNode);

export interface SemiTableColumnCheck {
  checked: boolean;
  fixed: SemiTableColumnFixed;
  key: string;
  title: SemiTableColumnCheckTitle;
  visible: boolean;
}

export interface PaginationData<T = any> {
  data: T[];
  pageNum: number;
  pageSize: number;
  total: number;
}

export type SemiTableQueryHookOptions<Response, Data = Response> = Omit<
  UseQueryOptions<Response, Error, Data, QueryKey>,
  "queryFn" | "queryKey"
>;

export type SemiTableQueryHook<Params, Response> = <Data = Response>(
  params: Params,
  options?: SemiTableQueryHookOptions<Response, Data>,
) => UseQueryResult<Data, Error>;

export interface SemiTableConfig<
  Params extends Record<string, any>,
  Response,
  T extends Record<string, any> = any,
> {
  apiParams?: Partial<Params>;
  columns: () => SemiTableColumn<TableDataWithIndex<T>>[];
  enabled?: boolean;
  getColumnVisible?: (column: SemiTableColumn<TableDataWithIndex<T>>) => boolean;
  immediate?: boolean;
  onFetched?: (data: PaginationData<TableDataWithIndex<T>>) => Promise<void> | void;
  queryHook: SemiTableQueryHook<Params, Response>;
  queryOptions?: SemiTableQueryHookOptions<Response, T>;
  rowKey?: TableProps<TableDataWithIndex<T>>["rowKey"];
  transformer?: (response: Response) => PaginationData<T>;
  transformParams?: (params: Params) => Params;
}

export interface SemiSearchFormProps<T extends Record<string, any> = Record<string, any>> {
  children: ReactNode;
  formApi: FormApi<T> | null;
  getFormApi: (api: FormApi<T>) => void;
  reset: () => void;
  search: (isResetCurrent?: boolean) => Promise<void>;
  searchParams?: Partial<T>;
  initValues?: Partial<T>;
  colSpan?: number;
  defaultCollapsedCount?: number;
  resetText?: ReactNode;
  searchText?: ReactNode;
}

/** Semi TreeSelect 树形节点通用格式。 */
export interface TreeSelectOption {
  children?: TreeSelectOption[];
  disabled?: boolean;
  key: string;
  label: string;
  value: number;
}

/** 通用下拉选项。 */
export interface SelectOption<V = number> {
  label: string;
  value: V;
}

export type { FormApi, Key };
