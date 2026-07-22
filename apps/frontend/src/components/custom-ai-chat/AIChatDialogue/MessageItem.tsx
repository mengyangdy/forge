import React from "react";
import { Copy, RefreshCw, ThumbsUp, ThumbsDown, Bot, User } from "lucide-react";
import type { Message, RoleConfigItem, ActionItem } from "../types";
import { ThinkingCollapse } from "./ThinkingCollapse";
import { MarkdownContent } from "./MarkdownContent";

interface MessageItemProps {
  msg: Message;
  roleConfigItem: RoleConfigItem;
  actionList?: ActionItem[];
  onMessageReset?: (message: Message) => void;
  onLike?: (message: Message) => void;
  onDislike?: (message: Message) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  msg,
  roleConfigItem,
  actionList,
  onMessageReset,
  onLike,
  onDislike,
}) => {
  const isRight = roleConfigItem.align === "right";

  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text);
  };

  return (
    <div className={`flex gap-3 max-w-[88%] ${isRight ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
      {/* 头像 */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isRight ? "bg-blue-600" : "bg-purple-600"}`}
      >
        {typeof roleConfigItem.avatar === "string" ? (
          <img src={roleConfigItem.avatar} alt="Avatar" className="w-full h-full rounded-full" />
        ) : (
          roleConfigItem.avatar ||
          (isRight ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Bot className="w-4 h-4 text-white" />
          ))
        )}
      </div>

      {/* 内容区域 */}
      <div className={`flex flex-col gap-1.5 ${isRight ? "items-end" : "items-start"}`}>
        {roleConfigItem.name && (
          <span className="text-xs text-gray-400 font-medium px-1">{roleConfigItem.name}</span>
        )}

        {/* 思考过程折叠组件 */}
        {msg.reasoningContent && <ThinkingCollapse reasoningContent={msg.reasoningContent} />}

        {/* 气泡 */}
        <div
          className={`p-3.5 rounded-2xl text-sm leading-relaxed ${isRight ? "bg-blue-600 text-white rounded-tr-none" : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-200/50 dark:border-gray-700/50"}`}
        >
          {isRight ? (
            <div className="whitespace-pre-wrap">{msg.content}</div>
          ) : (
            <MarkdownContent content={msg.content} />
          )}
        </div>

        {/* 底部按钮栏 */}
        {!isRight && (
          <div className="flex items-center gap-2 text-gray-400 text-xs mt-1">
            <button
              onClick={() => copyToClipboard(msg.content)}
              className="hover:text-gray-600 dark:hover:text-gray-200 p-1"
              title="复制"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            {onMessageReset && (
              <button
                onClick={() => onMessageReset(msg)}
                className="hover:text-gray-600 dark:hover:text-gray-200 p-1"
                title="重新生成"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
            {onLike && (
              <button
                onClick={() => onLike(msg)}
                className="hover:text-gray-600 dark:hover:text-gray-200 p-1"
                title="赞"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
            )}
            {onDislike && (
              <button
                onClick={() => onDislike(msg)}
                className="hover:text-gray-600 dark:hover:text-gray-200 p-1"
                title="踩"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            )}
            {actionList?.map((action) => (
              <button
                key={action.key}
                onClick={() => action.onClick(msg)}
                className="hover:text-gray-600 dark:hover:text-gray-200 p-1"
                title={action.title}
              >
                {action.icon}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
