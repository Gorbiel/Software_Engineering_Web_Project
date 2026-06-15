import { Avatar } from "@/components/misc/Avatar";
import type { UserSearchResult } from "@/utils/users";

type UserResultInfoProps = {
  user: UserSearchResult;
  avatarClassName: string;
};

// Avatar + name + job title block shared by the search result rows.
// The caller supplies the surrounding row element (Link, button, …).
export function UserResultInfo({ user, avatarClassName }: UserResultInfoProps) {
  return (
    <>
      <Avatar
        name={user.name}
        src={user.profile_picture}
        className={avatarClassName}
      />
      <div className="flex min-w-0 flex-col">
        <span className="text-text truncate text-sm font-semibold">
          {user.name}
        </span>
        {user.job_title ? (
          <span className="text-text-muted truncate text-xs">
            {user.job_title}
          </span>
        ) : null}
      </div>
    </>
  );
}
