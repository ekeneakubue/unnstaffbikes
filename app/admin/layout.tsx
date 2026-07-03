import AdminSidebar from "./components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="register-page min-h-screen bg-[#f4f7f5]">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(11,93,59,0.08)_0%,_transparent_55%),radial-gradient(ellipse_at_bottom_left,_rgba(201,162,39,0.06)_0%,_transparent_50%)]"
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl">
        <div className="hidden w-64 shrink-0 md:block">
          <div className="fixed h-screen w-64">
            <AdminSidebar />
          </div>
        </div>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
