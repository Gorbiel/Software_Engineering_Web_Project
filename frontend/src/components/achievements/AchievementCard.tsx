import { Heart, MessageSquare } from "lucide-react";
import { AvatarInitials } from "@/components/misc/AvatarInitials";
import { AvatarStack } from "@/components/misc/AvatarStack";

type AchievementCardProps = {
  authorName: string;
  title: string;
  date: string;
  likes: number;
  comments: number;
  confirmedBy?: string[];
  children: React.ReactNode;
};

export function AchievementCard({
  authorName,
  title,
  date,
  likes,
  comments,
  confirmedBy = [],
  children,
}: AchievementCardProps) {
  return (
    <article className="glaze-card flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <AvatarInitials
            name={authorName}
            className="bg-accent-2-soft text-accent-2 h-10 w-10 shrink-0 text-xs font-bold"
          />
          <div className="min-w-0">
            <h4 className="text-text text-sm font-bold wrap-break-word">
              {authorName}
            </h4>
            <p className="text-text-muted text-xs">{date}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {confirmedBy.length > 0 ? (
            <>
              <AvatarStack names={confirmedBy} />
              <span className="text-text-muted text-xs font-semibold">
                {confirmedBy.length === 1
                  ? "1 confirmation"
                  : `${confirmedBy.length} confirmations`}
              </span>
            </>
          ) : (
            <span className="text-text-muted text-xs">
              No confirmations yet
            </span>
          )}
        </div>
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <h3 className="text-text text-lg font-bold wrap-break-word">{title}</h3>
        <p className="text-text-muted text-sm wrap-break-word">{children}</p>
      </div>
      <div className="text-text-muted flex items-center gap-4 text-xs">
        <button
          className="hover:text-accent flex cursor-pointer items-center gap-1 transition-colors select-none"
          type="button"
        >
          <Heart className="h-4 w-4" />
          <span className="font-bold">{likes}</span>
        </button>
        <button
          className="hover:text-accent-2 flex cursor-pointer items-center gap-1 transition-colors select-none"
          type="button"
        >
          <MessageSquare className="h-4 w-4" />
          <span className="font-bold">{comments}</span>
        </button>
      </div>
    </article>
  );
}
