import { memo } from "react";

interface Props {
  className?: string;
  content: string;
}

export const MarkdownRenderer = memo(({ className, content }: Props) => {
  return (
    <div className={className} style={{ whiteSpace: "pre-wrap" }}>
      {content}
    </div>
  );
});

MarkdownRenderer.displayName = "MarkdownRenderer";
