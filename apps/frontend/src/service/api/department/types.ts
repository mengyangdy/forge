/** 部门状态。 */
export type DeptStatus = "active" | "disabled";

/** 部门列表项（扁平）。 */
export interface DeptListItem {
  id: number;
  name: string;
  parentId: number | null;
  leaderUserId: number | null;
  leaderName: string | null;
  status: DeptStatus;
  createdAt: string;
  updatedAt: string;
}

/** 部门树节点。 */
export interface DeptTreeNode extends DeptListItem {
  children?: DeptTreeNode[];
}

/** 部门列表响应（后端返回数组，非分页）。 */
export type DeptListResponse = DeptListItem[];

/** 新增部门参数（对齐后端 create schema）。 */
export interface DeptCreateParams {
  name: string;
  parentId?: number | null;
  leaderUserId?: number | null;
  status?: DeptStatus;
}

/** 更新部门参数（对齐后端 update schema）。 */
export interface DeptUpdateParams {
  name: string;
  parentId?: number | null;
  leaderUserId?: number | null;
  status: DeptStatus;
}

/** 部门列表查询参数（适配 useTable）。 */
export interface DeptSearchParams {
  /** 当前页码（useTable 内部使用）。 */
  current: number;
  /** 每页条数（useTable 内部使用）。 */
  size: number;
  /** 部门名称模糊搜索。 */
  name?: string;
  /** 负责人名称模糊搜索。 */
  leaderName?: string;
  /** 状态筛选。 */
  status?: DeptStatus;
}
