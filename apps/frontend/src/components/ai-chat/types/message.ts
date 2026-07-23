import type { ID } from "./common";
import type { ContentItem } from "./content";
import type React from "react";

/**
 * 消息角色。
 *
 * 不限制为 user、assistant、system，
 * 方便支持 tool、mcp、custom 等角色。
 */
export type Role = string;

/**
 * Semi 风格的消息状态。
 */
export type MessageStatus =
  | "queued"
  | "in_progress"
  | "incomplete"
  | "completed"
  | "failed"
  | "cancelled";

/**
 * 一条聊天消息。
 */
export interface Message {
  id: ID;
  role: Role;

  /**
   * 字符串或多个内容块。
   */
  content?: string | ContentItem[];

  name?: string;
  model?: string;
  createdAt?: number;
  updatedAt?: number;
  status?: MessageStatus;

  like?: boolean;
  dislike?: boolean;
  editing?: boolean;

  [key: string]: unknown;
}

/**
 * 角色配置项。
 */
export interface RoleConfigItem {
  name?: string;
  avatar?: string | React.ReactNode;
  color?: string;

  /**
   * 对齐方式。
   */
  align?: "left" | "right";

  className?: string;

  [key: string]: unknown;
}

/**
 * 角色配置。
 */
export type RoleConfig = Record<string, RoleConfigItem>;
