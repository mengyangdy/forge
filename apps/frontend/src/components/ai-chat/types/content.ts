import type { BaseContentItem, ID } from "./common";

/**
 * 文本内容
 */
export interface TextContent extends BaseContentItem {
  type: "text";
  text?: string;
  annotations?: Annotation[];
}

/**
 * 图片内容
 */
export interface ImageContent extends BaseContentItem {
  type: "image";
  imageUrl?: string;
  fileId?: string;
  detail?: string;
}

/**
 * 文件内容
 */
export interface FileContent extends BaseContentItem {
  type: "file";
  fileId?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number | string;
}

/**
 * 音频内容
 */
export interface AudioContent extends BaseContentItem {
  type: "audio";
  inputAudio?: {
    data: string;
    format: string;
  };
}

/**
 * 代码内容
 */
export interface CodeContent extends BaseContentItem {
  type: "code";
  code?: string;
  language?: string;
}

/**
 * 深度思考内容
 */
export interface ReasoningContent extends BaseContentItem {
  type: "reasoning";
  content?: string;
  summary?: Array<{
    type?: string;
    text?: string;
  }>;
}

/**
 * 引用内容
 */
export interface ReferenceContent extends BaseContentItem {
  type: "reference";
  fileId?: string;
  referenceId?: ID;
}

/**
 * URL引用标记
 */
export interface Annotation {
  type?: string;
  title?: string;
  url?: string;
  startIndex?: number;
  enIndex?: number;
  [key: string]: unknown;
}

/**
 * 工具调用内容
 */
export interface ToolCallContent extends BaseContentItem {
  type: "tool-call";
  name?: string;
  callId?: string;
  arguments?: string;
  result?: string;
}

/**
 * 自定义内容块
 */
export interface CustomContentItem extends BaseContentItem {
  type: string;
}

/**
 * 所有消息内容块
 */
export type ContentItem =
  | TextContent
  | ImageContent
  | FileContent
  | AudioContent
  | CodeContent
  | ReasoningContent
  | ReferenceContent
  | ToolCallContent
  | CustomContentItem;

/**
 * 输入框文本内容
 */
export type InputContent =
  | TextContent
  | ImageContent
  | FileContent
  | AudioContent
  | ReferenceContent;

/**
 * Tiptap 默认内容
 */
export interface RichTextJSON {
  type: string;
  [key: string]: unknown;
}
