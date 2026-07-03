"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-user";
import { prisma } from "@/lib/prisma";

export type AdminFormState = {
  error?: string;
  success?: boolean;
};

function revalidateFacultyPaths() {
  revalidatePath("/admin/faculties");
  revalidatePath("/admin/departments");
}

export async function createFaculty(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    return { error: "Name is required." };
  }

  try {
    await prisma.faculty.create({ data: { name } });
    revalidateFacultyPaths();
    return { success: true };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return { error: "This faculty name already exists." };
    }

    return { error: "Failed to save. Please try again." };
  }
}

export async function toggleFacultyActive(
  id: string,
): Promise<{ error?: string; success?: boolean }> {
  await requireAdmin();

  const record = await prisma.faculty.findUnique({
    where: { id },
    select: { isActive: true },
  });

  if (!record) {
    return { error: "Faculty not found." };
  }

  try {
    await prisma.faculty.update({
      where: { id },
      data: { isActive: !record.isActive },
    });

    revalidateFacultyPaths();
    return { success: true };
  } catch {
    return { error: "Failed to update. Please try again." };
  }
}
