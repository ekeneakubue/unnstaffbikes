import { prisma } from "@/lib/prisma";
import UnitsTable from "../components/UnitsTable";
import AddDepartmentModal from "./AddDepartmentModal";
import { toggleDepartmentActive } from "./actions";

export default async function DepartmentsPage() {
  const [departments, faculties] = await Promise.all([
    prisma.department.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        isActive: true,
        createdAt: true,
        facultyId: true,
        _count: { select: { applicants: true } },
      },
    }),
    prisma.faculty.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const facultyMap = new Map(faculties.map((faculty) => [faculty.id, faculty.name]));

  const rows = departments.map((department) => ({
    id: department.id,
    name: department.name,
    facultyName: facultyMap.get(department.facultyId) ?? null,
    isActive: department.isActive,
    applicantCount: department._count.applicants,
    createdAt: department.createdAt,
  }));

  const facultyOptions = faculties.map((faculty) => ({
    id: faculty.id,
    name: faculty.name,
  }));

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0B5D3B]">
            Manage departments
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[#0f2419] sm:text-3xl">
            Departments
          </h1>
          <p className="mt-2 text-sm text-[#4a5f52]">
            Add and manage departments used during bike registration.
          </p>
        </div>

        <AddDepartmentModal faculties={facultyOptions} />
      </header>

      <UnitsTable
        units={rows}
        emptyMessage="No departments found."
        showFacultyColumn
        toggleActive={toggleDepartmentActive}
      />
    </div>
  );
}
