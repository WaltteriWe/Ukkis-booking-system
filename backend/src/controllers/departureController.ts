import { PrismaClient } from "../../generated/prisma";
import { z } from "zod";
import { BOOKING_STATUS } from "../../shared/constants";

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
        include: {
            bookings: {
                where: {
                    status: BOOKING_STATUS.CONFIRMED
                },
                select: {
                    participants: true
                }
            }
        }
    });

    // Calculate actual availability for each departure
    const itemsWithAvailability = items.map(item => {
        const reservedSpots = item.bookings.reduce((sum, booking) => sum + booking.participants, 0);
        const available = item.capacity - reservedSpots;
        
        return {
            id: item.id,
            departureTime: item.departureTime,
            capacity: item.capacity,
            reserved: reservedSpots,
            available: available,
            packageId: item.packageId,
        };
    });

    return q.onlyAvailable ? itemsWithAvailability.filter(d => d.available > 0) : itemsWithAvailability;
}