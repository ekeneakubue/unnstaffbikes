import { prisma } from "@/lib/prisma";
import { getSession } from "./session";

export async function getCurrentUser() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      firstname: true,
      surname: true,
      role: true,
      isActive: true,
      profilePhotoUrl: true,
    },
  });

  if (!user || !user.isActive) {
    return null;
  }

  return user;
}

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
