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
  departureId: z.number().int().positive().optional(), // Make it optional
  participants: z.number().int().positive(),
  guestEmail: z.string().email(),
  guestName: z.string().min(1),
  phone: z.string().optional(),
  notes: z.string().optional(),
  participantGearSizes: z.record(z.string(), gearSizesSchema).optional(),
});

// Replace the original createBooking function (delete the old one)
export async function createBooking(body: unknown) {
    console.log("Received booking request:", body);
    
    const data = createBookingSchema.parse(body);
    console.log("Validated data:", data);

    return prisma.$transaction(async (tx) => {
        // Verify package exists
        const pkg = await tx.safariPackage.findUnique({
            where: { id: data.packageId }
        });

        if (!pkg) {
            console.error("Package not found:", data.packageId);
            throw { status: 400, error: "Invalid package" };
        }

        console.log("Package found:", pkg.name);

        // Calculate total price
        const totalPrice = Number(pkg.basePrice) * data.participants;

        // Create or update guest
        const guest = await tx.guest.upsert({
            where: { email: data.guestEmail },
            update: { 
                name: data.guestName, 
                phone: data.phone ?? undefined 
            },
            create: { 
                email: data.guestEmail, 
                name: data.guestName, 
                phone: data.phone ?? undefined 
            },
        });

        console.log("Guest created/updated:", guest.email);

        // Create booking data object
        const bookingData: any = {
            guestId: guest.id,
            packageId: data.packageId,
            participants: data.participants,
            totalPrice,
            status: "confirmed",
            notes: data.notes ?? null,
            guestEmail: data.guestEmail,  // ADD THIS LINE - it's required by your schema
            guestName: data.guestName,    // ADD THIS LINE
            phone: data.phone ?? null,    // ADD THIS LINE
        };

        // Only include departureId if it was provided
        if (data.departureId) {
            bookingData.departureId = data.departureId;
        }

        // Create booking
        const booking = await tx.booking.create({
            data: bookingData,
        });

        console.log("Booking created:", booking.id);

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
                })
            );

            await Promise.all(gearPromises);
            console.log("Gear sizes saved for", Object.keys(data.participantGearSizes).length, "participants");
        }

        return booking;
    }, { isolationLevel: "Serializable" });
}

export async function getBookings() {
    return await prisma.booking.findMany({
        include: {
            guest: true,
            package: true,  // ADD THIS - include package directly
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
            package: true,  // ADD THIS - include package directly
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
