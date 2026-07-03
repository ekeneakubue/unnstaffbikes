const roleStyles = {
  ADMIN: "bg-[#ecfdf3] text-[#0B5D3B] ring-[#0B5D3B]/20",
  VERIFIER: "bg-[#eff6ff] text-[#1d4ed8] ring-[#93c5fd]/40",
} as const;

type UserRow = {
  id: string;
  firstname: string;
  surname: string;
  email: string;
  role: keyof typeof roleStyles;
  isActive: boolean;
  createdAt: Date;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function UsersTable({
  users,
  emptyMessage = "No users found.",
}: {
  users: UserRow[];
  emptyMessage?: string;
}) {
  if (users.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#0B5D3B]/20 bg-[#f4f7f5] px-6 py-12 text-center">
        <p className="text-sm text-[#6b7f73]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#0B5D3B]/10">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#0B5D3B]/10">
          <thead className="bg-[#f4f7f5]">
            <tr>
              {["Name", "Email", "Role", "Status", "Added"].map((heading) => (
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
            {users.map((user) => (
              <tr
                key={user.id}
                className="transition hover:bg-[#0B5D3B]/[0.03]"
              >
                <td className="px-4 py-3">
                  <p className="text-sm font-semibold text-[#0f2419]">
                    {user.firstname} {user.surname}
                  </p>
                </td>
                <td className="px-4 py-3 text-sm text-[#4a5f52]">
                  {user.email}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${roleStyles[user.role]}`}
                  >
                    {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                      user.isActive
                        ? "bg-[#ecfdf3] text-[#0B5D3B] ring-[#0B5D3B]/20"
                        : "bg-[#f3f4f6] text-[#6b7280] ring-[#d1d5db]/40"
                    }`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-[#6b7f73]">
                  {formatDate(user.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export type { UserRow };
