import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import StaffLoginForm from "@/components/StaffLoginForm";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ next?: string }>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await getCurrentUser();
  const { next } = await searchParams;

  if (user) {
    redirect(user.role === "ADMIN" ? "/admin" : "/verifier");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f7f5] px-4 py-10">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-[#0B5D3B] hover:text-[#094a31]"
        >
          <span aria-hidden>←</span>
          Home
        </Link>

        <div className="mb-6 flex items-center gap-3">
          <Image
            src="/unn-logo.svg"
            alt="UNN logo"
            width={40}
            height={40}
            className="h-10 w-10"
            priority
          />
          <h1 className="text-xl font-bold text-[#0f2419]">Sign in</h1>
        </div>

        <div className="rounded-[10px] border border-[#0B5D3B]/10 bg-white p-6 shadow-sm">
          <StaffLoginForm next={next} />
        </div>
      </div>
    </div>
  );
}
