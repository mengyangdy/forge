import { useEffect, useRef, useState } from "react";

import type {
  PaginationData,
  SemiTableColumn,
  SemiTableColumnCheck,
  SemiTableColumnFixed,
  SemiTableColumnCheckTitle,
  SemiTableConfig,
  SemiTableQueryHook,
  TableDataWithIndex,
  GetTableDataFromResponse,
  PaginatingQueryRecord,
  FormApi,
} from "./types";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

function formatSearchParams<T>(params: Partial<T>) {
  return { ...params } as Partial<T>;
}

function createSearchParams<T>(params?: Partial<T>) {
  return formatSearchParams<T>({
    current: DEFAULT_PAGE,
    size: DEFAULT_PAGE_SIZE,
    ...params,
  } as unknown as Partial<T>);
}

function createEmptyPaginationData<T>(): PaginationData<TableDataWithIndex<T>> {
  return {
    data: [],
    pageNum: DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
  };
}

function withTableIndex<T>(pagination: PaginationData<T>): PaginationData<TableDataWithIndex<T>> {
  const { data, pageNum, pageSize, total } = pagination;
  const start = (pageNum - 1) * pageSize;

  return {
    data: data.map((item, index) => ({
      ...item,
      index: start + index + 1,
    })),
    pageNum,
    pageSize,
    total,
  };
}

function resolveRequestParams<Params>(
  searchParams: Partial<Params>,
  transformParams?: (params: Params) => Params,
) {
  const params = searchParams as Params;
  return transformParams ? transformParams(params) : params;
}

function getColumnKey<T extends Record<string, any>>(column: SemiTableColumn<T>) {
  if (column.key !== undefined && column.key !== null) {
    return String(column.key);
  }

  if (column.dataIndex !== undefined && column.dataIndex !== null) {
    return String(column.dataIndex);
  }

  return null;
}

function getColumnFixed<T extends Record<string, any>>(
  column: SemiTableColumn<T>,
): SemiTableColumnFixed {
  if (column.fixed === true || column.fixed === "left") return "left";
  if (column.fixed === "right") return "right";
  return "unFixed";
}

function getColumnTitle<T extends Record<string, any>>(
  column: SemiTableColumn<T>,
  key: string,
): SemiTableColumnCheckTitle {
  return column.title ?? key;
}

function getSemiColumnChecks<T extends Record<string, any>>(
  columns: SemiTableColumn<T>[],
  getColumnVisible?: (column: SemiTableColumn<T>) => boolean,
) {
  const checks: SemiTableColumnCheck[] = [];

  columns.forEach((column) => {
    const key = getColumnKey(column);
    if (!key) return;

    checks.push({
      checked: true,
      fixed: getColumnFixed(column),
      key,
      title: getColumnTitle(column, key),
      visible: getColumnVisible?.(column) ?? true,
    });
  });

  return checks;
}

function getSemiColumns<T extends Record<string, any>>(
  columns: SemiTableColumn<T>[],
  checks: SemiTableColumnCheck[],
) {
  const columnMap = new Map<string, SemiTableColumn<T>>();

  columns.forEach((column) => {
    const key = getColumnKey(column);
    if (key) columnMap.set(key, column);
  });

  return checks
    .filter((item) => item.checked)
    .map((check) => {
      const column = columnMap.get(check.key);
      if (!column) return null;

      return {
        ...column,
        fixed: check.fixed === "unFixed" ? undefined : check.fixed,
      } as SemiTableColumn<T>;
    })
    .filter(Boolean) as SemiTableColumn<T>[];
}

function mergeColumnChecks(prev: SemiTableColumnCheck[], next: SemiTableColumnCheck[]) {
  const prevMap = new Map(prev.map((item) => [item.key, item]));

  return next.map((item) => {
    const old = prevMap.get(item.key);
    if (!old) return item;
    return { ...item, checked: old.checked, fixed: old.fixed };
  });
}

export function defaultSemiTableTransformer<T>(response?: {
  current?: number;
  records?: T[];
  size?: number;
  total?: number;
}): PaginationData<T> {
  return {
    data: response?.records ?? [],
    pageNum: response?.current ?? DEFAULT_PAGE,
    pageSize: response?.size ?? DEFAULT_PAGE_SIZE,
    total: response?.total ?? 0,
  };
}

/** Semi Design 版 useTable：状态机与旧版对齐，表单走 Semi FormApi。 */
export function useSemiTable<
  Params extends Record<string, any>,
  Response,
  T extends Record<string, any> = GetTableDataFromResponse<Response> & Record<string, any>,
>(config: SemiTableConfig<Params, Response, T>) {
  const {
    apiParams,
    columns: columnsFactory,
    enabled = true,
    getColumnVisible,
    immediate = true,
    onFetched,
    queryHook,
    queryOptions,
    rowKey = "id",
    transformer,
    transformParams,
  } = config;

  const formApiRef = useRef<FormApi<Params> | null>(null);
  const [formApi, setFormApi] = useState<FormApi<Params> | null>(null);

  const resetParams = createSearchParams<Params>(apiParams);
  const initialParams = createSearchParams<Params>(apiParams);

  const [searchParams, setSearchParams] = useState<Partial<Params>>(initialParams);
  const [queryEnabled, setQueryEnabled] = useState(immediate);
  const [columnChecks, setColumnChecks] = useState<SemiTableColumnCheck[]>(() =>
    getSemiColumnChecks(columnsFactory(), getColumnVisible),
  );

  const allColumns = columnsFactory();
  const columns = getSemiColumns(allColumns, columnChecks);
  const requestParams = resolveRequestParams<Params>(searchParams, transformParams);

  const query = (queryHook as SemiTableQueryHook<Params, Response>)<
    PaginationData<TableDataWithIndex<T>>
  >(requestParams, {
    ...queryOptions,
    enabled: enabled && queryEnabled,
    select: (response) => {
      const transform =
        transformer ?? (defaultSemiTableTransformer as (response: Response) => PaginationData<T>);
      return withTableIndex(transform(response));
    },
  });

  const paginationData = query.data ?? createEmptyPaginationData<T>();
  const loading = query.isFetching;
  const pageNum = (searchParams as { current?: number }).current ?? paginationData.pageNum;
  const pageSize = (searchParams as { size?: number }).size ?? paginationData.pageSize;
  const total = paginationData.total;

  const onFetchedRef = useRef(onFetched);
  onFetchedRef.current = onFetched;

  useEffect(() => {
    if (!query.data) return;
    const cb = onFetchedRef.current;
    if (!cb) return;
    Promise.resolve(cb(query.data)).catch(() => undefined);
  }, [query.data]);

  function bindFormApi(api: FormApi<Params>) {
    formApiRef.current = api;
    setFormApi(api);
  }

  async function getData() {
    setQueryEnabled(true);
    await query.refetch();
  }

  function updateSearchParams(params: Partial<Params>) {
    const next = formatSearchParams({ ...searchParams, ...params });
    setSearchParams(next);
    setQueryEnabled(true);
  }

  function reset() {
    const next = formatSearchParams(resetParams);
    formApiRef.current?.setValues(next as Params, { isOverride: true });
    setSearchParams(next);
    setQueryEnabled(true);
  }

  async function run(isResetCurrent: boolean = true) {
    const values = (formApiRef.current?.getValues() ?? {}) as Partial<Params>;
    // 搜索使用「替换」语义：以表单当前完整值为准，
    // 避免字段被清空时（getValues 省略空字段）旧搜索条件残留在 searchParams 中。
    const nextParams = {
      ...values,
      current: isResetCurrent
        ? DEFAULT_PAGE
        : ((searchParams as { current?: number }).current ?? DEFAULT_PAGE),
      size: pageSize,
    };

    setSearchParams(nextParams as Partial<Params>);
    setQueryEnabled(true);
  }

  function handlePageChange(currentPage: number) {
    updateSearchParams({ current: currentPage } as unknown as Partial<Params>);
  }

  function handlePageSizeChange(size: number) {
    updateSearchParams({ current: DEFAULT_PAGE, size } as unknown as Partial<Params>);
  }

  function reloadColumns() {
    setColumnChecks(
      mergeColumnChecks(columnChecks, getSemiColumnChecks(columnsFactory(), getColumnVisible)),
    );
  }

  return {
    columnChecks,
    columns,
    data: paginationData.data,
    empty: !loading && paginationData.data.length === 0,
    formApi,
    getData,
    getFormApi: bindFormApi,
    loading,
    pageNum,
    pageSize,
    reloadColumns,
    reset,
    run,
    searchParams,
    setColumnChecks,
    total,
    updateSearchParams,
    searchProps: {
      formApi,
      getFormApi: bindFormApi,
      reset,
      search: run,
      searchParams: searchParams as Params,
      initValues: initialParams as Params,
    },
    tableProps: {
      columns,
      dataSource: paginationData.data,
      loading,
      pagination: {
        currentPage: pageNum,
        pageSize,
        total,
        showSizeChanger: true,
        pageSizeOpts: [10, 15, 20, 25, 30],
        onPageChange: handlePageChange,
        onPageSizeChange: handlePageSizeChange,
      },
      rowKey,
    },
  };
}

export type { PaginatingQueryRecord };
