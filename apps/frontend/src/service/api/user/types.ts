/**
 * User 模块类型定义（从后端 Hono RPC 自动推导）
 */

import type { client, InferResponseType } from "@/service/client";

type UserListEnvelope = InferResponseType<typeof client.api.user.list.$get>;

/** 用户列表接口响应 */
export type UserListResponse = UserListEnvelope extends { data: infer D } ? D : never;

/** 用户列表项 */
export type UserListItem = UserListResponse extends { list: (infer Item)[] } ? Item : never;

/** 用户角色 */
export type UserRole = UserListItem extends { roles: (infer R)[] } ? R : never;

/** 用户状态 */
export type UserStatus = UserListItem["status"];

/** 新增用户参数（自动对齐后端 create schema） */
export type UserCreateParams = Parameters<typeof client.api.user.create.$post>[0]["json"];

/** 更新用户参数（自动对齐后端 update schema） */
export type UserUpdateParams = Parameters<(typeof client.api.user)[":id"]["$put"]>[0]["json"];

/** 用户列表查询参数 */
export interface UserSearchParams {
  current: number;
  size: number;
  username?: string;
  nickname?: string;
  phone?: string;
  status?: UserStatus;
}
