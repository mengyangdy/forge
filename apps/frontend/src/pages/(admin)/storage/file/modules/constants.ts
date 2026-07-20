export const CHUNK_SIZE = 5 * 1024 * 1024; // 默认切片大小：5MB

export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

export function getFileIcon(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) return "ph:image-duotone";
  if (["mp4", "webm", "mkv", "mov", "avi"].includes(ext)) return "ph:film-strip-duotone";
  if (["pdf"].includes(ext)) return "ph:file-pdf-duotone";
  if (["zip", "tar", "gz", "rar", "7z"].includes(ext)) return "ph:file-zip-duotone";
  if (["doc", "docx"].includes(ext)) return "ph:file-doc-duotone";
  if (["xls", "xlsx"].includes(ext)) return "ph:file-xls-duotone";
  return "ph:file-text-duotone";
}
