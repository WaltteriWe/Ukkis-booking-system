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
      id: true, slug: true, name: true, description: true,
      basePrice: true, durationMin: true, active: true,
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
      id: true, slug: true, name: true, description: true,
      basePrice: true, durationMin: true, active: true,
    },
  });
  if (!pkg) throw { status: 404, error: "PackageNotFound" };
  return pkg;
}
