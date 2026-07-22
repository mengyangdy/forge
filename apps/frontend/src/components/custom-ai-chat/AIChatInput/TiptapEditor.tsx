import React from "react";
import type { KeyboardEvent } from "react";

interface TiptapEditorProps {
  value: string;
  onChange: (val: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({
  value,
  onChange,
  onKeyDown,
  placeholder = "发送消息，输入 @ 唤起技能...",
}) => {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      rows={2}
      className="w-full resize-none bg-transparent outline-none text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 font-sans"
    />
  );
};

export default TiptapEditor;
