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
    const where: any = {};
    
    if (q.packageId) {
        where.packageId = q.packageId;
    }

    if (q.from || q.to) {
        where.departureTime = {};
        if (q.from) where.departureTime.gte = new Date(q.from);
        if (q.to) where.departureTime.lte = new Date(q.to);
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

const createDepartureSchema = z.object({
    packageId: z.number().int().positive(),
    departureTime: z.string().datetime(),
    capacity: z.number().int().positive().optional().default(8),
});

export async function createDeparture(body: unknown) {
    const data = createDepartureSchema.parse(body);

    // Check if package exists
    const packageExists = await prisma.safariPackage.findUnique({
        where: { id: data.packageId }
    });

    if (!packageExists) {
        throw { status: 400, error: "Package not found" };
    }

    // Create the departure
    const departure = await prisma.departure.create({
        data: {
            packageId: data.packageId,
            departureTime: new Date(data.departureTime),
            capacity: data.capacity,
        }
    });

    return departure;
}