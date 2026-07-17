/**
 * Permission Query Hooks
 *
 * 为 useTable 提供 queryHook，遵循项目约定：
 * - 自行声明 queryKey（含 params，参数变化自动重查）
 * - 自行声明 queryFn
 * - 必须展开 options（让 useTable 接管 enabled/select）
 */

import { useQuery } from "@tanstack/react-query";
import type { SemiTableQueryHookOptions } from "@/shared/web-ui-compose";
import type { PaginatingQueryRecord } from "@/shared/web-ui-compose";
import type { UseQueryOptions } from "@tanstack/react-query";

import { permissionApi, permissionKeys } from "./api";
import type { PermissionSearchParams, PermissionTreeNode } from "./types";

type PermissionTreeQueryOptions<Data> = Omit<
  UseQueryOptions<PermissionTreeNode[], Error, Data>,
  "queryFn" | "queryKey"
>;

/** 层级树。 */
export function usePermissionTreeQuery<Data = PermissionTreeNode[]>(
  options?: PermissionTreeQueryOptions<Data>,
) {
  return useQuery<PermissionTreeNode[], Error, Data>({
    ...options,
    queryKey: permissionKeys.tree(),
    queryFn: permissionApi.tree,
  });
}

/** 适配 SemiTable 的树级查询，仅调用 tree 接口并在前端做搜索过滤 */
export function usePermissionTreeTableQuery<Data = PaginatingQueryRecord<PermissionTreeNode>>(
  params: PermissionSearchParams,
  options?: SemiTableQueryHookOptions<PaginatingQueryRecord<PermissionTreeNode>, Data>,
) {
  return useQuery<PermissionTreeNode[], Error, Data>({
    ...(options as Omit<
      UseQueryOptions<PermissionTreeNode[], Error, Data>,
      "queryFn" | "queryKey" | "select"
    >),
    queryKey: permissionKeys.tree(),
    queryFn: permissionApi.tree,
    select: (tree) => {
      const nameKeyword = params.name?.trim().toLowerCase();
      const codeKeyword = params.code?.trim().toLowerCase();

      function filterTree(nodes: PermissionTreeNode[]): PermissionTreeNode[] {
        const result: PermissionTreeNode[] = [];
        for (const node of nodes) {
          const children = node.children ? filterTree(node.children) : [];
          const matchesName = !nameKeyword || node.name.toLowerCase().includes(nameKeyword);
          const matchesCode =
            !codeKeyword || (node.code && node.code.toLowerCase().includes(codeKeyword));
          const matchesType = !params.type || node.type === params.type;

          if (matchesName && matchesCode && matchesType) {
            result.push({
              ...node,
              children: children.length > 0 ? children : undefined,
            });
          } else if (children.length > 0) {
            result.push({
              ...node,
              children,
            });
          }
        }
        return result;
      }

      const filteredTree = filterTree(tree);

      const page = {
        records: filteredTree,
        current: 1,
        size: filteredTree.length || 10,
        total: filteredTree.length,
      } satisfies PaginatingQueryRecord<PermissionTreeNode>;
      if (options?.select) {
        return options.select(page);
      }
      return page as Data;
    },
  });
}
