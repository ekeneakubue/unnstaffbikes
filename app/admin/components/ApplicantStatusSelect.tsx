"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { updateApplicantStatus } from "@/lib/applicants/actions";

export default function ApplicantStatusSelect({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextStatus = event.target.value as "APPROVED" | "REJECTED";
    if (nextStatus !== "APPROVED" && nextStatus !== "REJECTED") {
      return;
    }

    startTransition(async () => {
      const result = await updateApplicantStatus(id, nextStatus);

      if (result.error) {
        window.alert(result.error);
        event.target.value = "PENDING";
        return;
      }

      router.refresh();
    });
  }

  return (
    <select
      defaultValue="PENDING"
      onChange={handleChange}
      disabled={isPending}
      aria-label="Update applicant status"
      className="rounded-lg border border-[#fbbf24]/40 bg-[#fff7ed] px-2.5 py-1.5 text-xs font-semibold text-[#b45309] outline-none transition focus:border-[#0B5D3B] focus:ring-2 focus:ring-[#0B5D3B]/15 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <option value="PENDING">Pending</option>
      <option value="APPROVED">Approved</option>
      <option value="REJECTED">Rejected</option>
    </select>
  );
}
