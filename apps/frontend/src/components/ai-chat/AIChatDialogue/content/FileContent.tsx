import { FileText, ExternalLink } from "lucide-react";

interface FileContentProps {
  fileName?: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number | string;
  onClick?: () => void;
}

export const FileContent = ({
  fileName = "未命名文件",
  fileUrl,
  fileType,
  fileSize,
  onClick,
}: FileContentProps) => {
  const fileNode = (
    <div className="flex max-w-xs item-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bh-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
        <FileText className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <div className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
          {fileName}
        </div>
        <div className="flex gap-2 text-xs text-gray-400">
          {fileType && <span>{fileType}</span>}
          {fileSize !== undefined && <span>{fileSize}</span>}
        </div>
      </div>
      {fileUrl && <ExternalLink className="h-4 w-4 shrink-0 text-gray-400" />}
    </div>
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} aria-label={`打开文件 ${fileName}`}>
        {fileNode}
      </button>
    );
  }
  return fileNode;
};
