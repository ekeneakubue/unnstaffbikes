"use client";

import Image from "next/image";
import { useState } from "react";
import {
  getPhotoSrc,
  shouldBypassImageOptimization,
} from "@/lib/storage/photo-url";

export default function ApplicantAvatar({
  name,
  photoUrl,
  size = "md",
}: {
  name: string;
  photoUrl: string | null;
  size?: "md" | "lg";
}) {
  const [failed, setFailed] = useState(false);

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const src = getPhotoSrc(photoUrl);
  const isLarge = size === "lg";
  const className = isLarge
    ? "h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-[#0B5D3B]/15"
    : "h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-[#0B5D3B]/10";
  const fallbackClassName = isLarge
    ? "flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#0B5D3B]/10 text-base font-bold text-[#0B5D3B]"
    : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0B5D3B]/10 text-xs font-bold text-[#0B5D3B]";
  const dimension = isLarge ? 64 : 40;

  if (!src || failed) {
    return (
      <span aria-hidden className={fallbackClassName}>
        {initials || "?"}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={`${name} profile`}
      width={dimension}
      height={dimension}
      unoptimized={shouldBypassImageOptimization(src)}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
