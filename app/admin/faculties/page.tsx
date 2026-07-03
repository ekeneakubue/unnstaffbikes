import { prisma } from "@/lib/prisma";
import UnitsTable from "../components/UnitsTable";
import AddFacultyModal from "./AddFacultyModal";
import { toggleFacultyActive } from "./actions";

export default async function FacultiesPage() {
  const faculties = await prisma.faculty.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      isActive: true,
      createdAt: true,
      departments: {
        select: { _count: { select: { applicants: true } } },
      },
    },
  });

  const rows = faculties.map((faculty) => ({
    id: faculty.id,
    name: faculty.name,
    isActive: faculty.isActive,
    applicantCount: faculty.departments.reduce(
      (total, department) => total + department._count.applicants,
      0,
    ),
    createdAt: faculty.createdAt,
  }));

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0B5D3B]">
            Manage faculties
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[#0f2419] sm:text-3xl">
            Faculties
          </h1>
          <p className="mt-2 text-sm text-[#4a5f52]">
            Add and manage faculties used during bike registration.
          </p>
        </div>

        <AddFacultyModal />
      </header>

      <UnitsTable
        units={rows}
        emptyMessage="No faculties found."
        countLabel="Applicants"
        toggleActive={toggleFacultyActive}
      />
    </div>
  );
}
