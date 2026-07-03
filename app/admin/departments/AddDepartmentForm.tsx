"use client";

import { useActionState, useEffect } from "react";
import type { AdminFormState } from "@/lib/admin/department-actions";
import { createDepartment } from "./actions";

const inputClassName =
  "w-full rounded-xl border border-[#0B5D3B]/20 bg-white px-4 py-3 text-sm text-[#0f2419] outline-none transition placeholder:text-[#8a9a90] focus:border-[#0B5D3B] focus:ring-2 focus:ring-[#0B5D3B]/15";

export default function AddDepartmentForm({
  faculties,
  onCancel,
  onSuccess,
}: {
  faculties: { id: string; name: string }[];
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const [state, formAction, isPending] = useActionState<AdminFormState, FormData>(
    createDepartment,
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
          htmlFor="departmentFaculty"
          className="mb-1.5 block text-sm font-medium text-[#0f2419]"
        >
          Faculty
        </label>
        <select
          id="departmentFaculty"
          name="facultyId"
          required
          disabled={faculties.length === 0}
          className={inputClassName}
          defaultValue=""
        >
          <option value="" disabled>
            {faculties.length === 0
              ? "No faculties available — add a faculty first"
              : "Select a faculty"}
          </option>
          {faculties.map((faculty) => (
            <option key={faculty.id} value={faculty.id}>
              {faculty.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="departmentName"
          className="mb-1.5 block text-sm font-medium text-[#0f2419]"
        >
          Department name
        </label>
        <input
          id="departmentName"
          name="name"
          type="text"
          required
          className={inputClassName}
          placeholder="e.g. Computer Science"
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
          disabled={isPending || faculties.length === 0}
          className="inline-flex h-11 items-center justify-center rounded-[10px] bg-[#0B5D3B] px-5 text-sm font-semibold text-white transition hover:bg-[#094a31] disabled:opacity-70"
        >
          {isPending ? "Adding…" : "Add department"}
        </button>
      </div>
    </form>
  );
}
