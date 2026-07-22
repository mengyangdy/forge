import React from "react";
import type { SkillOption } from "../types";

interface SkillMentionListProps {
  skills: SkillOption[];
  onSelect: (skill: SkillOption) => void;
}

const SkillMentionList: React.FC<SkillMentionListProps> = ({ skills, onSelect }) => {
  return (
    <div className="absolute bottom-full left-3 mb-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden">
      <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 border-b border-gray-100 dark:border-gray-700">
        选择技能 / 工具
      </div>
      <div className="max-h-48 overflow-y-auto">
        {skills.map((skill) => (
          <button
            key={skill.id}
            onClick={() => onSelect(skill)}
            className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex flex-col transition-colors"
          >
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {skill.label}
            </span>
            {skill.description && (
              <span className="text-xs text-gray-400">{skill.description}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SkillMentionList;
