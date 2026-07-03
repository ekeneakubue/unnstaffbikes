-- Split unified departments into faculties, departments, and stations.
-- Safe to re-run after partial failures.

CREATE TABLE IF NOT EXISTS "faculties" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "faculties_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "faculties_name_key" ON "faculties"("name");

CREATE TABLE IF NOT EXISTS "stations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "stations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "stations_name_key" ON "stations"("name");

INSERT INTO "faculties" ("id", "name", "isActive", "createdAt", "updatedAt")
SELECT d."id", d."name", d."isActive", d."createdAt", d."updatedAt"
FROM "departments" d
WHERE d."type" = 'FACULTY'
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "faculties" ("id", "name", "isActive", "createdAt", "updatedAt")
VALUES ('legacy-faculty', 'Legacy Faculty', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "stations" ("id", "name", "isActive", "createdAt", "updatedAt")
SELECT d."id", d."name", d."isActive", d."createdAt", d."updatedAt"
FROM "departments" d
WHERE d."type" IN ('UNIT', 'CENTER')
ON CONFLICT ("id") DO NOTHING;

DROP TABLE IF EXISTS "departments_new";

CREATE TABLE "departments_new" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "departments_new_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "departments_new_name_key" ON "departments_new"("name");
CREATE INDEX "departments_new_facultyId_idx" ON "departments_new"("facultyId");

ALTER TABLE "departments_new"
ADD CONSTRAINT "departments_new_facultyId_fkey"
FOREIGN KEY ("facultyId") REFERENCES "faculties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "departments_new" ("id", "name", "facultyId", "isActive", "createdAt", "updatedAt")
SELECT
    d."id",
    d."name",
    COALESCE(
        (SELECT f."id" FROM "faculties" f WHERE f."id" = d."facultyId"),
        (SELECT f."id" FROM "faculties" f ORDER BY f."name" LIMIT 1),
        'legacy-faculty'
    ),
    d."isActive",
    d."createdAt",
    d."updatedAt"
FROM "departments" d
WHERE d."type" = 'DEPARTMENT'
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "departments_new" ("id", "name", "facultyId", "isActive", "createdAt", "updatedAt")
SELECT
    d."id",
    d."name",
    COALESCE(
        (SELECT f."id" FROM "faculties" f ORDER BY f."name" LIMIT 1),
        'legacy-faculty'
    ),
    d."isActive",
    d."createdAt",
    d."updatedAt"
FROM "departments" d
WHERE d."type" = 'FACULTY'
ON CONFLICT ("id") DO NOTHING;

ALTER TABLE "applicants" DROP CONSTRAINT IF EXISTS "applicants_departmentId_fkey";

DROP TABLE "departments";

ALTER TABLE "departments_new" RENAME TO "departments";
ALTER TABLE "departments" RENAME CONSTRAINT "departments_new_pkey" TO "departments_pkey";
ALTER INDEX "departments_new_name_key" RENAME TO "departments_name_key";
ALTER INDEX "departments_new_facultyId_idx" RENAME TO "departments_facultyId_idx";
ALTER TABLE "departments" RENAME CONSTRAINT "departments_new_facultyId_fkey" TO "departments_facultyId_fkey";

ALTER TABLE "applicants"
ADD CONSTRAINT "applicants_departmentId_fkey"
FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

DROP TYPE IF EXISTS "DepartmentType";
