"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import {
  ALLOWED_IMAGE_ACCEPT,
  validateImageFile,
} from "@/lib/validate-image";

type ProfileImageFieldProps = {
  id?: string;
  name?: string;
  required?: boolean;
  label?: string;
};

export default function ProfileImageField({
  id = "profile-photo",
  name = "profilePhoto",
  required = true,
  label = "Profile photo",
}: ProfileImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  return (
    <div className="flex flex-col items-center">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#0B5D3B]">
        {label}
      </p>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-[#0B5D3B]/35 bg-[#f4f7f5] transition hover:scale-105 hover:border-[#0B5D3B] hover:bg-[#0B5D3B]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B5D3B]"
        aria-label={preview ? "Change profile photo" : "Upload profile photo"}
      >
        {preview ? (
          <Image
            src={preview}
            alt="Profile preview"
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <span className="flex flex-col items-center gap-1 text-[#0B5D3B]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0B5D3B] text-2xl font-light text-white shadow-sm transition group-hover:scale-110 group-hover:bg-[#094a31]">
              +
            </span>
            <span className="text-xs font-medium">Upload image</span>
          </span>
        )}
      </button>

      <p className="mt-2 text-center text-xs text-[#6b7f73]">
        JPEG, PNG, or WebP. Max 5MB.
      </p>

      <input
        ref={inputRef}
        id={id}
        name={name}
        type="file"
        accept={ALLOWED_IMAGE_ACCEPT}
        required={required}
        className="sr-only"
        onChange={handleFileChange}
      />
    </div>
  );
}
