/** 权限/菜单类型。 */
export type PermissionType = "menu" | "button" | "catalogue";

/** 权限/菜单列表项。 */
export interface PermissionListItem {
  id: number;
  code: string;
  name: string;
  type: PermissionType;
  parentId: number | null;
  routeName?: string | null;
  routePath?: string | null;
  component?: string | null;
  pathParam?: string | null;
  i18nKey?: string | null;
  order?: number;
  iconType?: string;
  icon?: string | null;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

/** 新增参数。 */
export interface PermissionCreateParams {
  code: string;
  name: string;
  type: PermissionType;
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
}

/** 更新参数。 */
export interface PermissionUpdateParams {
  code: string;
  name: string;
  type: PermissionType;
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
}

/** 树形节点（含 children）。 */
export interface PermissionTreeNode extends PermissionListItem {
  children?: PermissionTreeNode[];
}

/** 权限/菜单列表查询参数（适配 useTable）。 */
export interface PermissionSearchParams {
  /** 当前页码（useTable 内部使用）。 */
  current: number;
  /** 每页条数（useTable 内部使用）。 */
  size: number;
  /** 权限名称模糊搜索。 */
  name?: string;
  /** 权限编码模糊搜索。 */
  code?: string;
  /** 类型筛选。 */
  type?: PermissionType;
}
