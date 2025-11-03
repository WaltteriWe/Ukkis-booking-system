import { PrismaClient } from "../../generated/prisma";
import { z } from "zod";
import crypto from "crypto";

const prisma = new PrismaClient();

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function hashPassword(password: string, salt?: string) {
  const s = salt ?? crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, s, 64).toString("hex");
  return { salt: s, hash: derived };
}

function signToken(adminId: number) {
  const secret = process.env.ADMIN_TOKEN_SECRET || "dev-admin-secret";
  const payload = `${adminId}:${Date.now()}`;
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return `${sig}.${Buffer.from(String(adminId)).toString("base64")}`;
}

export async function registerAdmin(body: unknown) {
  try {
    const data = registerSchema.parse(body);

    // ensure unique email
    const existing = await prisma.admin.findUnique({ where: { email: data.email } });
    if (existing) throw { status: 409, error: "AdminExists" };

    const { salt, hash } = hashPassword(data.password);

    const admin = await prisma.admin.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: hash,
        passwordSalt: salt,
      },
    });

    const token = signToken(admin.id);
    return { token };
  } catch (e: any) {
    if (e?.issues) throw { status: 400, error: e.issues };
    throw e;
  }
}

export async function loginAdmin(body: unknown) {
  try {
    const data = loginSchema.parse(body);

    const admin = await prisma.admin.findUnique({ where: { email: data.email } });
    if (!admin) throw { status: 401, error: "InvalidCredentials" };

    const { hash } = hashPassword(data.password, admin.passwordSalt);
    if (hash !== admin.passwordHash) throw { status: 401, error: "InvalidCredentials" };

    const token = signToken(admin.id);
    return { token };
  } catch (e: any) {
    if (e?.issues) throw { status: 400, error: e.issues };
    throw e;
  }
}
