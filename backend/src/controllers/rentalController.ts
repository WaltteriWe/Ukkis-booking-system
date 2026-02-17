import "dotenv/config";
import { PrismaClient } from "../../generated/prisma";
import { z } from "zod";
import {
  sendSnowmobileRentalRequestEmail,
  sendSnowmobileRentalApprovalEmail,
  sendSnowmobileRentalRejectionEmail,
} from "./emailController";

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
    where: { disabled: false },
  });

  // Get snowmobiles that are already rented during this time
  const rentedSnowmobiles = await prisma.snowmobileRental.findMany({
    where: {
      AND: [
        { startTime: { lt: endTime } },
        { endTime: { gt: startTime } },
        { status: { in: ["pending", "confirmed"] } },
      ],
    },
    select: { snowmobileId: true },
  });

  // Get snowmobiles assigned to safaris during this time
  // Query departures that could potentially overlap with the rental period
  // We fetch departures that start up to 24 hours before the rental end time
  // (assuming no safari lasts more than 24 hours)
  const maxSafariDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  const earliestPossibleDeparture = new Date(
    endTime.getTime() - maxSafariDuration,
  );

  const safariAssignments = await prisma.safariSnowmobileAssignment.findMany({
    where: {
      departure: {
        departureTime: {
          gte: earliestPossibleDeparture,
          lt: endTime,
        },
      },
    },
    include: {
      departure: {
        include: {
          package: {
            select: { durationMin: true },
          },
          bookings: {
            where: {
              approvalStatus: { in: ["approved", "pending"] },
            },
            select: {
              participants: true,
            },
          },
        },
      },
    },
  });

  // Filter assignments where:
  // 1. Safari end time actually overlaps with rental period
  // 2. The safari departure has bookings (is actually booked)
  const conflictingAssignments = safariAssignments.filter((assignment) => {
    const safariStart = assignment.departure.departureTime;
    const safariDurationMs =
      assignment.departure.package.durationMin * 60 * 1000;
    const safariEnd = new Date(safariStart.getTime() + safariDurationMs);

    // Check if there's time overlap
    const hasOverlap = safariEnd > startTime && safariStart < endTime;

    if (!hasOverlap) {
      return false;
    }

    // Check if the safari has any approved or pending bookings
    const hasBookings =
      assignment.departure.bookings && assignment.departure.bookings.length > 0;

    // Only mark snowmobile as unavailable if the safari is actually booked
    return hasBookings;
  });

  const unavailableIds = new Set([
    ...rentedSnowmobiles.map((r) => r.snowmobileId),
    ...conflictingAssignments.map((s) => s.snowmobileId),
  ]);

  return allSnowmobiles.filter((sm) => !unavailableIds.has(sm.id));
}

export async function createSnowmobileRental(body: unknown) {
  const schema = z.object({
    snowmobiles: z
      .array(
        z.object({
          snowmobileId: z.number().int().positive(),
          quantity: z.number().int().positive(),
        }),
      )
      .optional(),
    snowmobileId: z.number().int().positive().optional(),
    guestEmail: z.string().email(),
    guestName: z.string().min(1),
    phone: z.string().optional(),
    startTime: z.string().transform((val) => new Date(val)),
    endTime: z.string().transform((val) => new Date(val)),
    totalPrice: z.number().positive(),
    notes: z.string().optional(),
  });

  let data;
  try {
    data = schema.parse(body);
  } catch (err: any) {
    console.error("❌ Validation error:", err.errors || err);
    console.error("📦 Received body:", JSON.stringify(body, null, 2));
    throw {
      status: 400,
      error: err.errors || err.message || "Validation failed",
    };
  }

  // Support both old single snowmobile format and new multiple snowmobiles format
  const snowmobilesToRent = data.snowmobiles
    ? data.snowmobiles
    : data.snowmobileId
      ? [{ snowmobileId: data.snowmobileId, quantity: 1 }]
      : [];

  if (snowmobilesToRent.length === 0) {
    throw {
      status: 400,
      error: "At least one snowmobile must be selected",
    };
  }

  // Check if all snowmobiles are available
  const available = await getAvailableSnowmobiles(data.startTime, data.endTime);
  for (const item of snowmobilesToRent) {
    const isAvailable = available.some(
      (sm: any) => sm.id === item.snowmobileId,
    );
    if (!isAvailable) {
      throw {
        status: 400,
        error: `Snowmobile ID ${item.snowmobileId} is not available for the selected time`,
      };
    }
  }

  // Find or create guest, update if exists
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
  } else {
    // Update guest information if it has changed
    guest = await prisma.guest.update({
      where: { id: guest.id },
      data: {
        name: data.guestName,
        phone: data.phone,
      },
    });
  }

  // Create rentals for each snowmobile (handling quantities)
  const rentals = [];
  for (const item of snowmobilesToRent) {
    for (let i = 0; i < item.quantity; i++) {
      const rental = await prisma.snowmobileRental.create({
        data: {
          snowmobileId: item.snowmobileId,
          guestId: guest.id,
          startTime: data.startTime,
          endTime: data.endTime,
          totalPrice:
            data.totalPrice /
            snowmobilesToRent.reduce((acc, s) => acc + s.quantity, 0), // Distribute price
          notes: data.notes,
          status: "pending",
        },
        include: {
          snowmobile: true,
          guest: true,
        },
      });
      rentals.push(rental);
    }
  }

  // Return the first rental (or throw if none created)
  if (rentals.length === 0) {
    throw {
      status: 500,
      error: "Failed to create rental",
    };
  }

  return rentals[0];
}

export async function getSnowmobiles() {
  return await prisma.snowmobile.findMany({
    where: { disabled: false },
    orderBy: { name: "asc" },
  });
}

// Get all snowmobiles for admin (including maintenance info)
export async function getAllSnowmobilesForAdmin() {
  return await prisma.snowmobile.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createSnowmobile(body: unknown) {
  const schema = z.object({
    name: z.string().min(1),
    licensePlate: z.string().optional(),
    model: z.string().optional(),
    year: z.number().int().optional(),
    hourlyRate: z.number().optional(),
    imageUrl: z.string().optional(),
    quantity: z.number().int().positive().optional(),
    description: z.string().optional(),
    pricing: z
      .object({
        "2h": z.number().optional(),
        "4h": z.number().optional(),
        "6h": z.number().optional(),
        "8h": z.number().optional(),
        vrk: z.number().optional(),
      })
      .optional(),
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
    orderBy: { createdAt: "desc" },
  });
}

export async function updateRentalStatus(id: number, body: unknown) {
  const schema = z.object({
    status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
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
      approvalStatus: "approved",
      adminMessage: data.adminMessage || null,
    },
    include: {
      snowmobile: true,
      guest: true,
    },
  });

  // Send approval email
  try {
    const startTimeStr = rental.startTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const endTimeStr = rental.endTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const dateStr = rental.startTime.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
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
    console.error("Failed to send approval email:", emailError);
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
      approvalStatus: "rejected",
      rejectionReason: data.rejectionReason,
    },
    include: {
      snowmobile: true,
      guest: true,
    },
  });

  // Send rejection email
  try {
    const startTimeStr = rental.startTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const endTimeStr = rental.endTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const dateStr = rental.startTime.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
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
    console.error("Failed to send rejection email:", emailError);
    // Don't throw error, just log it
  }

  return rental;
}

export async function assignSnowmobilesToDeparture(body: unknown) {
  const schema = z.object({
    departureId: z.number().int().positive(),
    snowmobileIds: z.array(z.number().int().positive()),
  });

  const data = schema.parse(body);

  // Get the departure details to determine the time range
  const departure = await prisma.departure.findUnique({
    where: { id: data.departureId },
    include: {
      package: {
        select: { durationMin: true },
      },
    },
  });

  if (!departure) {
    throw {
      status: 404,
      error: "Departure not found",
    };
  }

  const safariStart = departure.departureTime;
  const safariDurationMs = departure.package.durationMin * 60 * 1000;
  const safariEnd = new Date(safariStart.getTime() + safariDurationMs);

  // Check if any of the selected snowmobiles are rented during the safari time
  const rentedSnowmobiles = await prisma.snowmobileRental.findMany({
    where: {
      AND: [
        { snowmobileId: { in: data.snowmobileIds } },
        { startTime: { lt: safariEnd } },
        { endTime: { gt: safariStart } },
        { approvalStatus: { in: ["approved", "pending"] } },
      ],
    },
    include: {
      snowmobile: true,
      guest: true,
    },
  });

  if (rentedSnowmobiles.length > 0) {
    const rentedNames = rentedSnowmobiles
      .map((r) => `${r.snowmobile.name} (rented by ${r.guest.name})`)
      .join(", ");
    throw {
      status: 400,
      error: `Cannot assign snowmobiles that are already rented: ${rentedNames}`,
    };
  }

  // Check if any snowmobiles are assigned to other departures during the safari time
  const conflictingAssignments =
    await prisma.safariSnowmobileAssignment.findMany({
      where: {
        AND: [
          { snowmobileId: { in: data.snowmobileIds } },
          { departureId: { not: data.departureId } },
        ],
      },
      include: {
        snowmobile: true,
        departure: {
          include: {
            package: {
              select: { name: true, durationMin: true },
            },
          },
        },
      },
    });

  // Filter for actual time conflicts
  const timeConflicts = conflictingAssignments.filter((assignment) => {
    const otherStart = assignment.departure.departureTime;
    const otherDurationMs =
      assignment.departure.package.durationMin * 60 * 1000;
    const otherEnd = new Date(otherStart.getTime() + otherDurationMs);

    // Check if there's time overlap
    return otherEnd > safariStart && otherStart < safariEnd;
  });

  if (timeConflicts.length > 0) {
    const conflictNames = timeConflicts
      .map(
        (c) => `${c.snowmobile.name} (assigned to ${c.departure.package.name})`,
      )
      .join(", ");
    throw {
      status: 400,
      error: `Cannot assign snowmobiles already assigned to other departures during this time: ${conflictNames}`,
    };
  }

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
        }),
      ),
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

export async function getAllDepartureAssignments() {
  const departures = await prisma.departure.findMany({
    include: {
      package: {
        select: { name: true, durationMin: true },
      },
      snowmobileAssignments: {
        include: {
          snowmobile: true,
        },
      },
    },
    orderBy: { departureTime: "desc" },
  });

  return departures.map((dep) => ({
    id: dep.id,
    departureTime: dep.departureTime,
    packageName: dep.package.name,
    durationMin: dep.package.durationMin,
    capacity: dep.capacity,
    reserved: dep.reserved,
    assignedSnowmobiles: dep.snowmobileAssignments.map((a) => ({
      id: a.snowmobile.id,
      name: a.snowmobile.name,
      licensePlate: a.snowmobile.licensePlate,
      model: a.snowmobile.model,
    })),
  }));
}

export async function getDisabledSnowmobiles() {
  const disabled = await prisma.snowmobile.findMany({
    where: { disabled: true },
    select: { id: true },
  });
  return disabled.map((s) => s.id);
}

export async function updateSnowmobile(id: number, body: unknown) {
  const schema = z.object({
    name: z.string().optional(),
    licensePlate: z.string().optional().nullable(),
    model: z.string().optional().nullable(),
    year: z.number().int().optional().nullable(),
    hourlyRate: z.number().optional().nullable(),
    imageUrl: z.string().optional().nullable(),
    quantity: z.number().int().positive().optional(),
    description: z.string().optional().nullable(),
  });

  const data = schema.parse(body);

  return await prisma.snowmobile.update({
    where: { id },
    data: {
      name: data.name || undefined,
      licensePlate:
        data.licensePlate !== undefined ? data.licensePlate : undefined,
      model: data.model !== undefined ? data.model : undefined,
      year: data.year !== undefined ? data.year : undefined,
      hourlyRate: data.hourlyRate !== undefined ? data.hourlyRate : undefined,
      imageUrl: data.imageUrl !== undefined ? data.imageUrl : undefined,
      quantity: data.quantity || undefined,
      description:
        data.description !== undefined ? data.description : undefined,
    },
  });
}

export async function toggleSnowmobileMaintenance(id: number, body: unknown) {
  const schema = z.object({
    disabled: z.boolean(),
    maintenanceReason: z.string().optional(),
    maintenanceNotes: z.string().optional(),
    maintenanceEndDate: z.string().datetime().optional(),
    maintenanceCost: z.number().optional(),
  });

  const data = schema.parse(body);

  // Prepare update data
  const updateData: any = { disabled: data.disabled };

  if (data.disabled) {
    // When enabling maintenance mode
    updateData.maintenanceStartDate = new Date();
    updateData.maintenanceReason = data.maintenanceReason || null;
    updateData.maintenanceNotes = data.maintenanceNotes || null;
    updateData.maintenanceCost = data.maintenanceCost || null;
    if (data.maintenanceEndDate) {
      updateData.maintenanceEndDate = new Date(data.maintenanceEndDate);
    }
  } else {
    // When disabling maintenance mode (re-enabling snowmobile)
    updateData.maintenanceEndDate = new Date();
  }

  return await prisma.snowmobile.update({
    where: { id },
    data: updateData,
  });
}

/**
 * Get rental status information for snowmobiles
 * Optionally filter by specific departure time to show conflicts
 */
export async function getSnowmobileRentalStatus(departureId?: number) {
  const now = new Date();

  // If departureId is provided, get the departure details
  let safariStart: Date | null = null;
  let safariEnd: Date | null = null;

  if (departureId) {
    const departure = await prisma.departure.findUnique({
      where: { id: departureId },
      include: {
        package: {
          select: { durationMin: true },
        },
      },
    });

    if (departure) {
      safariStart = departure.departureTime;
      const safariDurationMs = departure.package.durationMin * 60 * 1000;
      safariEnd = new Date(safariStart.getTime() + safariDurationMs);
    }
  }

  // Get all active rentals
  const rentals = await prisma.snowmobileRental.findMany({
    where: {
      approvalStatus: { in: ["approved", "pending"] },
      endTime: { gte: now }, // Only future or ongoing rentals
      ...(safariStart && safariEnd
        ? {
            AND: [
              { startTime: { lt: safariEnd } },
              { endTime: { gt: safariStart } },
            ],
          }
        : {}),
    },
    include: {
      snowmobile: true,
      guest: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { startTime: "asc" },
  });

  // Group by snowmobile ID
  const rentalsBySnowmobile = rentals.reduce(
    (acc, rental) => {
      if (!acc[rental.snowmobileId]) {
        acc[rental.snowmobileId] = [];
      }
      acc[rental.snowmobileId].push({
        rentalId: rental.id,
        guestName: rental.guest.name,
        guestEmail: rental.guest.email,
        startTime: rental.startTime,
        endTime: rental.endTime,
        approvalStatus: rental.approvalStatus,
      });
      return acc;
    },
    {} as Record<number, any[]>,
  );

  return rentalsBySnowmobile;
}
