import Link from "next/link";
import { Avatar, type AvatarPerson } from "@/components/misc/Avatar";
import { AvatarStack } from "@/components/misc/AvatarStack";
import TagBadge from "@/components/tags/TagBadge";
import { type TagListItem } from "@/utils/tags";

type AchievementCardProps = {
  authorName: string;
  authorPhotoUrl?: string | null;
  authorId?: number | string | null;
  title: string;
  date: string;
  reactions?: React.ReactNode;
  confirmedBy?: AvatarPerson[];
  actions?: React.ReactNode;
  tags?: TagListItem[];
  children: React.ReactNode;
};

export function AchievementCard({
  authorName,
  authorPhotoUrl,
  authorId,
  title,
  date,
  reactions,
  confirmedBy = [],
  actions,
  tags = [],
  children,
}: AchievementCardProps) {
  const avatar = (
    <Avatar
      name={authorName}
      src={authorPhotoUrl}
      className="bg-accent-2-soft text-accent-2 h-10 w-10 shrink-0 text-xs font-bold"
    />
  );
  const profileHref =
    authorId !== undefined && authorId !== null
      ? `/profile/${authorId}`
      : null;

  return (
    <article className="glaze-card flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {profileHref ? (
            <Link href={profileHref} className="shrink-0 transition hover:opacity-80">
              {avatar}
            </Link>
          ) : (
            avatar
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              {profileHref ? (
                <Link
                  href={profileHref}
                  className="text-text text-sm font-bold wrap-break-word hover:underline"
                >
                  {authorName}
                </Link>
              ) : (
                <h4 className="text-text text-sm font-bold wrap-break-word">
                  {authorName}
                </h4>
              )}
              <h4 className="text-text text-sm wrap-break-word">
                shared an achievement.
              </h4>
            </div>
            <p className="text-text-muted text-xs">{date}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {confirmedBy.length > 0 ? (
            <>
              <AvatarStack people={confirmedBy} />
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
      <div className="flex min-w-0 flex-col gap-2">
        <h3 className="text-text text-lg font-bold wrap-break-word">{title}</h3>
        <p className="text-text-muted text-sm wrap-break-word">{children}</p>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} size="sm" />
            ))}
          </div>
        )}
      </div>
      <div className="text-text-muted flex items-center justify-between gap-4 text-xs">
        <div className="min-w-0">{reactions}</div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-1">{actions}</div>
        ) : null}
      </div>
    </article>
  );
}
