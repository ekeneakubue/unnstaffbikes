import Image from "next/image";

export default function ApplicantAvatar({
  name,
  photoUrl,
}: {
  name: string;
  photoUrl: string | null;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  if (!photoUrl) {
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
      src={photoUrl}
      alt={`${name} profile`}
      width={40}
      height={40}
      unoptimized={photoUrl.startsWith("/uploads/")}
      className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-[#0B5D3B]/10"
    />
  );
}
