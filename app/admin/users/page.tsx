import { prisma } from "@/lib/prisma";
import UsersTable from "../components/UsersTable";
import AddUserModal from "./AddUserModal";

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstname: true,
      surname: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0B5D3B]">
            Users
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[#0f2419] sm:text-3xl">
            Admin & verifier accounts
          </h1>
          <p className="mt-2 text-sm text-[#4a5f52]">
            Manage portal users who can access the admin dashboard.
          </p>
        </div>

        <AddUserModal />
      </header>

      <UsersTable users={users} />
    </div>
  );
}
