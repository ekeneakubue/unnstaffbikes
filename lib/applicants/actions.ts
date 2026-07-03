"use server";

import { revalidatePath } from "next/cache";
import type { ApplicantStatus } from "@/lib/generated/prisma/enums";
import { requireStaffUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/prisma";
import { storageKeyFromPhotoUrl } from "@/lib/storage/photo-url";
import { safeDeleteUploadedPhoto } from "@/lib/upload-profile-photo";

const validStatuses = ["PENDING", "APPROVED", "REJECTED"] as const;

export type UpdateApplicantStatusResult = {
  error?: string;
  success?: boolean;
};

export type DeleteApplicantResult = {
  error?: string;
  success?: boolean;
};

function revalidateApplicantPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/applicants");
    revalidatePath("/verifier");
    revalidatePath("/verifier/bikes");
    revalidatePath("/verify");
}

export async function updateApplicantStatus(
  id: string,
  status: ApplicantStatus,
): Promise<UpdateApplicantStatusResult> {
  const user = await requireStaffUser();

  if (!validStatuses.includes(status)) {
    return { error: "Invalid status." };
  }

  const applicant = await prisma.applicant.findUnique({
    where: { id },
    select: { id: true, status: true },
  });

  if (!applicant) {
    return { error: "Applicant not found." };
  }

  if (applicant.status === status) {
    return { success: true };
  }

  try {
    await prisma.applicant.update({
      where: { id },
      data: {
        status,
        verifiedAt:
          status === "APPROVED" || status === "REJECTED" ? new Date() : null,
        verifiedById:
          status === "PENDING"
            ? null
            : user.id,
      },
    });

    revalidateApplicantPaths();

    return { success: true };
  } catch {
    return { error: "Failed to update status. Please try again." };
  }
}

export async function deleteApplicant(
  id: string,
): Promise<DeleteApplicantResult> {
  const user = await requireStaffUser();

  if (user.role !== "ADMIN") {
    return { error: "Only administrators can delete registrations." };
  }

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

    revalidateApplicantPaths();

    return { success: true };
  } catch {
    return { error: "Failed to delete applicant. Please try again." };
  }
}
