import React, { useState, useRef } from "react";
import type { KeyboardEvent } from "react";
import { Paperclip, Send, Square, Sparkles, X, AtSign } from "lucide-react";
import type { Attachment, MessageContent, SkillOption } from "@/components/custom-ai-chat/types";
import TiptapEditor from "@/components/custom-ai-chat/AIChatInput/TiptapEditor";
import SkillMentionList from "@/components/custom-ai-chat/AIChatInput/SkillMentionList";

export interface AIChatInputProps {
  onMessageSend?: (content: MessageContent) => void;
  onStop?: () => void;
  loading?: boolean;
  placeholder?: string;
  keepSkillAfterSend?: boolean;
  topSlot?: React.ReactNode;
  bottomSlot?: React.ReactNode;
  skills?: SkillOption[];
  className?: string;
}

export const AIChatInput: React.FC<AIChatInputProps> = ({
  onMessageSend,
  onStop,
  loading = false,
  placeholder,
  keepSkillAfterSend = false,
  topSlot,
  bottomSlot,
  skills = [
    {
      id: "web-search",
      label: "联网搜索",
      description: "实时检索最新网络信息",
    },
    {
      id: "deep-think",
      label: "深度思考",
      description: "开启 R1 链式推理模式",
    },
    {
      id: "code-interpreter",
      label: "代码解释器",
      description: "运行与分析代码",
    },
  ],
  className = "",
}) => {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<SkillOption | null>(null);
  const [showSkillMenu, setShowSkillMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleTextChange = (val: string) => {
    setText(val);
    if (val.endsWith("@")) {
      setShowSkillMenu(true);
    } else if (showSkillMenu && !val.includes("@")) {
      setShowSkillMenu(false);
    }
  };

  const handleSelectSkill = (skill: SkillOption) => {
    setSelectedSkill(skill);
    setText((prev) => prev.replace(/@$/, ""));
    setShowSkillMenu(false);
  };
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  const handleSend = () => {
    if ((!text.trim() && attachments.length === 0 && !selectedSkill) || loading) return;
    onMessageSend?.({
      text,
      attachments,
      selectedSkill,
    });
    setText(".");
    setAttachments([]);
    if (!keepSkillAfterSend) {
      setSelectedSkill(null);
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles: Attachment[] = Array.from(files).map((f) => ({
      id: Math.random().toString(36).substring(2, 9),
      name: f.name,
      type: f.type,
      size: f.size,
    }));
    setAttachments((prev) => [...prev, ...newFiles]);
  };

  return (
    <div
      className={`relative border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 shadow-sm focus-within:shadow-md focus-within:border-blue-500 transition-all ${className}`}
    >
      {topSlot && (
        <div className="px-3 pt-3 border-b border-gray-100 dark:border-gray-700/50">{topSlot}</div>
      )}
      {showSkillMenu && <SkillMentionList skills={skills} onSelect={handleSelectSkill} />}
      <div className="p-3">
        {(selectedSkill || attachments.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-2 pb-2 border-b border-gray-100 dark:border-gray-700">
            {selectedSkill && (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-medium border border-blue-200 dark:border-blue-800">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{selectedSkill.label}</span>
                <button onClick={() => setSelectedSkill(null)} className="hover:text-blue-800 ml-1">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {attachments.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-xs"
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span className="max-w-[120px] truncate">{file.name}</span>
                <button
                  onClick={() => setAttachments((prev) => prev.filter((a) => a.id !== file.id))}
                  className="hover:text-red-500 ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <TiptapEditor
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
        <div className="flex items-center justify-between pt-2 mt-1">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="上传附件"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowSkillMenu((prev) => !prev)}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="触发 @ 技能"
            >
              <AtSign className="w-4 h-4" />
            </button>
            {bottomSlot}
          </div>
          <div>
            {loading ? (
              <button
                onClick={onStop}
                className="p-2 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-90 transition-opacity"
                title="停止生成"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!text.trim() && attachments.length === 0 && !selectedSkill}
                className="p-2 rounded-xl bg-blue-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                title="发送"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
