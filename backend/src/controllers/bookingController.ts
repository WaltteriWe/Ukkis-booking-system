import { PrismaClient } from "../../generated/prisma";
import { z } from "zod";
import { BOOKING_STATUS } from "../../shared/constants";


const prisma = new PrismaClient();

// Update the gear sizes schema
const gearSizesSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  overalls: z.string().min(1, 'Overalls size is required'),
  boots: z.string().min(1, 'Boots size is required'),
  gloves: z.string().min(1, 'Gloves size is required'),
  helmet: z.string().min(1, 'Helmet size is required'),
});

// Update the create booking schema
const createBookingSchema = z.object({
  packageId: z.number().int().positive(),
  departureId: z.number().int().positive(),
  participants: z.number().int().positive(),
  guestEmail: z.string().email(),
  guestName: z.string().min(1),
  phone: z.string().optional(),
  notes: z.string().optional(),
  participantGearSizes: z.record(z.string(), gearSizesSchema).optional(),
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
                        overalls: gear.overalls,
                        boots: gear.boots,
                        gloves: gear.gloves,
                        helmet: gear.helmet,
                    },
                } as any)
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
