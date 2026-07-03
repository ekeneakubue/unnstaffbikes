import { requireAdmin } from "@/lib/auth/require-user";
import AdminShell from "./components/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="register-page min-h-screen bg-[#f4f7f5]">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(11,93,59,0.08)_0%,_transparent_55%),radial-gradient(ellipse_at_bottom_left,_rgba(201,162,39,0.06)_0%,_transparent_50%)]"
      />

      <div className="relative z-10 mx-auto min-h-screen max-w-7xl">
        <AdminShell>{children}</AdminShell>
      </div>
    </div>
  );
}
