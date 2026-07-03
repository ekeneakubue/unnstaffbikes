import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ApplicantsTable from "./components/ApplicantsTable";
import StatCard from "./components/StatCard";

async function getDashboardData() {
  const [total, pending, approved, rejected, recentApplicants] =
    await Promise.all([
      prisma.applicant.count(),
      prisma.applicant.count({ where: { status: "PENDING" } }),
      prisma.applicant.count({ where: { status: "APPROVED" } }),
      prisma.applicant.count({ where: { status: "REJECTED" } }),
      prisma.applicant.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          firstname: true,
          surname: true,
          staffNumber: true,
          department: { select: { name: true } },
          motorcycleNo: true,
          motorcycleMake: true,
          profilePhotoUrl: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

  return { total, pending, approved, rejected, recentApplicants };
}

export default async function AdminDashboardPage() {
  let total = 0;
  let pending = 0;
  let approved = 0;
  let rejected = 0;
  let recentApplicants: Awaited<
    ReturnType<typeof getDashboardData>
  >["recentApplicants"] = [];
  let dbError = false;

  try {
    const data = await getDashboardData();
    total = data.total;
    pending = data.pending;
    approved = data.approved;
    rejected = data.rejected;
    recentApplicants = data.recentApplicants;
  } catch {
    dbError = true;
  }

  return (
    <div className="space-y-8">
      {dbError ? (
        <div
          role="alert"
          className="rounded-xl border border-[#b45309]/25 bg-[#fff7ed] px-4 py-3 text-sm text-[#92400e]"
        >
          Unable to load dashboard data. Please check your database connection.
        </div>
      ) : null}
      <header className="register-enter flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0B5D3B]">
            Admin Dashboard
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[#0f2419] sm:text-3xl">
            Motorcycle Registrations
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#4a5f52]">
            Monitor staff bike applications, review pending registrations, and
            track verification activity across UNN.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/applicants"
            className="inline-flex h-10 items-center justify-center rounded-xl border-2 border-[#0B5D3B]/25 px-4 text-sm font-semibold text-[#0B5D3B] transition hover:bg-[#0B5D3B]/5"
          >
            View all applicants
          </Link>
          <Link
            href="/verify"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-[#0B5D3B] px-4 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(11,93,59,0.3)] transition hover:bg-[#094a31]"
          >
            Verify owner
          </Link>
        </div>
      </header>

      <section className="register-enter register-enter-delay-1 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total registrations"
          value={total}
          hint="All submitted applications"
          accent="green"
        />
        <StatCard
          label="Pending review"
          value={pending}
          hint="Awaiting verification"
          accent="amber"
        />
        <StatCard
          label="Approved"
          value={approved}
          hint="Verified and documented"
          accent="gold"
        />
        <StatCard
          label="Rejected"
          value={rejected}
          hint="Declined applications"
          accent="red"
        />
      </section>

      <section className="register-enter register-enter-delay-2 grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-[#0B5D3B]/10 bg-white p-5 shadow-[0_4px_20px_rgba(11,93,59,0.06)] lg:col-span-1">
          <h2 className="text-sm font-semibold text-[#0f2419]">Quick actions</h2>
          <ul className="mt-4 space-y-2">
            {[
              { href: "/admin/applicants?status=PENDING", label: "Review pending applications" },
              { href: "/verify", label: "Look up owner by staff or reg no" },
              { href: "/register", label: "Open public registration form" },
            ].map((action) => (
              <li key={action.href}>
                <Link
                  href={action.href}
                  className="flex items-center justify-between rounded-xl border border-[#0B5D3B]/10 px-3 py-2.5 text-sm font-medium text-[#0B5D3B] transition hover:bg-[#0B5D3B]/5"
                >
                  {action.label}
                  <span aria-hidden>→</span>
                </Link>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-[#0B5D3B]/10 bg-white p-5 shadow-[0_4px_20px_rgba(11,93,59,0.06)] lg:col-span-2">
          <h2 className="text-sm font-semibold text-[#0f2419]">
            Registration overview
          </h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-[#f4f7f5] p-4">
              <dt className="text-xs uppercase tracking-wide text-[#6b7f73]">
                Approval rate
              </dt>
              <dd className="mt-1 text-xl font-bold text-[#0B5D3B]">
                {total === 0 ? "—" : `${Math.round((approved / total) * 100)}%`}
              </dd>
            </div>
            <div className="rounded-xl bg-[#f4f7f5] p-4">
              <dt className="text-xs uppercase tracking-wide text-[#6b7f73]">
                Pending queue
              </dt>
              <dd className="mt-1 text-xl font-bold text-[#b45309]">{pending}</dd>
            </div>
            <div className="rounded-xl bg-[#f4f7f5] p-4">
              <dt className="text-xs uppercase tracking-wide text-[#6b7f73]">
                Processed
              </dt>
              <dd className="mt-1 text-xl font-bold text-[#0f2419]">
                {approved + rejected}
              </dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="register-enter register-enter-delay-3">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#0f2419]">
              Recent registrations
            </h2>
            <p className="text-sm text-[#6b7f73]">
              Latest staff motorcycle applications
            </p>
          </div>
          <Link
            href="/admin/applicants"
            className="text-sm font-semibold text-[#0B5D3B] hover:text-[#094a31]"
          >
            See all
          </Link>
        </div>

        <ApplicantsTable
          applicants={recentApplicants}
          emptyMessage="No registrations yet. Applications will appear here once staff submit the form."
        />
      </section>
    </div>
  );
}
