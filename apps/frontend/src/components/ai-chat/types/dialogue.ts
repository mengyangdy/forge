import type { ReactNode } from "react";
import type { CSSProperties } from "react";
import type { ContentItem } from "./content";
import type { Message, RoleConfig, RoleConfigItem } from "./message";

/**
 * Dialogue 显示模式。
 */
export type DialogueMode = "bubble" | "noBubble" | "userBubble";

/**
 * 自定义头像渲染参数。
 */
export interface RenderAvatarProps {
  defaultAvatar?: ReactNode;
  message?: Message;
  role?: RoleConfigItem;
}

/**
 * 自定义标题渲染参数。
 */
export interface RenderTitleProps {
  defaultTitle?: ReactNode;
  message?: Message;
  role?: RoleConfigItem;
}

/**
 * 自定义内容渲染参数。
 */
export interface RenderContentProps {
  defaultContent?: ReactNode;
  message?: Message;
  role?: RoleConfigItem;
  className?: string;
}

/**
 * 自定义操作区域渲染参数。
 */
export interface RenderActionProps {
  defaultActions?: ReactNode;
  message?: Message;
  role?: RoleConfigItem;
  className?: string;
}

/**
 * 一整条消息自定义渲染参数。
 */
export interface RenderFullDialogueProps {
  message?: Message;
  role?: RoleConfigItem;
  className?: string;
  defaultNodes?: {
    avatar?: ReactNode;
    title?: ReactNode;
    content?: ReactNode;
    action?: ReactNode;
  };
}

/**
 * Dialogue 各区域自定义渲染。
 */
export interface DialogueRenderConfig {
  renderDialogueAvatar?: (props: RenderAvatarProps) => ReactNode;
  renderDialogueTitle?: (props: RenderTitleProps) => ReactNode;
  renderDialogueContent?: (props: RenderContentProps) => ReactNode;
  renderDialogueAction?: (props: RenderActionProps) => ReactNode;
  renderFullDialogue?: (props: RenderFullDialogueProps) => ReactNode;
}

/**
 * 自定义内容块渲染器。
 */
export type ContentItemRenderer = (item: ContentItem, message?: Message) => ReactNode;

export type ContentItemRendererMap = Record<
  string,
  ContentItemRenderer | Record<string, ContentItemRenderer>
>;

/**
 * AIChatDialogue Props。
 */
export interface AIChatDialogueProps {
  chats?: Message[];
  roleConfig: RoleConfig;

  className?: string;
  style?: CSSProperties;

  align?: "leftRight" | "leftAlign";
  mode?: DialogueMode;

  selecting?: boolean;
  showReset?: boolean;
  showReference?: boolean;
  disabledFileItemClick?: boolean;
  escapeHtml?: boolean;

  hints?: string[];
  hintCls?: string;
  hintStyle?: CSSProperties;

  markdownRenderProps?: Record<string, unknown>;

  dialogueRenderConfig?: DialogueRenderConfig;
  renderDialogueContentItem?: ContentItemRendererMap;

  messageEditRender?: (props: { message?: Message; content: string }) => ReactNode;

  renderHintBox?: (props: { content: string; index: number; onHintClick: () => void }) => ReactNode;

  onChatsChange?: (chats?: Message[]) => void;
  onSelect?: (selectedIds: string[]) => void;
  onHintClick?: (hint: string) => void;

  onMessageCopy?: (message?: Message) => void;
  onMessageGoodFeedback?: (message?: Message) => void;
  onMessageBadFeedback?: (message?: Message) => void;
  onMessageReset?: (message?: Message) => void;
  onMessageDelete?: (message?: Message) => void;
  onMessageEdit?: (message?: Message) => void;
  onMessageShare?: (message?: Message) => void;

  onFileClick?: (file?: ContentItem) => void;
  onImageClick?: (image?: ContentItem) => void;
  onAnnotationClick?: (annotation?: ContentItem) => void;
  onReferenceClick?: (item: ContentItem) => void;
}
