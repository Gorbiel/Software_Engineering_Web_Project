import { AvatarInitials } from "@/components/misc/AvatarInitials";

export type AvatarPerson = {
  name: string;
  src?: string | null;
};

type AvatarProps = {
  name: string;
  src?: string | null;
  className?: string;
  alt?: string;
};

export function Avatar({ name, src, className = "", alt }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt ?? name}
        className={`rounded-full object-cover ${className}`}
      />
    );
  }

  return <AvatarInitials name={name} className={className} />;
}
