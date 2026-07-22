import React, { useEffect, useRef } from "react";
import { Bot, User } from "lucide-react";
import type { Message, RoleConfig, ActionItem } from "../types";
import { MessageItem } from "./MessageItem";

export interface AIChatDialogueProps {
  chats: Message[];
  loading?: boolean;
  roleConfig?: RoleConfig;
  actionList?: ActionItem[];
  onMessageReset?: (message: Message) => void;
  onLike?: (message: Message) => void;
  onDislike?: (message: Message) => void;
  className?: string;
}

const defaultRoleConfig: RoleConfig = {
  user: {
    name: "我",
    avatar: <User className="w-4 h-4 text-white" />,
    align: "right",
  },
  assistant: {
    name: "AI 助手",
    avatar: <Bot className="w-4 h-4 text-white" />,
    align: "left",
  },
};

export const AIChatDialogue: React.FC<AIChatDialogueProps> = ({
  chats,
  loading = false,
  roleConfig = defaultRoleConfig,
  actionList,
  onMessageReset,
  onLike,
  onDislike,
  className = "",
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, loading]);

  return (
    <div className={`flex flex-col gap-6 p-4 overflow-y-auto ${className}`}>
      {chats.map((msg) => (
        <MessageItem
          key={msg.id}
          msg={msg}
          roleConfigItem={roleConfig[msg.role] || defaultRoleConfig.assistant}
          actionList={actionList}
          onMessageReset={onMessageReset}
          onLike={onLike}
          onDislike={onDislike}
        />
      ))}

      {loading && (
        <div className="flex gap-3 mr-auto">
          <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center">
            <Bot className="w-4 h-4 animate-pulse" />
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]" />
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.4s]" />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
