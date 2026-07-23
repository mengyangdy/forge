import { Wrench } from "lucide-react";

interface ToolCallContentProps {
  name?: string;
  arguments?: string;
  result?: string;
  status?: string;
}

export const ToolCallContent = ({
  name = "未知工具",
  arguments: toolArguments,
  result,
  status,
}: ToolCallContentProps) => {
  return (
    <details className="my-2 rounded-lg border border-orange-200 bg-orange-50/50 p-3 text-xs dark:border-orange-900 dark:bg-orange-950/20">
      <summary className="flex cursor-pointer list-none items-center gap-2 font-medium text-orange-700 dark:text-orange-300">
        <Wrench className="h-3.5 w-3.5" />
        <span>工具调用：{name}</span>
        {status && <span className="ml-auto text-gray-400">{status}</span>}
      </summary>

      {toolArguments && (
        <div className="mt-2">
          <div className="mb-1 font-medium text-gray-500">参数</div>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded bg-black/5 p-2 dark:bg-black/30">
            {toolArguments}
          </pre>
        </div>
      )}

      {result && (
        <div className="mt-2">
          <div className="mb-1 font-medium text-gray-500">结果</div>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded bg-black/5 p-2 dark:bg-black/30">
            {result}
          </pre>
        </div>
      )}
    </details>
  );
};
