export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AvatarInitials({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-full select-none ${className}`}
    >
      {getInitials(name)}
    </div>
  );
}
