-- CreateEnum
CREATE TYPE "DepartmentType" AS ENUM ('DEPARTMENT', 'CENTER', 'UNIT');

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DepartmentType" NOT NULL DEFAULT 'DEPARTMENT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- AlterTable
ALTER TABLE "applicants" DROP COLUMN "department",
ADD COLUMN "departmentId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "applicants_departmentId_idx" ON "applicants"("departmentId");

-- AddForeignKey
ALTER TABLE "applicants" ADD CONSTRAINT "applicants_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
