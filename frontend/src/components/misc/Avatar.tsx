"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
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

function normalizeAvatarSrc(src?: string | null): string | null {
  const trimmed = src?.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("/media/")) {
    return trimmed;
  }

  if (trimmed.startsWith("media/")) {
    return `/${trimmed}`;
  }

  try {
    const url = new URL(trimmed);
    if (url.pathname.startsWith("/media/")) {
      return `${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
    return trimmed;
  }

  return trimmed;
}

export function Avatar({ name, src, className = "", alt }: AvatarProps) {
  const normalizedSrc = useMemo(() => normalizeAvatarSrc(src), [src]);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const visibleSrc =
    normalizedSrc && normalizedSrc !== failedSrc ? normalizedSrc : null;

  if (visibleSrc) {
    return (
      <span
        className={`relative inline-block overflow-hidden rounded-full ${className}`}
      >
        <Image
          src={visibleSrc}
          alt={alt ?? name}
          fill
          className="object-cover"
          unoptimized
          onError={() => setFailedSrc(visibleSrc)}
        />
      </span>
    );
  }

  return <AvatarInitials name={name} className={className} />;
}
