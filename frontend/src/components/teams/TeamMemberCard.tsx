import { AvatarInitials } from "@/components/ui/AvatarInitials";

function avatarColorClass(colorIndex: number): string {
  const mod = colorIndex % 3;
  if (mod === 0) return "text-accent-2 bg-accent-2-soft";
  if (mod === 1) return "text-accent-3 bg-accent-3-soft";
  return "text-accent bg-accent-soft";
}

type TeamMemberCardProps = {
  name: string;
  role: string;
  colorIndex: number;
};

export function TeamMemberCard({
  name,
  role,
  colorIndex,
}: TeamMemberCardProps) {
  return (
    <div className="bg-background flex w-full min-w-55 flex-none items-center gap-3 rounded-3xl p-4 sm:w-[calc(50%-0.5rem)]">
      <AvatarInitials
        name={name}
        className={`text-md h-10 w-10 font-semibold uppercase ${avatarColorClass(colorIndex)}`}
      />
      <div>
        <div className="text-text text-sm font-semibold">{name}</div>
        <div className="text-text-muted mt-1 text-xs font-semibold">{role}</div>
      </div>
    </div>
  );
}
