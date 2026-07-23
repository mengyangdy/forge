interface ImageContentProps {
  imageUrl?: string;
  alt?: string;
  onClick?: () => void;
}

export const ImageContent = ({ imageUrl, alt = "图片", onClick }: ImageContentProps) => {
  if (!imageUrl) {
    return (
      <div className="rounded-lg bg-gray-100 px-3 py-2 text-xs text-gray-400 dark:bg-gray-800">
        图片地址不存在
      </div>
    );
  }
  return (
    <button
      type="button"
      className="block max-w-full overflow-hidden rounded-lg"
      onClick={onClick}
      aria-label="查看图片"
    >
      <img src={imageUrl} alt={alt} className="max-h-96 max-w-full rounded--lg object-contain" />
    </button>
  );
};
