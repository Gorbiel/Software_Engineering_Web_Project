"use client";

import { Avatar } from "@/components/misc/Avatar";
import { useMyProfile } from "@/context/MyProfileContext";

export function SidebarUserCard() {
  const { profile } = useMyProfile();
  const name = profile?.name ?? "";

  return (
    <div className="glaze-card mb-5 flex flex-col items-center gap-3 text-center">
      <Avatar
        name={name}
        src={profile?.profile_picture}
        className="bg-background text-accent border-surface h-28 w-28 overflow-hidden border-4 text-2xl font-black"
      />
      <div className="flex flex-col gap-1">
        <p className="text-text text-base font-semibold">
          {name || "User Name"}
        </p>
        <p className="text-text-muted text-xs font-semibold">Rank: ---</p>
      </div>
      <div className="w-full">
        <div className="bg-background h-2 w-full rounded-full">
          <div className="bg-accent h-full w-2/3 rounded-full" />
        </div>
        <p className="text-accent mt-2 text-xs font-semibold">
          Progress to next rank
        </p>
      </div>
    </div>
  );
}
