import { useState } from "react";

import { AIChatDialogue, AIChatInput } from "@douyinfe/semi-ui";
import type { Message } from "@douyinfe/semi-ui/lib/es/aiChatDialogue/interface";
import type { MessageContent } from "@douyinfe/semi-ui/lib/es/aiChatInput/interface";
import { nanoid } from "nanoid";

const roleConfig = {
  assistant: {
    name: "AI助手",
  },
  user: {
    name: "我",
  },
} as const;

const getMessageText = (inputContents?: MessageContent["inputContents"]) => {
  if (!inputContents?.length) {
    return "";
  }

  return inputContents
    .map((item) => {
      if (typeof item?.text === "string") {
        return item.text;
      }

      return "";
    })
    .filter(Boolean)
    .join("\n");
};

const ChatPage = () => {
  const [chats, setChats] = useState<Message[]>([
    {
      content: "你好，我是 AI 助手。",
      id: nanoid(),
      role: "assistant",
    },
  ]);

  const handleMessageSend = (props: MessageContent) => {
    const content = getMessageText(props.inputContents) || "收到一条新消息";

    setChats((prev) => [
      ...prev,
      {
        content,
        id: nanoid(),
        role: "user",
      },
      {
        content: "当前页面还没有接入后端模型。",
        id: nanoid(),
        role: "assistant",
      },
    ]);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <AIChatDialogue chats={chats} className="flex-1 min-h-0" roleConfig={roleConfig} />
      <AIChatInput className="mt-4" keepSkillAfterSend={false} onMessageSend={handleMessageSend} />
    </div>
  );
};

export default ChatPage;
