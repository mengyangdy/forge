/**
 * Department Query Hooks
 *
 * 为 useTable 提供 queryHook，遵循项目约定：
 * - 自行声明 queryKey（含 params，参数变化自动重查）
 * - 自行声明 queryFn
 * - 必须展开 options（让 useTable 接管 enabled/select）
 */

import { useQuery } from "@tanstack/react-query";
import type { PaginatingQueryRecord, SemiTableQueryHookOptions } from "@/shared/web-ui-compose";
import type { UseQueryOptions } from "@tanstack/react-query";

import { deptApi, deptKeys } from "./api";
import type { DeptListItem, DeptSearchParams, DeptTreeNode } from "./types";

type DeptListQueryOptions<Data> = Omit<
  UseQueryOptions<DeptListItem[], Error, Data>,
  "queryFn" | "queryKey"
>;

/** 将扁平部门列表构建成树（parentId 找不到的挂为根）。 */
function buildDeptTree(items: DeptListItem[]): DeptTreeNode[] {
  const map = new Map<number, DeptTreeNode>();
  items.forEach((item) => map.set(item.id, { ...item, children: [] }));

  const roots: DeptTreeNode[] = [];
  map.forEach((node) => {
    const parent = node.parentId != null ? map.get(node.parentId) : undefined;
    if (parent) {
      parent.children!.push(node);
    } else {
      roots.push(node);
    }
  });

  // 叶子节点移除空 children，避免出现无意义的展开箭头。
  const prune = (nodes: DeptTreeNode[]) => {
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        prune(node.children);
      } else {
        delete node.children;
      }
    });
  };
  prune(roots);

  return roots;
}

/**
 * 部门列表查询 Hook。
 *
 * 后端返回扁平数组，这里按搜索条件过滤后做前端分页，
 * 转换成 useTable 期望的 `{ records, current, size, total }` 结构。
 */
export function useDeptQuery<Data = PaginatingQueryRecord<DeptListItem>>(
  params: DeptSearchParams,
  options?: SemiTableQueryHookOptions<PaginatingQueryRecord<DeptListItem>, Data>,
) {
  return useQuery<DeptListItem[], Error, Data>({
    ...(options as Omit<
      UseQueryOptions<DeptListItem[], Error, Data>,
      "queryFn" | "queryKey" | "select"
    >),
    queryKey: deptKeys.list(),
    queryFn: deptApi.list,
    select: (list) => {
      const nameKeyword = params.name?.trim().toLowerCase();
      const leaderKeyword = params.leaderName?.trim().toLowerCase();

      const filtered = list.filter((item) => {
        const matchedName = !nameKeyword || item.name.toLowerCase().includes(nameKeyword);
        const matchedLeader =
          !leaderKeyword || (item.leaderName ?? "").toLowerCase().includes(leaderKeyword);
        const matchedStatus = !params.status || item.status === params.status;

        return matchedName && matchedLeader && matchedStatus;
      });

      const start = (params.current - 1) * params.size;

      const page = {
        records: filtered.slice(start, start + params.size),
        current: params.current,
        size: params.size,
        total: filtered.length,
      } satisfies PaginatingQueryRecord<DeptListItem>;
      if (options?.select) {
        return options.select(page);
      }
      return page as Data;
    },
  });
}

/**
 * 部门树表格查询 Hook。
 *
 * 拉取全量扁平列表 → 按搜索条件过滤 → 构建成树，
 * 供 useTable 以树形（children 层级）渲染，不做分页。
 */
export function useDeptTreeTableQuery<Data = PaginatingQueryRecord<DeptTreeNode>>(
  params: DeptSearchParams,
  options?: SemiTableQueryHookOptions<PaginatingQueryRecord<DeptTreeNode>, Data>,
) {
  return useQuery<DeptListItem[], Error, Data>({
    ...(options as Omit<
      UseQueryOptions<DeptListItem[], Error, Data>,
      "queryFn" | "queryKey" | "select"
    >),
    queryKey: deptKeys.list(),
    queryFn: deptApi.list,
    select: (list) => {
      const nameKeyword = params.name?.trim().toLowerCase();
      const leaderKeyword = params.leaderName?.trim().toLowerCase();
      const hasFilter = nameKeyword || leaderKeyword || params.status;

      // 无搜索条件时直接构建完整树。
      if (!hasFilter) {
        const tree = buildDeptTree(list);
        const page = {
          records: tree,
          current: 1,
          size: list.length || 1,
          total: list.length,
        } satisfies PaginatingQueryRecord<DeptTreeNode>;
        if (options?.select) {
          return options.select(page);
        }
        return page as Data;
      }

      // 搜索时采用「祖先保留」策略：匹配的节点及其所有祖先均保留，确保树结构完整。
      const matchedIds = new Set<number>();
      for (const item of list) {
        const matchedName = !nameKeyword || item.name.toLowerCase().includes(nameKeyword);
        const matchedLeader =
          !leaderKeyword || (item.leaderName ?? "").toLowerCase().includes(leaderKeyword);
        const matchedStatus = !params.status || item.status === params.status;
        if (matchedName && matchedLeader && matchedStatus) {
          matchedIds.add(item.id);
        }
      }

      // 向上追溯所有祖先节点。
      const retainedIds = new Set(matchedIds);
      const itemMap = new Map(list.map((item) => [item.id, item]));
      for (const id of matchedIds) {
        let current = itemMap.get(id);
        while (current?.parentId != null && !retainedIds.has(current.parentId)) {
          retainedIds.add(current.parentId);
          current = itemMap.get(current.parentId);
        }
      }

      const filtered = list.filter((item) => retainedIds.has(item.id));
      const tree = buildDeptTree(filtered);

      const page = {
        records: tree,
        current: 1,
        size: filtered.length || 1,
        total: filtered.length,
      } satisfies PaginatingQueryRecord<DeptTreeNode>;
      if (options?.select) {
        return options.select(page);
      }
      return page as Data;
    },
  });
}

/** 扁平部门列表（不分页）。 */
export function useDeptListQuery<Data = DeptListItem[]>(options?: DeptListQueryOptions<Data>) {
  return useQuery<DeptListItem[], Error, Data>({
    ...options,
    queryKey: deptKeys.list(),
    queryFn: deptApi.list,
  });
}

/** 层级树。 */
export function useDeptTreeQuery() {
  return useQuery({
    queryKey: deptKeys.tree(),
    queryFn: deptApi.tree,
  });
}
