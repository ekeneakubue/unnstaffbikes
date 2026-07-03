"use client";

import { useTransition } from "react";
import { logout } from "@/lib/auth/actions";

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => logout())}
      className="inline-flex h-9 w-full items-center justify-center rounded-[10px] border border-[#0B5D3B]/20 text-sm font-semibold text-[#0B5D3B] transition hover:bg-[#0B5D3B]/5 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? "Signing out…" : "Logout"}
    </button>
  );
}
