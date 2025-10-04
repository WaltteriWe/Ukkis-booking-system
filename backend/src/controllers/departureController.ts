import { PrismaClient } from "../../generated/prisma";
import { z } from "zod";

const prisma = new PrismaClient();

const listDepaturesQuery = z.object({
    packageId: z.coerce.number().int().positive().optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    onlyAvailable: z.coerce.boolean().optional(),
});

export async function listDepartures(query: unknown) {
    const q = listDepaturesQuery.parse(query ?? {});
    const where: any = {packageId: q.packageId};

    if (q.from || q.to) {
        where.startDate = {};
        if (q.from) where.startDate.gte = new Date(q.from);
        if (q.to) where.startDate.lte = new Date(q.to);
    }

    const items = await prisma.departure.findMany({
        where,
        orderBy: {departureTime: "asc"},
        select: {
            id: true,
            departureTime: true,
            capacity: true,
            reserved: true,
            packageId: true,
        },
    });

    return q.onlyAvailable ? items.filter(d => d.capacity - d.reserved > 0) : items;
}
