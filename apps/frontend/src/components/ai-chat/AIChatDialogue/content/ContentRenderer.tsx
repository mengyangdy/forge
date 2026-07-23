import type { ReactNode } from "react";

import type { ContentItem } from "../../types";
import type {
  CodeContent as CodeContentItem,
  FileContent as FileContentItem,
  ImageContent as ImageContentItem,
  ReasoningContent as ReasoningContentItem,
  TextContent as TextContentItem,
  ToolCallContent as ToolCallContentItem,
} from "../../types";

import { CodeContent } from "./CodeContent";
import { FileContent } from "./FileContent";
import { ImageContent } from "./ImageContent";
import { ReasoningContent } from "./ReasoningContent";
import { TextContent } from "./TextContent";
import { ToolCallContent } from "./ToolCallContent";

interface ContentRendererProps {
  content?: string | ContentItem[];
  onFileClick?: (item: ContentItem) => void;
  onImageClick?: (item: ContentItem) => void;
  renderItem?: (item: ContentItem) => ReactNode;
}

export const ContentRenderer = ({
  content,
  onFileClick,
  onImageClick,
  renderItem,
}: ContentRendererProps) => {
  if (!content) {
    return null;
  }

  if (typeof content === "string") {
    return <TextContent text={content} />;
  }

  return (
    <div className="flex flex-col gap-2">
      {content.map((item, index) => {
        const key = item.id ?? `${item.type}-${index}`;

        if (renderItem) {
          const customNode = renderItem(item);

          if (customNode !== undefined) {
            return <div key={key}>{customNode}</div>;
          }
        }

        switch (item.type) {
          case "text":
          case "output_text": {
            const textItem = item as TextContentItem;

            return <TextContent key={key} text={textItem.text} />;
          }

          case "code": {
            const codeItem = item as CodeContentItem;

            return <CodeContent key={key} code={codeItem.code} language={codeItem.language} />;
          }

          case "image":
          case "input_image": {
            const imageItem = item as ImageContentItem;

            return (
              <ImageContent
                key={key}
                imageUrl={imageItem.imageUrl}
                onClick={() => onImageClick?.(item)}
              />
            );
          }

          case "file":
          case "input_file": {
            const fileItem = item as FileContentItem;

            return (
              <FileContent
                key={key}
                fileName={fileItem.fileName}
                fileUrl={fileItem.fileUrl}
                fileType={fileItem.fileType}
                fileSize={fileItem.fileSize}
                onClick={() => onFileClick?.(item)}
              />
            );
          }

          case "reasoning": {
            const reasoningItem = item as ReasoningContentItem;

            return (
              <ReasoningContent
                key={key}
                content={reasoningItem.content}
                summary={reasoningItem.summary}
                status={reasoningItem.status}
              />
            );
          }

          case "tool_call":
          case "function_call":
          case "web_search_call": {
            const toolItem = item as ToolCallContentItem;

            return (
              <ToolCallContent
                key={key}
                name={toolItem.name}
                arguments={toolItem.arguments}
                result={toolItem.result}
                status={toolItem.status}
              />
            );
          }

          default:
            return (
              <div
                key={key}
                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
              >
                暂不支持的内容类型：{item.type}
              </div>
            );
        }
      })}
    </div>
  );
};
