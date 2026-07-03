import { redirect } from "next/navigation";

type SearchParams = Promise<{ next?: string }>;

export default async function VerifierLoginRedirect({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { next } = await searchParams;
  redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
}
