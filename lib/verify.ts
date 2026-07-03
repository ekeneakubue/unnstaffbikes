import { prisma } from "@/lib/prisma";
import { getPhotoSrc } from "@/lib/storage/photo-url";

export type VerifiedOwner = {
  firstname: string;
  surname: string;
  staffNumber: string;
  department: string;
  motorcycleNo: string;
  motorcycleMake: string;
  engineNumber: string;
  photoUrl?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

export async function findApplicantForVerification(
  query: string,
): Promise<VerifiedOwner | null> {
  const applicant = await prisma.applicant.findFirst({
    where: {
      OR: [
        {
          staffNumber: {
            equals: query,
            mode: "insensitive",
          },
        },
        {
          motorcycleNo: {
            equals: query,
            mode: "insensitive",
          },
        },
      ],
    },
    select: {
      firstname: true,
      surname: true,
      staffNumber: true,
      motorcycleNo: true,
      motorcycleMake: true,
      engineNumber: true,
      profilePhotoUrl: true,
      status: true,
      department: { select: { name: true } },
    },
  });

  if (!applicant) {
    return null;
  }

  return {
    firstname: applicant.firstname,
    surname: applicant.surname,
    staffNumber: applicant.staffNumber,
    department: applicant.department.name,
    motorcycleNo: applicant.motorcycleNo,
    motorcycleMake: applicant.motorcycleMake,
    engineNumber: applicant.engineNumber,
    photoUrl: getPhotoSrc(applicant.profilePhotoUrl) ?? undefined,
    status: applicant.status,
  };
}
