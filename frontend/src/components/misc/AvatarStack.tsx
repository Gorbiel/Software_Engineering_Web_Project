import { AvatarInitials } from "@/components/misc/AvatarInitials";

const DEFAULT_MAX = 3;

function stackAvatarColor(index: number): string {
  const mod = index % 3;
  if (mod === 0) return "text-accent bg-accent-soft";
  if (mod === 1) return "text-accent-2 bg-accent-2-soft";
  return "text-accent-3 bg-accent-3-soft";
}

type AvatarStackProps = {
  names: string[];
  max?: number;
};

export function AvatarStack({ names, max = DEFAULT_MAX }: AvatarStackProps) {
  const visible = names.slice(0, max);
  const extraCount = names.length - visible.length;

  return (
    <div className="flex items-center">
      <div className="flex items-center">
        {visible.map((name, index) => (
          <AvatarInitials
            key={`${name}-${index}`}
            name={name}
            className={`h-8 w-8 text-xs font-semibold uppercase ${index === 0 ? "" : "-ml-2"} ${stackAvatarColor(index)}`}
          />
        ))}
      </div>
      {extraCount > 0 ? (
        <span className="text-text-muted bg-surface -ml-2 flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold">
          +{extraCount}
        </span>
      ) : null}
    </div>
  );
}
