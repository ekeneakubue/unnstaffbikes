"use client";

import { useActionState, useEffect } from "react";
import type { AdminFormState } from "@/lib/admin/faculty-actions";
import { createFaculty } from "./actions";

const inputClassName =
  "w-full rounded-xl border border-[#0B5D3B]/20 bg-white px-4 py-3 text-sm text-[#0f2419] outline-none transition placeholder:text-[#8a9a90] focus:border-[#0B5D3B] focus:ring-2 focus:ring-[#0B5D3B]/15";

export default function AddFacultyForm({
  onCancel,
  onSuccess,
}: {
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const [state, formAction, isPending] = useActionState<AdminFormState, FormData>(
    createFaculty,
    {},
  );

  useEffect(() => {
    if (state.success) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor="facultyName"
          className="mb-1.5 block text-sm font-medium text-[#0f2419]"
        >
          Faculty name
        </label>
        <input
          id="facultyName"
          name="name"
          type="text"
          required
          className={inputClassName}
          placeholder="e.g. Faculty of Engineering"
        />
      </div>

      {state.error ? (
        <div
          role="alert"
          className="rounded-xl border border-[#b45309]/25 bg-[#fff7ed] px-4 py-3 text-sm text-[#92400e]"
        >
          {state.error}
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-11 items-center justify-center rounded-[10px] border-2 border-[#0B5D3B]/25 px-5 text-sm font-semibold text-[#0B5D3B] transition hover:bg-[#0B5D3B]/5"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-11 items-center justify-center rounded-[10px] bg-[#0B5D3B] px-5 text-sm font-semibold text-white transition hover:bg-[#094a31] disabled:opacity-70"
        >
          {isPending ? "Adding…" : "Add faculty"}
        </button>
      </div>
    </form>
  );
}
