"use server";

import { revalidatePath } from "next/cache";
import { requireStaffUser } from "@/lib/auth/require-user";
import { formatPersonName } from "@/lib/format-name";
import { findApplicantForParking } from "@/lib/parking";
import { prisma } from "@/lib/prisma";
import { getPhotoSrc } from "@/lib/storage/photo-url";

export type ToggleParkResult = {
  error?: string;
  success?: boolean;
  message?: string;
  bike?: {
    firstname: string;
    middlename: string | null;
    surname: string;
    staffNumber: string;
    motorcycleNo: string;
    isParked: boolean;
    photoUrl?: string;
  };
  parkedCount?: number;
};

export type LookupBikeResult = {
  error?: string;
  bike?: {
    firstname: string;
    middlename: string | null;
    surname: string;
    staffNumber: string;
    motorcycleNo: string;
    isParked: boolean;
    status: "PENDING" | "APPROVED" | "REJECTED";
    photoUrl?: string;
  };
};

export async function lookupBikeForParking(
  query: string,
): Promise<LookupBikeResult> {
  await requireStaffUser();

  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return { error: "Enter a staff number or registration number." };
  }

  const applicant = await findApplicantForParking(trimmedQuery);

  if (!applicant) {
    return {
      error: "No bike found for this number. Check the details and try again.",
    };
  }

  return {
    bike: {
      firstname: applicant.firstname,
      middlename: applicant.middlename,
      surname: applicant.surname,
      staffNumber: applicant.staffNumber,
      motorcycleNo: applicant.motorcycleNo,
      isParked: applicant.isParked,
      status: applicant.status,
      photoUrl: getPhotoSrc(applicant.profilePhotoUrl) ?? undefined,
    },
  };
}

export async function toggleParkBike(query: string): Promise<ToggleParkResult> {
  const user = await requireStaffUser();
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return { error: "Enter a staff number or registration number." };
  }

  const applicant = await findApplicantForParking(trimmedQuery);

  if (!applicant) {
    return {
      error:
        "No bike found for this number. Check the details and try again.",
    };
  }

  if (applicant.status !== "APPROVED") {
    return {
      error: "Only approved bikes can be parked or unparked.",
    };
  }

  const nextParked = !applicant.isParked;

  try {
    await prisma.applicant.update({
      where: { id: applicant.id },
      data: {
        isParked: nextParked,
        parkedAt: nextParked ? new Date() : null,
        parkedById: nextParked ? user.id : null,
      },
    });

    const parkedCount = await prisma.applicant.count({
      where: { isParked: true, status: "APPROVED" },
    });

    revalidatePath("/verifier");

    return {
      success: true,
      message: nextParked
        ? `${formatPersonName(applicant)}'s bike is now parked.`
        : `${formatPersonName(applicant)}'s bike has been unparked.`,
      bike: {
        firstname: applicant.firstname,
        middlename: applicant.middlename,
        surname: applicant.surname,
        staffNumber: applicant.staffNumber,
        motorcycleNo: applicant.motorcycleNo,
        isParked: nextParked,
        photoUrl: getPhotoSrc(applicant.profilePhotoUrl) ?? undefined,
      },
      parkedCount,
    };
  } catch {
    return { error: "Unable to update parking status. Please try again." };
  }
}
