"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-user";
import { prisma } from "@/lib/prisma";

export type AdminFormState = {
  error?: string;
  success?: boolean;
};

function revalidateStationPaths() {
  revalidatePath("/admin/stations");
}

export async function createStation(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    return { error: "Name is required." };
  }

  try {
    await prisma.station.create({ data: { name } });
    revalidateStationPaths();
    return { success: true };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return { error: "This station name already exists." };
    }

    return { error: "Failed to save. Please try again." };
  }
}

export async function toggleStationActive(
  id: string,
): Promise<{ error?: string; success?: boolean }> {
  await requireAdmin();

  const record = await prisma.station.findUnique({
    where: { id },
    select: { isActive: true },
  });

  if (!record) {
    return { error: "Station not found." };
  }

  try {
    await prisma.station.update({
      where: { id },
      data: { isActive: !record.isActive },
    });

    revalidateStationPaths();
    return { success: true };
  } catch {
    return { error: "Failed to update. Please try again." };
  }
}
