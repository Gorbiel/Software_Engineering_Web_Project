import { formatTagScope, getTagBadgeColor, type TagListItem } from "@/utils/tags";

interface TagBadgeProps {
  tag: TagListItem;
  showScope?: boolean;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
}

export default function TagBadge({
  tag,
  showScope = false,
  size = "md",
  onClick,
  className = "",
}: TagBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  const baseClasses = `inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[size]} ${getTagBadgeColor(
    tag
  )}`;

  const interactiveClasses = onClick
    ? "cursor-pointer hover:opacity-80 transition-opacity"
    : "";

  const combinedClasses = `${baseClasses} ${interactiveClasses} ${className}`;

  const content = (
    <>
      <span>{tag.tag_text}</span>
      {showScope && (
        <span className="text-xs opacity-70">({formatTagScope(tag)})</span>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={combinedClasses}
        aria-label={`Filter by ${tag.tag_text}`}
      >
        {content}
      </button>
    );
  }

  return <span className={combinedClasses}>{content}</span>;
}

// Made with Bob
