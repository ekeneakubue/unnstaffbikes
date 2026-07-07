import { formatPersonName } from "@/lib/format-name";
import { prisma } from "@/lib/prisma";

export type RegistrationInput = {
  firstname: string;
  middlename: string | null;
  surname: string;
  phoneNumber: string;
  staffNumber: string;
  department: string;
  stateOfOrigin: string;
  localGovernment: string;
  motorcycleNo: string;
  motorcycleMake: string;
  engineNumber: string;
  profilePhotoUrl: string;
};

export function parseRegistrationForm(formData: FormData): RegistrationInput | string {
  const firstname = String(formData.get("firstname") ?? "").trim();
  const middlename = String(formData.get("middlename") ?? "").trim();
  const surname = String(formData.get("surname") ?? "").trim();
  const phoneNumber = String(formData.get("phoneNumber") ?? "").trim();
  const staffNumber = String(formData.get("staffNumber") ?? "").trim();
  const department = String(formData.get("department") ?? "").trim();
  const stateOfOrigin = String(formData.get("stateOfOrigin") ?? "").trim();
  const localGovernment = String(formData.get("localGovernment") ?? "").trim();
  const motorcycleNo = String(formData.get("motorcycleNo") ?? "").trim();
  const motorcycleMake = String(formData.get("motorcycleMake") ?? "").trim();
  const engineNumber = String(formData.get("engineNumber") ?? "").trim();
  const profilePhotoUrl = String(formData.get("profilePhotoUrl") ?? "").trim();

  if (!firstname) return "Firstname is required.";
  if (!surname) return "Surname is required.";
  if (!phoneNumber) return "Phone number is required.";
  if (!staffNumber) return "Staff number is required.";
  if (!department) return "Department is required.";
  if (!stateOfOrigin) return "State of origin is required.";
  if (!localGovernment) return "Local government is required.";
  if (!motorcycleNo) return "Motorcycle number is required.";
  if (!motorcycleMake) return "Motorcycle make is required.";
  if (!engineNumber) return "Engine number is required.";
  if (!profilePhotoUrl) return "Profile photo is required.";

  return {
    firstname,
    middlename: middlename || null,
    surname,
    phoneNumber,
    staffNumber,
    department,
    stateOfOrigin,
    localGovernment,
    motorcycleNo,
    motorcycleMake,
    engineNumber,
    profilePhotoUrl,
  };
}

export async function findDepartmentByName(name: string) {
  const department = await prisma.department.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      isActive: true,
    },
  });

  if (!department) {
    throw new Error(
      "Department not found. Please enter a department that has been added by the admin.",
    );
  }

  return department;
}

export async function findDuplicateApplicants(input: RegistrationInput) {
  return prisma.applicant.findMany({
    where: {
      OR: [
        { staffNumber: input.staffNumber },
        { motorcycleNo: input.motorcycleNo },
        { engineNumber: input.engineNumber },
      ],
    },
    select: {
      firstname: true,
      middlename: true,
      surname: true,
      staffNumber: true,
      motorcycleNo: true,
      engineNumber: true,
      status: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

function duplicateFieldsForRecord(
  input: RegistrationInput,
  record: {
    staffNumber: string;
    motorcycleNo: string;
    engineNumber: string;
  },
) {
  const fields: string[] = [];

  if (record.staffNumber === input.staffNumber) {
    fields.push("staff number");
  }
  if (record.motorcycleNo === input.motorcycleNo) {
    fields.push("motorcycle number");
  }
  if (record.engineNumber === input.engineNumber) {
    fields.push("engine number");
  }

  return fields;
}

export function formatDuplicateApplicantsMessage(
  input: RegistrationInput,
  matches: Awaited<ReturnType<typeof findDuplicateApplicants>>,
) {
  if (matches.length === 0) {
    return "A record with these details already exists.";
  }

  const lines = matches.map((record) => {
    const name = formatPersonName(record);
    const conflicts = duplicateFieldsForRecord(input, record);
    const status =
      record.status.charAt(0) + record.status.slice(1).toLowerCase();

    return `• ${name} (Staff: ${record.staffNumber}, Motorcycle: ${record.motorcycleNo}, Engine: ${record.engineNumber}, Status: ${status}) — matching ${conflicts.join(", ")}`;
  });

  return `A record with these details already exists. Matching records:\n${lines.join("\n")}`;
}

export async function createApplicant(input: RegistrationInput) {
  const duplicates = await findDuplicateApplicants(input);
  if (duplicates.length > 0) {
    throw new Error(formatDuplicateApplicantsMessage(input, duplicates));
  }

  const departmentRecord = await findDepartmentByName(input.department);

  return prisma.applicant.create({
    data: {
      firstname: input.firstname,
      middlename: input.middlename,
      surname: input.surname,
      phoneNumber: input.phoneNumber,
      staffNumber: input.staffNumber,
      departmentId: departmentRecord.id,
      stateOfOrigin: input.stateOfOrigin,
      localGovernment: input.localGovernment,
      motorcycleNo: input.motorcycleNo,
      motorcycleMake: input.motorcycleMake,
      engineNumber: input.engineNumber,
      profilePhotoUrl: input.profilePhotoUrl,
    },
    select: {
      id: true,
      staffNumber: true,
      motorcycleNo: true,
      profilePhotoUrl: true,
    },
  });
}

function isR2AccessDenied(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    (("Code" in error && error.Code === "AccessDenied") ||
      ("name" in error && error.name === "AccessDenied"))
  );
}

export function getRegistrationErrorStatus(error: unknown) {
  if (
    error instanceof Error &&
    (error.message.includes("All R2 upload methods failed") ||
      isR2AccessDenied(error))
  ) {
    return 503;
  }
  return 500;
}

export async function formatRegistrationError(
  error: unknown,
  input?: RegistrationInput,
) {
  if (
    error instanceof Error &&
    error.message.includes("All R2 upload methods failed")
  ) {
    return `Photo upload to Cloudflare R2 failed. ${error.message}. Create an R2 API token with Object Read & Write for the unnstaffbikes bucket, or give CLOUDFLARE_API_TOKEN R2 edit permissions.`;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "InvalidArgument" &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.includes("Credential access key")
  ) {
    return "Cloudflare R2 credentials are invalid. Check R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY in your .env file.";
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  ) {
    if (input) {
      const matches = await findDuplicateApplicants(input);
      if (matches.length > 0) {
        return formatDuplicateApplicantsMessage(input, matches);
      }
    }

    const target = Array.isArray((error as { meta?: { target?: string[] } }).meta?.target)
      ? (error as { meta?: { target?: string[] } }).meta?.target?.[0]
      : undefined;

    if (target === "staffNumber") {
      return "This staff number is already registered.";
    }
    if (target === "motorcycleNo") {
      return "This motorcycle number is already registered.";
    }
    if (target === "engineNumber") {
      return "This engine number is already registered.";
    }

    return "A record with these details already exists.";
  }

  if (
    error instanceof Error &&
    error.message.startsWith("A record with these details already exists")
  ) {
    return error.message;
  }

  if (
    error instanceof Error &&
    error.message.startsWith("Department not found")
  ) {
    return error.message;
  }

  return "Failed to save registration. Please try again.";
}
