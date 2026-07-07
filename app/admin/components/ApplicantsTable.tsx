import ApplicantAvatar from "./ApplicantAvatar";
import ApplicantStatusSelect from "./ApplicantStatusSelect";
import DeleteApplicantButton from "./DeleteApplicantButton";
import { formatPersonName } from "@/lib/format-name";

const statusStyles = {
  PENDING: "bg-[#fff7ed] text-[#b45309] ring-[#fbbf24]/30",
  APPROVED: "bg-[#ecfdf3] text-[#0B5D3B] ring-[#0B5D3B]/20",
  REJECTED: "bg-[#fef2f2] text-[#b91c1c] ring-[#f87171]/30",
} as const;

type ApplicantRow = {
  id: string;
  firstname: string;
  middlename: string | null;
  surname: string;
  staffNumber: string;
  department: { name: string };
  motorcycleNo: string;
  motorcycleMake: string;
  profilePhotoUrl: string | null;
  status: keyof typeof statusStyles;
  createdAt: Date;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function ApplicantsTable({
  applicants,
  emptyMessage = "No applicants found.",
  showDelete = false,
  showStatusActions = false,
}: {
  applicants: ApplicantRow[];
  emptyMessage?: string;
  showDelete?: boolean;
  showStatusActions?: boolean;
}) {
  if (applicants.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#0B5D3B]/20 bg-[#f4f7f5] px-6 py-12 text-center">
        <p className="text-sm text-[#6b7f73]">{emptyMessage}</p>
      </div>
    );
  }

  const headings = [
    "Applicant",
    "Staff No",
    "Department",
    "Motorcycle",
    "Status",
    "Registered",
    ...(showDelete ? ["Actions"] : []),
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
            {applicants.map((applicant) => {
              const fullName = formatPersonName(applicant);

              return (
                <tr
                  key={applicant.id}
                  className="transition hover:bg-[#0B5D3B]/[0.03]"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ApplicantAvatar
                        name={fullName}
                        photoUrl={applicant.profilePhotoUrl}
                      />
                      <p className="text-sm font-semibold text-[#0f2419]">
                        {fullName}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#4a5f52]">
                    {applicant.staffNumber}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#4a5f52]">
                    {applicant.department.name}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-[#0f2419]">
                      {applicant.motorcycleNo}
                    </p>
                    <p className="text-xs text-[#6b7f73]">
                      {applicant.motorcycleMake}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {showStatusActions && applicant.status === "PENDING" ? (
                      <ApplicantStatusSelect id={applicant.id} />
                    ) : (
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[applicant.status]}`}
                      >
                        {applicant.status.charAt(0) +
                          applicant.status.slice(1).toLowerCase()}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#6b7f73]">
                    {formatDate(applicant.createdAt)}
                  </td>
                  {showDelete ? (
                    <td className="px-4 py-3">
                      <DeleteApplicantButton
                        id={applicant.id}
                        name={fullName}
                      />
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export type { ApplicantRow };
