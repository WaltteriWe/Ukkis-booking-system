import "dotenv/config";
import { PrismaClient } from "../../generated/prisma";
import { z } from "zod";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

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
  const token = jwt.sign({ id: adminId }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
  return token;
}

export async function loginAdmin(body: any) {
  try {
    const data = loginSchema.parse(body);

    const admin = await prisma.admin.findUnique({
      where: { email: data.email },
    });

    if (!admin) throw { status: 401, error: "InvalidCredentials" };
    const trimmedPassword = data.password.trim();
    const { hash } = hashPassword(trimmedPassword, admin.passwordSalt);
    if (hash !== admin.passwordHash) {
      throw { status: 401, error: "InvalidCredentials" };
    }

    const token = signToken(admin.id);

    return {
      success: true,
      token,
      admin: {
        id: admin.id,
        name: admin.name,
      },
    };
  } catch (e: any) {
    if (e?.issues) throw { status: 400, error: e.issues };
    throw e;
  }
}
