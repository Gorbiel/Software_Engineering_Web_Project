import Link from "next/link";
import { Avatar } from "@/components/misc/Avatar";

type GlazeCardProps = {
  posterName: string;
  posterPhotoUrl?: string | null;
  posterId?: number | string | null;
  receiverName: string;
  receiverId?: number | string | null;
  title: string;
  date: string;
  reactions?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

function profileLink(id: number | string | null | undefined) {
  return id !== undefined && id !== null ? `/profile/${id}` : null;
}

export function GlazeCard({
  posterName,
  posterPhotoUrl,
  posterId,
  receiverName,
  receiverId,
  title,
  date,
  reactions,
  actions,
  children,
}: GlazeCardProps) {
  const posterHref = profileLink(posterId);
  const receiverHref = profileLink(receiverId);

  const avatar = (
    <Avatar
      name={posterName}
      src={posterPhotoUrl}
      className="bg-accent-2-soft text-accent-2 h-10 w-10 shrink-0 text-xs font-bold"
    />
  );

  return (
    <article className="glaze-card flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {posterHref ? (
            <Link
              href={posterHref}
              className="shrink-0 transition hover:opacity-80"
            >
              {avatar}
            </Link>
          ) : (
            avatar
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1">
              {posterHref ? (
                <Link
                  href={posterHref}
                  className="text-text text-sm font-bold wrap-break-word hover:underline"
                >
                  {posterName}
                </Link>
              ) : (
                <h4 className="text-text text-sm font-bold wrap-break-word">
                  {posterName}
                </h4>
              )}
              <h4 className="text-text text-sm wrap-break-word">glazed</h4>
              {receiverHref ? (
                <Link
                  href={receiverHref}
                  className="text-text text-sm font-bold wrap-break-word hover:underline"
                >
                  {receiverName}
                </Link>
              ) : (
                <h4 className="text-text text-sm font-bold wrap-break-word">
                  {receiverName}
                </h4>
              )}
              <h4 className="text-text text-sm wrap-break-word">.</h4>
            </div>
            <p className="text-text-muted text-xs">{date}</p>
          </div>
        </div>
        {actions ? (
          <div className="flex items-center gap-1">{actions}</div>
        ) : null}
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <h3 className="text-text text-lg font-bold wrap-break-word">{title}</h3>
        <p className="text-text-muted text-sm wrap-break-word">{children}</p>
      </div>
      {reactions ? (
        <div className="text-text-muted flex items-center text-xs">
          {reactions}
        </div>
      ) : null}
    </article>
  );
}
