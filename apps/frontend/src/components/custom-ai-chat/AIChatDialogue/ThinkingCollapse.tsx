import React from "react";

import { ChevronDown } from "lucide-react";

interface ThinkingCollapseProps {
  reasoningContent: string;
}

export const ThinkingCollapse: React.FC<ThinkingCollapseProps> = ({ reasoningContent }) => {
  return (
    <details className="group border border-purple-200 dark:border-purple-900 bg-purple-50/40 dark:bg-purple-950/20 rounded-xl p-3 text-xs text-gray-600 dark:text-gray-400 w-full max-w-xl">
      <summary className="cursor-pointer font-medium flex items-center gap-1 list-none select-none">
        <ChevronDown className="w-3.5 h-3.5 group-open:rotate-180 transition-transform" />
        <span>已深度思考</span>
      </summary>
      <div className="mt-2 pt-2 border-t border-purple-100 dark:border-purple-900 whitespace-pre-wrap leading-relaxed">
        {reasoningContent}
      </div>
    </details>
  );
};
