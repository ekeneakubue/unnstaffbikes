import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex h-screen max-h-screen flex-col overflow-hidden bg-[#f4f7f5]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(11,93,59,0.12)_0%,_transparent_55%),radial-gradient(ellipse_at_bottom_left,_rgba(201,162,39,0.1)_0%,_transparent_50%)]"
      />

      <main className="relative z-10 mx-auto flex h-full w-full max-w-3xl flex-col items-center justify-center px-6 py-8 text-center sm:px-10">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-[0_8px_32px_rgba(11,93,59,0.12)] ring-1 ring-[#0B5D3B]/10 sm:mb-8 sm:h-28 sm:w-28">
          <Image
            src="/unn-logo.svg"
            alt="University of Nigeria, Nsukka logo"
            width={96}
            height={96}
            priority
            className="h-20 w-20 sm:h-24 sm:w-24"
          />
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#0B5D3B] sm:text-sm">
          University of Nigeria, Nsukka
        </p>

        <h1 className="mt-3 max-w-xl text-3xl font-bold leading-tight tracking-tight text-[#0f2419] sm:mt-4 sm:text-4xl">
          Staff Bike Registration Portal
        </h1>

        <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#4a5f52] sm:mt-5 sm:text-base">
          A secure platform for UNN staff to register personal motorcycles and bicycles for
          proper documentation, campus identification, and ownership verification.
        </p>

        <div className="mt-8 flex w-full max-w-xl flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:justify-center">
          <Link
            href="/register"
            className="inline-flex flex-1 items-center justify-center rounded-[10px] bg-[#0B5D3B] px-8 py-4 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(11,93,59,0.35)] transition hover:bg-[#094a31] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B5D3B] sm:min-w-[10rem] sm:flex-none sm:text-base"
          >
            Register Your Bike
          </Link>
          <Link
            href="/login"
            className="inline-flex flex-1 items-center justify-center rounded-[10px] border-2 border-[#C9A227] bg-white px-8 py-4 text-sm font-semibold text-[#8a6f12] transition hover:bg-[#C9A227]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A227] sm:min-w-[10rem] sm:flex-none sm:text-base"
          >
            Admin
          </Link>
        </div>
      </main>

      <footer className="relative z-10 shrink-0 pb-5 text-center text-xs text-[#6b7f73]">
        Office of Security &amp; Safety · UNN Staff Services
      </footer>
    </div>
  );
}
