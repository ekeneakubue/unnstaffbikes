-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'VERIFIER');

-- CreateEnum
CREATE TYPE "ApplicantStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'VERIFIER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applicants" (
    "id" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "staffNumber" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "stateOfOrigin" TEXT NOT NULL,
    "localGovernment" TEXT NOT NULL,
    "motorcycleNo" TEXT NOT NULL,
    "motorcycleMake" TEXT NOT NULL,
    "engineNumber" TEXT NOT NULL,
    "profilePhotoUrl" TEXT,
    "status" "ApplicantStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "verifiedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applicants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "applicants_staffNumber_key" ON "applicants"("staffNumber");

-- CreateIndex
CREATE UNIQUE INDEX "applicants_motorcycleNo_key" ON "applicants"("motorcycleNo");

-- CreateIndex
CREATE UNIQUE INDEX "applicants_engineNumber_key" ON "applicants"("engineNumber");

-- CreateIndex
CREATE INDEX "applicants_staffNumber_idx" ON "applicants"("staffNumber");

-- CreateIndex
CREATE INDEX "applicants_motorcycleNo_idx" ON "applicants"("motorcycleNo");

-- AddForeignKey
ALTER TABLE "applicants" ADD CONSTRAINT "applicants_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
