"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [mobileOpen]);

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-[#0B5D3B]/10 bg-white px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={mobileOpen}
          aria-controls="admin-mobile-nav"
          className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#0B5D3B]/20 text-[#0B5D3B] transition hover:bg-[#0B5D3B]/5"
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0B5D3B]">
            UNN Admin
          </p>
          <p className="text-sm font-bold text-[#0f2419]">Staff Bikes</p>
        </div>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={closeMobileMenu}
            className="absolute inset-0 bg-[#0f2419]/40"
          />
          <div
            id="admin-mobile-nav"
            className="absolute left-0 top-0 h-full w-72 max-w-[85vw] shadow-[0_12px_40px_rgba(11,93,59,0.18)]"
          >
            <AdminSidebar onNavigate={closeMobileMenu} showCloseButton onClose={closeMobileMenu} />
          </div>
        </div>
      ) : null}

      <div className="flex min-h-[calc(100vh-57px)] md:min-h-screen">
        <div className="hidden w-64 shrink-0 md:block">
          <div className="fixed h-screen w-64">
            <AdminSidebar />
          </div>
        </div>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </main>
      </div>
    </>
  );
}
