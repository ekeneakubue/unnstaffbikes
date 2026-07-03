import { redirect } from "next/navigation";
import { getCurrentUser } from "./get-current-user";

export async function requireStaffUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireStaffUser();

  if (user.role !== "ADMIN") {
    redirect("/verifier");
  }

  return user;
}
