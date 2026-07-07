import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeVerificationQuery } from "@/lib/normalize-verification-query";

export type ParkingBike = {
  id: string;
  firstname: string;
  middlename: string | null;
  surname: string;
  staffNumber: string;
  motorcycleNo: string;
  motorcycleMake: string;
  profilePhotoUrl: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  isParked: boolean;
};

type ParkingRow = {
  id: string;
  firstname: string;
  middlename: string | null;
  surname: string;
  staffNumber: string;
  motorcycleNo: string;
  motorcycleMake: string;
  profilePhotoUrl: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  isParked: boolean;
};

export async function getParkedBikesCount() {
  return prisma.applicant.count({
    where: {
      isParked: true,
      status: "APPROVED",
    },
  });
}

export async function findApplicantForParking(
  query: string,
): Promise<ParkingBike | null> {
  const normalizedQuery = normalizeVerificationQuery(query);

  if (!normalizedQuery) {
    return null;
  }

  const rows = await prisma.$queryRaw<ParkingRow[]>(Prisma.sql`
    SELECT
      a."id",
      a."firstname",
      a."middlename",
      a."surname",
      a."staffNumber",
      a."motorcycleNo",
      a."motorcycleMake",
      a."profilePhotoUrl",
      a."status",
      a."isParked"
    FROM "applicants" a
    WHERE
      LOWER(REPLACE(REPLACE(a."staffNumber", ' ', ''), '.', '/')) = ${normalizedQuery}
      OR LOWER(REPLACE(REPLACE(a."motorcycleNo", ' ', ''), '.', '/')) = ${normalizedQuery}
    LIMIT 1
  `);

  return rows[0] ?? null;
}
