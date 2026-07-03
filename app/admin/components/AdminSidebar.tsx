import Image from "next/image";
import Link from "next/link";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "▦" },
  { href: "/admin/users", label: "Users", icon: "◎" },
  { href: "/admin/applicants", label: "Applicants", icon: "☰" },
];

export default function AdminSidebar({
  onNavigate,
  showCloseButton = false,
  onClose,
}: {
  onNavigate?: () => void;
  showCloseButton?: boolean;
  onClose?: () => void;
}) {
  return (
    <aside className="flex h-full w-full flex-col border-r border-[#0B5D3B]/10 bg-white">
      <div className="flex items-center justify-between border-b border-[#0B5D3B]/10 px-5 py-5">
        <Link href="/" className="flex items-center gap-3" onClick={onNavigate}>
          <Image
            src="/unn-logo.svg"
            alt="UNN logo"
            width={40}
            height={40}
            className="h-10 w-10"
          />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0B5D3B]">
              UNN Admin
            </p>
            <p className="text-sm font-bold text-[#0f2419]">Staff Bikes</p>
          </div>
        </Link>
        {showCloseButton ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#0B5D3B]/20 text-[#0B5D3B] transition hover:bg-[#0B5D3B]/5"
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        ) : null}
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#4a5f52] transition hover:bg-[#0B5D3B]/5 hover:text-[#0B5D3B]"
          >
            <span aria-hidden className="text-base">
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-[#0B5D3B]/10 px-5 py-4">
        <Link
          href="/"
          onClick={onNavigate}
          className="text-sm font-medium text-[#0B5D3B] transition hover:text-[#094a31]"
        >
          ← Back to portal
        </Link>
      </div>
    </aside>
  );
}
