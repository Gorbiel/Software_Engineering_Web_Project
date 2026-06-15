import Image from "next/image";
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
      <span
        className={`relative inline-block overflow-hidden rounded-full ${className}`}
      >
        <Image
          src={src}
          alt={alt ?? name}
          fill
          className="object-cover"
          unoptimized
        />
      </span>
    );
  }

  return <AvatarInitials name={name} className={className} />;
}
