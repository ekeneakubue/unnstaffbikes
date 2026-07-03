import { requireStaffUser } from "@/lib/auth/require-user";
import { getParkedBikesCount } from "@/lib/parking";
import ParkBikePanel from "../components/ParkBikePanel";

export default async function VerifierDashboardPage() {
  const user = await requireStaffUser();
  const parkedCount = await getParkedBikesCount();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header className="rounded-2xl border border-[#0B5D3B]/10 bg-white p-6 shadow-[0_4px_20px_rgba(11,93,59,0.06)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0B5D3B]">
          Officer in charge
        </p>
        <h1 className="mt-2 text-2xl font-bold text-[#0f2419] sm:text-3xl">
          {user.firstname} {user.surname}
        </h1>
      </header>

      <ParkBikePanel initialParkedCount={parkedCount} />
    </div>
  );
}
