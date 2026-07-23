import { ChevronDown, Brain } from "lucide-react";

interface ReasoningContentProps {
  content?: string;
  summary?: Array<{
    text?: string;
  }>;
  status?: string;
}

export const ReasoningContent = ({ content, summary, status }: ReasoningContentProps) => {
  const summaryText = summary
    ?.map((item) => item.text)
    .filter(Boolean)
    .join("\n");
  const reasoningText = content || summaryText || "";
  return (
    <details className="my-2 max-w-xl rounded-xl border border-purple-200 bg-purple-50/50 p-3 text-xs text-gray-600 dark:border-purple-900 dark:bg-purple-950/20 dark:text-gray-400">
      <summary className="flex cursor-pointer list-none items-center gap-2 select-none">
        <Brain className="h-3.5 w-3.5 text-purple-500" />
        <span className="font-medium">{status === "in_progress" ? "正在思考" : "已深度思考"}</span>
        <ChevronDown className="ml-auto h-3.5 w-3.5" />
      </summary>
      {reasoningText && (
        <div className="mt-2 whitespace-pre-wrap border-t border-purple-200 pt-2 leading-relaxed dark:border-purple-900">
          {reasoningText}
        </div>
      )}
    </details>
  );
};
