import { prisma } from "@/lib/prisma";
import UnitsTable from "../components/UnitsTable";
import AddUnitModal from "./AddUnitModal";
import { toggleStationActive } from "./actions";

export default async function StationsPage() {
  const stations = await prisma.station.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      isActive: true,
      createdAt: true,
    },
  });

  const rows = stations.map((station) => ({
    id: station.id,
    name: station.name,
    isActive: station.isActive,
    applicantCount: 0,
    createdAt: station.createdAt,
  }));

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0B5D3B]">
            Manage stations
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[#0f2419] sm:text-3xl">
            Stations
          </h1>
          <p className="mt-2 text-sm text-[#4a5f52]">
            Add and manage stations used during bike registration.
          </p>
        </div>

        <AddUnitModal />
      </header>

      <UnitsTable
        units={rows}
        emptyMessage="No stations found."
        countLabel="Applicants"
        toggleActive={toggleStationActive}
      />
    </div>
  );
}
