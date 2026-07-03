import "dotenv/config";
import { randomBytes, scryptSync } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client.js";

function getArg(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? "" : String(process.argv[index + 1] ?? "").trim();
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  const email = getArg("--email").toLowerCase();
  const password = getArg("--password");
  const firstname = getArg("--firstname") || "Admin";
  const surname = getArg("--surname") || "User";

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set.");
  }

  if (!email || !password) {
    throw new Error(
      "Usage: node scripts/create-admin.mjs --email admin@unn.edu.ng --password your-password",
    );
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashPassword(password),
      role: "ADMIN",
      isActive: true,
      firstname,
      surname,
    },
    create: {
      email,
      password: hashPassword(password),
      role: "ADMIN",
      isActive: true,
      firstname,
      surname,
    },
    select: { email: true, role: true },
  });

  console.log(`Admin ready: ${user.email} (${user.role})`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
