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
}: {
  name: string;
  photoUrl: string | null;
}) {
  const [failed, setFailed] = useState(false);

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const src = getPhotoSrc(photoUrl);

  if (!src || failed) {
    return (
      <span
        aria-hidden
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0B5D3B]/10 text-xs font-bold text-[#0B5D3B]"
      >
        {initials || "?"}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={`${name} profile`}
      width={40}
      height={40}
      unoptimized={shouldBypassImageOptimization(src)}
      onError={() => setFailed(true)}
      className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-[#0B5D3B]/10"
    />
  );
}
