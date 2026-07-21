import MessageItem from "./MessageItem";

const demoMessages = [
  {
    content: "这是一段示例用户消息。",
    id: "user-1",
    role: "user" as const,
  },
  {
    content: "这是一个可编译的自定义页面占位实现。",
    id: "assistant-1",
    role: "assistant" as const,
  },
] as const;

const CustomPage = () => {
  return (
    <div className="flex h-full min-h-0 flex-col gap-16px p-16px">
      <div className="rounded-12px bg-layout p-16px">
        <div className="mb-12px text-18px font-600 text-text-1">AI 自定义页面</div>
        <div className="flex flex-col gap-12px">
          {demoMessages.map((message) => (
            <MessageItem key={message.id} content={message.content} role={message.role} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomPage;
