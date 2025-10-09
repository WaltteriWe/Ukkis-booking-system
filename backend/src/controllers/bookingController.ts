import { PrismaClient } from "../../generated/prisma";
import { z } from "zod";
import { BOOKING_STATUS } from "../../shared/constants";


const prisma = new PrismaClient();

const createBookingSchema = z.object({
    packageId: z.number().int().positive(),
    departureId: z.number().int().positive(),
    participants: z.number().int().min(1),
    guestEmail: z.string().email(),
    guestName: z.string().min(1),
    phone: z.string().optional(),
    notes: z.string().max(500).optional(),
    participantGearSizes: z.record(z.string(), z.object({
        name: z.string(),
        jacket: z.string(),
        pants: z.string(),
        boots: z.string(),
        gloves: z.string(),
        helmet: z.string(),
    })).optional(),
});

export async function createBooking(body: unknown) {
    const data = createBookingSchema.parse(body);

    return prisma.$transaction(async (tx) => {
        const [pkg, dep] = await Promise.all([
            tx.safariPackage.findUnique({ where: { id: data.packageId } }),
            tx.departure.findUnique({ where: { id: data.departureId } }),
        ]);

        if (!pkg || !dep || dep.packageId !== pkg.id) {
            throw { status: 400, error: "Invalid package or departure" };
        }

        const available = dep.capacity - dep.reserved; 
        if (available < data.participants) {
            throw { status: 400, error: `Only ${available} spots left` };
        }

        const totalPrice = Number(pkg.basePrice) * data.participants;

        const guest = await tx.guest.upsert({
            where: { email: data.guestEmail },
            update: { name: data.guestName, phone: data.phone ?? undefined },
            create: { email: data.guestEmail, name: data.guestName, phone: data.phone ?? undefined },
        });

        const booking = await tx.booking.create({
            data: {
                guestId: guest.id,
                departureId: dep.id,
                participants: data.participants,
                totalPrice,
                status: BOOKING_STATUS.CONFIRMED,
                notes: data.notes ?? null,
            },
        });

        // Save participant gear sizes if provided
        if (data.participantGearSizes) {
            const gearPromises = Object.entries(data.participantGearSizes).map(([participantNum, gear]) =>
                tx.participantGear.create({
                    data: {
                        bookingId: booking.id,
                        name: gear.name,
                        jacket: gear.jacket,
                        pants: gear.pants,
                        boots: gear.boots,
                        gloves: gear.gloves,
                        helmet: gear.helmet,
                    },
                })
            );

            await Promise.all(gearPromises);
        }

        await tx.departure.update({
            where: { id: dep.id },
            data: { reserved: { increment: data.participants } },
        });

        return booking;
    }, { isolationLevel: "Serializable" });
}

export async function getBookings() {
    return await prisma.booking.findMany({
        include: {
            guest: true,
            departure: {
                include: { 
                    package: true 
                }
            },
            participantGear: true
        },
        orderBy: { createdAt: 'desc' }
    });
}

export async function getBookingById(id: number) {
    const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
            guest: true,
            departure: {
                include: { 
                    package: true 
                }
            },
            participantGear: true
        }
    });
    
    if (!booking) {
        throw { status: 404, error: "Booking not found" };
    }
    
    return booking;
}

const updateBookingStatusSchema = z.object({
    status: z.enum(["confirmed", "pending", "cancelled"]),
});

export async function updateBookingStatus(id: number, body: unknown) {
    const data = updateBookingStatusSchema.parse(body);
    
    const booking = await prisma.booking.findUnique({
        where: { id }
    });
    
    if (!booking) {
        throw { status: 404, error: "Booking not found" };
    }
    
    const updatedBooking = await prisma.booking.update({
        where: { id },
        data: { status: data.status },
        include: {
            guest: true,
            departure: {
                include: { 
                    package: true 
                }
            },
            participantGear: true
        }
    });
    
    return updatedBooking;
}
