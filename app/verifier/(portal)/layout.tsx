import { requireStaffUser } from "@/lib/auth/require-user";
import VerifierShell from "../components/VerifierShell";

export default async function VerifierPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireStaffUser();

  return <VerifierShell user={user}>{children}</VerifierShell>;
}
