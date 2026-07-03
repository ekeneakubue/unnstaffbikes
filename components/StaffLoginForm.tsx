"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import PasswordInput from "@/components/PasswordInput";
import { login, type LoginResult } from "@/lib/auth/actions";

const inputClassName =
  "w-full rounded-[10px] border border-[#0B5D3B]/20 bg-white px-4 py-3 text-sm text-[#0f2419] outline-none placeholder:text-[#8a9a90] focus:border-[#0B5D3B] focus:ring-2 focus:ring-[#0B5D3B]/15";

export default function StaffLoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<LoginResult, FormData>(
    login,
    {},
  );

  useEffect(() => {
    if (!state.redirectTo) {
      return;
    }

    router.replace(state.redirectTo);
    router.refresh();
  }, [state.redirectTo, router]);

  return (
    <form action={formAction} className="space-y-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <div>
        <label htmlFor="email" className="mb-1 block text-sm text-[#0f2419]">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={inputClassName}
          placeholder="you@unn.edu.ng"
        />
      </div>

      <PasswordInput
        id="password"
        name="password"
        label="Password"
        autoComplete="current-password"
        required
        placeholder="Password"
        className={inputClassName}
        labelClassName="mb-1 block text-sm text-[#0f2419]"
      />

      {state.error ? (
        <p role="alert" className="text-sm text-[#b45309]">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="h-11 w-full rounded-[10px] bg-[#0B5D3B] text-sm font-semibold text-white hover:bg-[#094a31] disabled:opacity-70"
      >
        {isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
