/**
 * User 模块类型定义
 *
 * 与后端 user.controller.ts 的 OpenAPI schema 保持一致。
 */

/** 用户角色。 */
export interface UserRole {
  id: number;
  code: string;
  name: string;
}

/** 用户状态。 */
export type UserStatus = "active" | "disabled";

/** 用户列表项。 */
export interface UserListItem {
  id: number;
  username: string;
  phone: string | null;
  nickname: string | null;
  avatar: string | null;
  status: UserStatus;
  departmentId: number;
  createdAt: string;
  updatedAt: string;
  roles: UserRole[];
}

/** 用户列表接口响应。 */
export interface UserListResponse {
  list: UserListItem[];
  total: number;
}

/** 新增用户参数（对齐后端 create schema）。 */
export interface UserCreateParams {
  username: string;
  password?: string;
  nickname?: string | null;
  status: UserStatus;
  departmentId: number;
  roleIds: number[];
}

/** 更新用户参数（对齐后端 update schema）。 */
export interface UserUpdateParams {
  nickname?: string | null;
  status: UserStatus;
  departmentId: number;
  roleIds: number[];
  password?: string;
}

/** 用户列表查询参数。 */
export interface UserSearchParams {
  /** 当前页码（useTable 内部使用）。 */
  current: number;
  /** 每页条数（useTable 内部使用）。 */
  size: number;
  /** 用户名模糊搜索。 */
  username?: string;
  /** 昵称模糊搜索。 */
  nickname?: string;
  /** 手机号模糊搜索。 */
  phone?: string;
  /** 状态筛选。 */
  status?: UserStatus;
}
