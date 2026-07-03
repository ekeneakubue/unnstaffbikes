"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export type OrgRow = {
  id: string;
  name: string;
  facultyName?: string | null;
  isActive: boolean;
  applicantCount: number;
  createdAt: Date;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function ToggleActiveButton({
  id,
  isActive,
  toggleActive,
}: {
  id: string;
  isActive: boolean;
  toggleActive: (id: string) => Promise<{ error?: string; success?: boolean }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await toggleActive(id);
          router.refresh();
        })
      }
      className="inline-flex h-8 items-center justify-center rounded-lg border border-[#0B5D3B]/20 px-3 text-xs font-semibold text-[#0B5D3B] transition hover:bg-[#0B5D3B]/5 disabled:opacity-60"
    >
      {isPending ? "Updating…" : isActive ? "Deactivate" : "Activate"}
    </button>
  );
}

export default function UnitsTable({
  units,
  emptyMessage = "No records found.",
  showFacultyColumn = false,
  countLabel = "Applicants",
  toggleActive,
}: {
  units: OrgRow[];
  emptyMessage?: string;
  showFacultyColumn?: boolean;
  countLabel?: string;
  toggleActive: (id: string) => Promise<{ error?: string; success?: boolean }>;
}) {
  if (units.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#0B5D3B]/20 bg-[#f4f7f5] px-6 py-12 text-center">
        <p className="text-sm text-[#6b7f73]">{emptyMessage}</p>
      </div>
    );
  }

  const headings = [
    "Name",
    ...(showFacultyColumn ? ["Faculty"] : []),
    countLabel,
    "Status",
    "Added",
    "Actions",
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-[#0B5D3B]/10">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#0B5D3B]/10">
          <thead className="bg-[#f4f7f5]">
            <tr>
              {headings.map((heading) => (
                <th
                  key={heading}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6b7f73]"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#0B5D3B]/10 bg-white">
            {units.map((unit) => (
              <tr
                key={unit.id}
                className="transition hover:bg-[#0B5D3B]/[0.03]"
              >
                <td className="px-4 py-3 text-sm font-semibold text-[#0f2419]">
                  {unit.name}
                </td>
                {showFacultyColumn ? (
                  <td className="px-4 py-3 text-sm text-[#4a5f52]">
                    {unit.facultyName ?? "—"}
                  </td>
                ) : null}
                <td className="px-4 py-3 text-sm text-[#4a5f52]">
                  {unit.applicantCount}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                      unit.isActive
                        ? "bg-[#ecfdf3] text-[#0B5D3B] ring-[#0B5D3B]/20"
                        : "bg-[#f3f4f6] text-[#6b7280] ring-[#d1d5db]/40"
                    }`}
                  >
                    {unit.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-[#6b7f73]">
                  {formatDate(unit.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <ToggleActiveButton
                    id={unit.id}
                    isActive={unit.isActive}
                    toggleActive={toggleActive}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
