/** 角色数据范围。 */
export type RoleDataScope = "all" | "dept_child" | "dept" | "self" | "custom";

/** 角色列表项。 */
export interface RoleListItem {
  id: number;
  code: string;
  name: string;
  description: string | null;
  dataScope: string;
  createdAt: string;
  updatedAt: string;
  permissionIds?: number[];
}

/** 角色列表响应。 */
export interface RoleListResponse {
  list: RoleListItem[];
  total: number;
}

/** 角色搜索参数。 */
export interface RoleSearchParams {
  current: number;
  size: number;
  name?: string;
  code?: string;
  dataScope?: RoleDataScope;
}

/** 角色新增参数。 */
export interface RoleCreateParams {
  code: string;
  name: string;
  description?: string | null;
  dataScope?: RoleDataScope;
  permissionIds?: number[];
}

/** 角色更新参数。 */
export interface RoleUpdateParams {
  code: string;
  name: string;
  description?: string | null;
  dataScope?: RoleDataScope;
  permissionIds?: number[];
}

/** 角色详情。 */
export interface RoleDetailResponse extends RoleListItem {
  permissionIds: number[];
}
