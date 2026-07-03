"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-user";
import { prisma } from "@/lib/prisma";

export type AdminFormState = {
  error?: string;
  success?: boolean;
};

function revalidateDepartmentPaths() {
  revalidatePath("/admin/departments");
}

export async function createDepartment(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const facultyId = String(formData.get("facultyId") ?? "").trim();

  if (!name) {
    return { error: "Name is required." };
  }

  if (!facultyId) {
    return { error: "Faculty is required." };
  }

  const faculty = await prisma.faculty.findFirst({
    where: { id: facultyId, isActive: true },
    select: { id: true },
  });

  if (!faculty) {
    return { error: "Selected faculty is invalid." };
  }

  try {
    await prisma.department.create({
      data: { name, facultyId },
    });

    revalidateDepartmentPaths();
    return { success: true };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return { error: "This department name already exists." };
    }

    return { error: "Failed to save. Please try again." };
  }
}

export async function toggleDepartmentActive(
  id: string,
): Promise<{ error?: string; success?: boolean }> {
  await requireAdmin();

  const record = await prisma.department.findUnique({
    where: { id },
    select: { isActive: true },
  });

  if (!record) {
    return { error: "Department not found." };
  }

  try {
    await prisma.department.update({
      where: { id },
      data: { isActive: !record.isActive },
    });

    revalidateDepartmentPaths();
    return { success: true };
  } catch {
    return { error: "Failed to update. Please try again." };
  }
}
