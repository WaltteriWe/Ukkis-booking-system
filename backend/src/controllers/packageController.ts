import "dotenv/config";
import { PrismaClient } from "../../generated/prisma";
import { z } from "zod";

const prisma = new PrismaClient();

const listQuery = z.object({
  activeOnly: z.coerce.boolean().optional(),
});

export async function listPackages(query: unknown) {
  const q = listQuery.parse(query ?? {});
  const where = q.activeOnly ? { active: true } : {};
  const items = await prisma.safariPackage.findMany({
    where,
    orderBy: { name: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      basePrice: true,
      durationMin: true,
      capacity: true,
      difficulty: true,
      imageUrl: true,
      active: true,
    },
  });
  return { items };
}

const slugParams = z.object({ slug: z.string().min(1) });

export async function getPackageBySlug(params: unknown) {
  const p = slugParams.parse(params ?? {});
  const pkg = await prisma.safariPackage.findUnique({
    where: { slug: p.slug },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      basePrice: true,
      durationMin: true,
      active: true,
      departures: {
        where: {
          departureTime: {
            gte: new Date(),
          },
        },
        orderBy: { departureTime: "asc" },
        select: {
          id: true,
          departureTime: true,
          capacity: true,
          reserved: true,
        },
      },
    },
  });
  if (!pkg) throw { status: 404, error: "PackageNotFound" };
  return pkg;
}

export async function getPackageById(id: number) {
  const pkg = await prisma.safariPackage.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      basePrice: true,
      durationMin: true,
      capacity: true,
      difficulty: true,
      imageUrl: true,
      active: true,
      departures: {
        where: {
          departureTime: {
            gte: new Date(),
          },
        },
        orderBy: { departureTime: "asc" },
        select: {
          id: true,
          departureTime: true,
          capacity: true,
          reserved: true,
        },
      },
    },
  });
  if (!pkg) throw { status: 404, error: "PackageNotFound" };
  return pkg;
}

const createPackageSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  basePrice: z.number().positive(),
  durationMin: z.number().int().positive(),
  capacity: z.number().int().positive().default(8),
  difficulty: z.enum(["Easy", "Moderate", "Advanced"]).default("Easy"),
  // allow relative paths or full URLs
  imageUrl: z.string().optional(),
  active: z.boolean().default(true),
});

export async function createPackage(body: unknown) {
  try {
    const data = createPackageSchema.parse(body);

    const pkg = await prisma.safariPackage.create({
      data: {
        slug: data.slug,
        name: data.name,
        description: data.description,
        basePrice: data.basePrice,
        durationMin: data.durationMin,
        capacity: data.capacity,
        difficulty: data.difficulty,
        imageUrl: data.imageUrl,
        active: data.active,
      },
    });

    return pkg;
  } catch (e: any) {
    // Convert validation errors to 400 so client gets meaningful response
    if (e?.issues) {
      throw { status: 400, error: e.issues };
    }
    throw e;
  }
}

const updatePackageSchema = z.object({
  slug: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  basePrice: z.number().positive().optional(),
  durationMin: z.number().int().positive().optional(),
  capacity: z.number().int().positive().optional(),
  difficulty: z.enum(["Easy", "Moderate", "Advanced"]).optional(),
  // allow relative paths or full URLs
  imageUrl: z.string().optional(),
  active: z.boolean().optional(),
});

export async function updatePackage(id: number, body: unknown) {
  try {
    const data = updatePackageSchema.parse(body);

    const pkg = await prisma.safariPackage.update({
      where: { id },
      data,
    });

    return pkg;
  } catch (e: any) {
    if (e?.issues) {
      throw { status: 400, error: e.issues };
    }
    throw e;
  }
}

export async function deletePackage(id: number) {
  try {
    await prisma.safariPackage.delete({ where: { id } });
    return { success: true };
  } catch (e: any) {
    // Prisma known errors: P2025 (Record not found), P2003 (FK constraint failed)
    if (e?.code === "P2025") {
      throw { status: 404, error: "PackageNotFound" };
    }
    if (e?.code === "P2003") {
      // Likely existing departures or other relations preventing delete
      throw { status: 409, error: "PackageHasDependencies" };
    }
    throw e;
  }
}
