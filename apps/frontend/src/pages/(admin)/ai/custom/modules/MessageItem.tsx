import { MarkdownRenderer } from "./MarkdownRenderer";

interface Props {
  className?: string;
  content: string;
  role?: "assistant" | "user";
}

const MessageItem = ({ className, content, role = "assistant" }: Props) => {
  const isUser = role === "user";

  return (
    <div
      className={className}
      style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}
    >
      <div
        style={{
          background: isUser
            ? "var(--semi-color-primary-light-default)"
            : "var(--semi-color-fill-0)",
          borderRadius: 12,
          maxWidth: "80%",
          padding: 16,
        }}
      >
        <MarkdownRenderer content={content} />
      </div>
    </div>
  );
};

export default MessageItem;
