"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { storageKeyFromPhotoUrl } from "@/lib/storage/photo-url";
import { safeDeleteUploadedPhoto } from "@/lib/upload-profile-photo";

export type DeleteApplicantResult = {
  error?: string;
  success?: boolean;
};

export async function deleteApplicant(
  id: string,
): Promise<DeleteApplicantResult> {
  const applicant = await prisma.applicant.findUnique({
    where: { id },
    select: { profilePhotoUrl: true },
  });

  if (!applicant) {
    return { error: "Applicant not found." };
  }

  try {
    await prisma.applicant.delete({ where: { id } });

    const photoKey = storageKeyFromPhotoUrl(applicant.profilePhotoUrl);
    if (photoKey) {
      await safeDeleteUploadedPhoto(photoKey);
    }

    revalidatePath("/admin");
    revalidatePath("/admin/applicants");

    return { success: true };
  } catch {
    return { error: "Failed to delete applicant. Please try again." };
  }
}
