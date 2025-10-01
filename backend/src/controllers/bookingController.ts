import { PrismaClient } from "../../generated/prisma";
import { z } from "zod";
import { BOOKING_STATUS } from "../../shared/constants";
import { parseISO } from "../../shared/utils";
import { error } from "console";

const prisma = new PrismaClient();

const createBookingSchema = z.object({
    packageId: z.number().int().positive(),
    departureId: z.number().int().positive(),
    participants: z.number().int().min(1),
    guestEmail: z.string().email(),
    guestName: z.string().min(1),
    phone: z.string().optional(),
    notes: z.string().max(500).optional(),
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
            }
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
            }
        }
    });
    
    if (!booking) {
        throw { status: 404, error: "Booking not found" };
    }
    
    return booking;
}
