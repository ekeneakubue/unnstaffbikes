import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ApplicantsTable from "../components/ApplicantsTable";

type SearchParams = Promise<{ status?: string }>;

export default async function ApplicantsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { status } = await searchParams;
  const validStatuses = ["PENDING", "APPROVED", "REJECTED"] as const;
  const filterStatus = validStatuses.find((item) => item === status);

  const applicants = await prisma.applicant.findMany({
    where: filterStatus ? { status: filterStatus } : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstname: true,
      middlename: true,
      surname: true,
      staffNumber: true,
      department: { select: { name: true } },
      motorcycleNo: true,
      motorcycleMake: true,
      profilePhotoUrl: true,
      status: true,
      createdAt: true,
    },
  });

  const filters = [
    { label: "All", value: undefined },
    { label: "Pending", value: "PENDING" },
    { label: "Approved", value: "APPROVED" },
    { label: "Rejected", value: "REJECTED" },
  ] as const;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0B5D3B]">
          Applicants
        </p>
        <h1 className="mt-1 text-2xl font-bold text-[#0f2419] sm:text-3xl">
          All registrations
        </h1>
        <p className="mt-2 text-sm text-[#4a5f52]">
          Browse and filter staff motorcycle registration records.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isActive = filter.value === filterStatus || (!filter.value && !filterStatus);
          const href = filter.value
            ? `/admin/applicants?status=${filter.value}`
            : "/admin/applicants";

          return (
            <Link
              key={filter.label}
              href={href}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-[#0B5D3B] text-white"
                  : "bg-white text-[#0B5D3B] ring-1 ring-[#0B5D3B]/20 hover:bg-[#0B5D3B]/5"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      <ApplicantsTable
        applicants={applicants}
        showDelete
        showStatusActions
      />
    </div>
  );
}
