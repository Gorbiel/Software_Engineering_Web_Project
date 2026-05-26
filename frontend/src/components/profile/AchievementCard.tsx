import { Heart, MessageSquare } from "lucide-react";
import { AvatarInitials } from "@/components/misc/AvatarInitials";

type AchievementCardProps = {
  authorName: string;
  title: string;
  date: string;
  likes: number;
  comments: number;
  children: React.ReactNode;
};

export function AchievementCard({
  authorName,
  title,
  date,
  likes,
  comments,
  children,
}: AchievementCardProps) {
  return (
    <article className="glaze-card flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <AvatarInitials
            name={authorName}
            className="bg-accent-2-soft text-accent-2 h-10 w-10 shrink-0 text-xs font-bold"
          />
          <div>
            <h4 className="text-text text-sm font-bold">{title}</h4>
            <p className="text-text-muted text-xs">{date}</p>
          </div>
        </div>
      </div>
      <p className="text-text-muted text-sm">{children}</p>
      <div className="text-text-muted flex items-center gap-4 text-xs">
        <button
          className="hover:text-accent flex items-center gap-1 transition-colors"
          type="button"
        >
          <Heart className="h-4 w-4" />
          <span className="font-bold">{likes}</span>
        </button>
        <button
          className="hover:text-accent-2 flex items-center gap-1 transition-colors"
          type="button"
        >
          <MessageSquare className="h-4 w-4" />
          <span className="font-bold">{comments}</span>
        </button>
      </div>
    </article>
  );
}
