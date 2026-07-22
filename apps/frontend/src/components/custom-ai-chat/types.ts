import React from "react";

export type Role = "user" | "assistant" | "system" | "string";

export interface Attachment {
  id: string;
  name: string;
  url?: string;
  type?: string;
  size?: number;
}

export interface SkillOption {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface MessageContent {
  text: string;
  attachments?: Attachment[];
  selectedSkill?: SkillOption | null;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  reasoningContent?: string;
  status?: "loading" | "complete" | "error";
  attachments?: Attachment[];
  createAt?: number;
}

export interface RoleConfigItem {
  name?: string;
  avatar?: React.ReactNode | string;
  align?: "left" | "right";
  className?: string;
}

export type RoleConfig = Record<string, RoleConfigItem>;

export interface ActionItem {
  key: string;
  icon: React.ReactNode;
  title: string;
  onClick: (message: Message) => void;
}
