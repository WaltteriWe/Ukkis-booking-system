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
    const schema = z.object({
        packageId: z.number().int().positive().optional(),
        from: z.string().optional().transform((val) => val ? new Date(val) : undefined),
        to: z.string().optional().transform((val) => val ? new Date(val) : undefined),
        onlyAvailable: z.boolean().optional(),
    });

    const params = schema.parse(query);

    const where: any = {};

    if (params.packageId) {
        where.packageId = params.packageId;
    }

    if (params.from || params.to) {
        where.departureTime = {};
        if (params.from) where.departureTime.gte = params.from;
        if (params.to) where.departureTime.lte = params.to;
    }

    const departures = await prisma.departure.findMany({
        where,
        include: {
            package: true, // ADD THIS - Include the package relation
            bookings: params.onlyAvailable ? true : false,
        },
        orderBy: {
            departureTime: "asc",
        },
    });

    if (params.onlyAvailable) {
        const filtered = departures.filter((dep: any) => {
            const bookedSeats = dep.bookings.reduce((sum: number, b: any) => sum + b.participants, 0);
            const capacity = dep.capacity || dep.package?.capacity || 10;
            return bookedSeats < capacity;
        });
        return { items: filtered };
    }

    return { items: departures };
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