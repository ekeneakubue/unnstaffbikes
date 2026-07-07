import { formatPersonName } from "@/lib/format-name";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeVerificationQuery } from "@/lib/normalize-verification-query";
import { getPhotoSrc } from "@/lib/storage/photo-url";

export type VerifiedOwner = {
  firstname: string;
  middlename: string | null;
  surname: string;
  staffNumber: string;
  department: string;
  motorcycleNo: string;
  motorcycleMake: string;
  engineNumber: string;
  photoUrl?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

type VerificationRow = {
  firstname: string;
  middlename: string | null;
  surname: string;
  staffNumber: string;
  motorcycleNo: string;
  motorcycleMake: string;
  engineNumber: string;
  profilePhotoUrl: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  departmentName: string;
};

function mapVerificationRow(row: VerificationRow): VerifiedOwner {
  return {
    firstname: row.firstname,
    middlename: row.middlename,
    surname: row.surname,
    staffNumber: row.staffNumber,
    department: row.departmentName,
    motorcycleNo: row.motorcycleNo,
    motorcycleMake: row.motorcycleMake,
    engineNumber: row.engineNumber,
    photoUrl: getPhotoSrc(row.profilePhotoUrl) ?? undefined,
    status: row.status,
  };
}

export async function findApplicantForVerification(
  query: string,
): Promise<VerifiedOwner | null> {
  const normalizedQuery = normalizeVerificationQuery(query);

  if (!normalizedQuery) {
    return null;
  }

  const rows = await prisma.$queryRaw<VerificationRow[]>(Prisma.sql`
    SELECT
      a."firstname",
      a."middlename",
      a."surname",
      a."staffNumber",
      a."motorcycleNo",
      a."motorcycleMake",
      a."engineNumber",
      a."profilePhotoUrl",
      a."status",
      d."name" AS "departmentName"
    FROM "applicants" a
    INNER JOIN "departments" d ON d."id" = a."departmentId"
    WHERE
      LOWER(REPLACE(REPLACE(a."staffNumber", ' ', ''), '.', '/')) = ${normalizedQuery}
      OR LOWER(REPLACE(REPLACE(a."motorcycleNo", ' ', ''), '.', '/')) = ${normalizedQuery}
    LIMIT 1
  `);

  const applicant = rows[0];

  if (!applicant) {
    return null;
  }

  return mapVerificationRow(applicant);
}
