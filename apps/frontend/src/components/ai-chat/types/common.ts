import type { CSSProperties, ReactNode } from "react";

export type ID = string | number;

export type ClasName = string;

export type RenderNode = ReactNode | ReactNode[];

export interface BaseContentItem {
  id?: ID;
  type: string;
  status?: string;
  role?: string;
  [key: string]: unknown;
}

export interface BaseRenderProps {
  className?: string;
  style?: CSSProperties;
}
