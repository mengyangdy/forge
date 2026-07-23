import type { CSSProperties, ReactNode } from "react";
import type { InputContent, RichTextJSON } from "./content";
import type { ID } from "./common";

/**
 * 技能。
 */
export interface Skill {
  id?: ID;
  value?: string;
  label?: string;
  description?: string;
  icon?: ReactNode;
  hasTemplate?: boolean;
  [key: string]: unknown;
}

/**
 * 兼容当前项目的技能类型。
 */
export interface SkillOption extends Skill {
  id: ID;
  label: string;
}

/**
 * 建议项。
 */
export type Suggestion =
  | string[]
  | {
      content: string;
      [key: string]: unknown;
    };

/**
 * 引用项。
 */
export interface Reference {
  id: ID;
  type: string;
  name?: string;
  url?: string;
  content?: string;
  [key: string]: unknown;
}

/**
 * 上传附件。
 */
export interface Attachment {
  id: ID;
  name: string;
  url?: string;
  type?: string;
  size?: number;
  file?: File;
  status?: "uploading" | "success" | "error";
  validateMessage?: string;
  children?: Attachment[];
  [key: string]: unknown;
}

/**
 * 配置区域数据。
 */
export interface Setup {
  [key: string]: unknown;
}

/**
 * 发送消息参数。
 */
export interface MessageContent {
  inputContents?: InputContent[];
  attachments?: Attachment[];
  references?: Reference[];
  setup?: Setup;
}

/**
 * 上传按钮自定义渲染参数。
 */
export interface RenderUploadButtonProps {
  defaultNode: ReactNode;
  openFileDialog: () => void;
  disabled: boolean;
  attachments: Attachment[];
}

/**
 * 顶部区域自定义渲染参数。
 */
export interface RenderTopSlotProps {
  references: Reference[];
  attachments: Attachment[];
  inputContents: InputContent[];
  onAttachmentDelete: (attachment: Attachment) => void;
  onReferenceDelete: (reference: Reference) => void;
}

/**
 * Skill 自定义渲染参数。
 */
export interface RenderSkillItemProps {
  skill: Skill;
  className: string;
  onClick: () => void;
  onMouseEnter: () => void;
}

/**
 * Suggestion 自定义渲染参数。
 */
export interface RenderSuggestionItemProps {
  suggestion: Suggestion;
  className: string;
  onClick: () => void;
  onMouseEnter: () => void;
}

/**
 * AIChatInput Props。
 *
 * 第一版先定义完整 API，后续逐项实现。
 */
export interface AIChatInputProps {
  className?: string;
  style?: CSSProperties;

  placeholder?: string;
  defaultContent?: string | RichTextJSON;

  generating?: boolean;
  canSend?: boolean;
  keepSkillAfterSend?: boolean;
  sendHotKey?: "enter" | "shift+enter";

  skills?: Skill[];
  skillHotKey?: string;
  suggestions?: Suggestion[];
  references?: Reference[];
  attachments?: Attachment[];

  showUploadButton?: boolean;
  showUploadFile?: boolean;
  showReference?: boolean;
  showTemplateButton?: boolean;
  showPlaceholderWhenSkillOnly?: boolean;
  round?: boolean;

  renderTopSlot?: (props: RenderTopSlotProps) => ReactNode;
  renderSkillItem?: (props: RenderSkillItemProps) => ReactNode;
  renderSuggestionItem?: (props: RenderSuggestionItemProps) => ReactNode;
  renderUploadButton?: (props: RenderUploadButtonProps) => ReactNode;
  renderTemplate?: (skill: Skill, onTemplateClick: (content: string) => void) => ReactNode;
  renderConfigureArea?: (className?: string) => ReactNode;
  renderActionArea?: (props: { menuItems: ReactNode[]; className: string }) => ReactNode;

  onContentChange?: (contents: InputContent[]) => void;
  onMessageSend?: (content: MessageContent) => void;
  onStopGenerate?: () => void;

  onFocus?: () => void;
  onBlur?: () => void;
  onPaste?: (event: React.ClipboardEvent<HTMLDivElement>) => void;

  onReferenceDelete?: (reference: Reference) => void;
  onReferenceClick?: (reference: Reference) => void;

  onUploadChange?: (attachments: Attachment[]) => void;
  onSkillChange?: (skill: Skill | null) => void;
  onSuggestClick?: (suggestion: Suggestion) => void;

  onTemplateVisibleChange?: (visible: boolean) => void;
  onConfigureChange?: (
    value: Record<string, unknown>,
    changedValue: Record<string, unknown>,
  ) => void;
}
