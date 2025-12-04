import { PrismaClient } from '../../generated/prisma';
import { z } from 'zod';
import { 
  sendSnowmobileRentalRequestEmail,
  sendSnowmobileRentalApprovalEmail,
  sendSnowmobileRentalRejectionEmail 
} from './emailController';

const prisma = new PrismaClient();

const createRentalSchema = z.object({
  snowmobileId: z.number().int().positive(),
  guestEmail: z.string().email(),
  guestName: z.string().min(1),
  phone: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  totalPrice: z.number().positive(),
  notes: z.string().optional(),
});

export async function getAvailableSnowmobiles(startTime: Date, endTime: Date) {
  // Get all active snowmobiles
  const allSnowmobiles = await prisma.snowmobile.findMany({
    where: { status: 'available' },
  });

  // Get snowmobiles that are already rented during this time
  const rentedSnowmobiles = await prisma.snowmobileRental.findMany({
    where: {
      AND: [
        { startTime: { lt: endTime } },
        { endTime: { gt: startTime } },
        { status: { in: ['pending', 'confirmed'] } },
      ],
    },
    select: { snowmobileId: true },
  });

  // Get snowmobiles assigned to safaris during this time
  const safariAssignments = await prisma.safariSnowmobileAssignment.findMany({
    where: {
      departure: {
        AND: [
          { departureTime: { lt: endTime } },
          // Assuming safaris last 2-4 hours, adjust as needed
          { departureTime: { gt: new Date(startTime.getTime() - 4 * 60 * 60 * 1000) } },
        ],
      },
    },
    select: { snowmobileId: true },
  });

  const unavailableIds = new Set([
    ...rentedSnowmobiles.map(r => r.snowmobileId),
    ...safariAssignments.map(s => s.snowmobileId),
  ]);

  return allSnowmobiles.filter(sm => !unavailableIds.has(sm.id));
}

export async function createSnowmobileRental(body: unknown) {
  const schema = z.object({
    snowmobileId: z.number().int().positive(),
    guestEmail: z.string().email(),
    guestName: z.string().min(1),
    phone: z.string().optional(),
    startTime: z.string().transform((val) => new Date(val)),
    endTime: z.string().transform((val) => new Date(val)),
    totalPrice: z.number().positive(),
    notes: z.string().optional(),
  });

  const data = schema.parse(body);

  // Check if snowmobile is available
  const available = await getAvailableSnowmobiles(data.startTime, data.endTime);
  const isAvailable = available.some((sm: any) => sm.id === data.snowmobileId);

  if (!isAvailable) {
    throw { status: 400, error: 'Snowmobile not available for the selected time' };
  }

  // Find or create guest
  let guest = await prisma.guest.findUnique({
    where: { email: data.guestEmail },
  });

  if (!guest) {
    guest = await prisma.guest.create({
      data: {
        email: data.guestEmail,
        name: data.guestName,
        phone: data.phone,
      },
    });
  }

  // Create rental
  const rental = await prisma.snowmobileRental.create({
    data: {
      snowmobileId: data.snowmobileId,
      guestId: guest.id,
      startTime: data.startTime,
      endTime: data.endTime,
      totalPrice: data.totalPrice,
      notes: data.notes,
      status: 'pending',
    },
    include: {
      snowmobile: true,
      guest: true,
    },
  });

  return rental;
}

export async function getSnowmobiles() {
  return await prisma.snowmobile.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function createSnowmobile(body: unknown) {
  const schema = z.object({
    name: z.string().min(1),
    licensePlate: z.string().optional(),
    model: z.string().optional(),
    year: z.number().int().optional(),
  });

  const data = schema.parse(body);

  return await prisma.snowmobile.create({
    data,
  });
}

// This function returns snowmobile rentals for the admin's "Single Reservations" tab
export async function getSingleReservations() {
  return await prisma.snowmobileRental.findMany({
    include: {
      snowmobile: true,
      guest: true,
    },
    orderBy: { startTime: 'desc' },
  });
}

export async function updateRentalStatus(id: number, body: unknown) {
  const schema = z.object({
    status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']),
  });

  const data = schema.parse(body);

  return await prisma.snowmobileRental.update({
    where: { id },
    data: { status: data.status },
    include: {
      snowmobile: true,
      guest: true,
    },
  });
}

export async function approveSnowmobileRental(id: number, body: unknown) {
  const schema = z.object({
    adminMessage: z.string().optional().nullable(),
  });

  const data = schema.parse(body);

  const rental = await prisma.snowmobileRental.update({
    where: { id },
    data: {
      approvalStatus: 'approved',
      adminMessage: data.adminMessage || null,
    },
    include: {
      snowmobile: true,
      guest: true,
    },
  });

  // Send approval email
  try {
    const startTimeStr = rental.startTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const endTimeStr = rental.endTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const dateStr = rental.startTime.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    await sendSnowmobileRentalApprovalEmail({
      email: rental.guest.email,
      name: rental.guest.name,
      snowmobileName: rental.snowmobile.name,
      date: dateStr,
      startTime: startTimeStr,
      endTime: endTimeStr,
      total: Number(rental.totalPrice),
      rentalId: rental.id.toString(),
      adminMessage: data.adminMessage || undefined,
    });
  } catch (emailError) {
    console.error('Failed to send approval email:', emailError);
    // Don't throw error, just log it
  }

  return rental;
}

export async function rejectSnowmobileRental(id: number, body: unknown) {
  const schema = z.object({
    rejectionReason: z.string().min(1),
  });

  const data = schema.parse(body);

  const rental = await prisma.snowmobileRental.update({
    where: { id },
    data: {
      approvalStatus: 'rejected',
      rejectionReason: data.rejectionReason,
    },
    include: {
      snowmobile: true,
      guest: true,
    },
  });

  // Send rejection email
  try {
    const startTimeStr = rental.startTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const endTimeStr = rental.endTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const dateStr = rental.startTime.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    await sendSnowmobileRentalRejectionEmail({
      email: rental.guest.email,
      name: rental.guest.name,
      snowmobileName: rental.snowmobile.name,
      date: dateStr,
      startTime: startTimeStr,
      endTime: endTimeStr,
      total: Number(rental.totalPrice),
      rentalId: rental.id.toString(),
      rejectionReason: data.rejectionReason,
    });
  } catch (emailError) {
    console.error('Failed to send rejection email:', emailError);
    // Don't throw error, just log it
  }

  return rental;
}

// Add this function to your existing rentalController.ts

export async function assignSnowmobilesToDeparture(body: unknown) {
  const schema = z.object({
    departureId: z.number().int().positive(),
    snowmobileIds: z.array(z.number().int().positive()),
  });

  const data = schema.parse(body);

  return await prisma.$transaction(async (tx) => {
    // Remove existing assignments
    await tx.safariSnowmobileAssignment.deleteMany({
      where: { departureId: data.departureId },
    });

    // Create new assignments
    const assignments = await Promise.all(
      data.snowmobileIds.map((snowmobileId) =>
        tx.safariSnowmobileAssignment.create({
          data: {
            departureId: data.departureId,
            snowmobileId,
          },
          include: {
            snowmobile: true,
          },
        })
      )
    );

    return assignments;
  });
}

export async function getSnowmobileAssignments(departureId: number) {
  return await prisma.safariSnowmobileAssignment.findMany({
    where: { departureId },
    include: {
      snowmobile: true,
    },
  });
}