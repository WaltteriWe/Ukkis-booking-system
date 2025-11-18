import { PrismaClient } from "../generated/prisma";
import * as crypto from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string, salt?: string) {
  const s = salt ?? crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, s, 64).toString("hex");
  return { salt: s, hash: derived };
}

async function main() {
  console.log("Checking for existing admins...");

  const admins = await prisma.admin.findMany();

  if (admins.length === 0) {
    console.log("No admins found. Creating default admin...");

    const password = "admin123";
    const { salt, hash } = hashPassword(password);

    const admin = await prisma.admin.create({
      data: {
        name: "Admin",
        email: "admin@ukkis.com",
        passwordHash: hash,
        passwordSalt: salt,
        isSuper: true,
      },
    });

    console.log("✅ Admin created!");
    console.log("Email: admin@ukkis.com");
    console.log("Password: admin123");
  } else {
    console.log("Existing admins:");
    admins.forEach((admin) => {
      console.log(`- ${admin.name} (${admin.email})`);
    });

    // Delete old admins and recreate with correct hash
    console.log("\n🔄 Recreating admin with correct password hash...");
    await prisma.admin.deleteMany({});

    const password = "admin123";
    const { salt, hash } = hashPassword(password);

    await prisma.admin.create({
      data: {
        name: "Admin",
        email: "admin@ukkis.com",
        passwordHash: hash,
        passwordSalt: salt,
        isSuper: true,
      },
    });

    console.log("✅ Admin recreated!");
    console.log("Email: admin@ukkis.com");
    console.log("Password: admin123");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
