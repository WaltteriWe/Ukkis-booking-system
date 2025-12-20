import "dotenv/config";
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
    from: z
      .union([z.string(), z.date()])
      .optional()
      .transform((val) => (val ? (typeof val === 'string' ? new Date(val) : val) : undefined)),
    to: z
      .union([z.string(), z.date()])
      .optional()
      .transform((val) => (val ? (typeof val === 'string' ? new Date(val) : val) : undefined)),
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
      package: true,
      bookings: true,
    },
    orderBy: {
      departureTime: "asc",
    },
  });

  // Calculate reserved count from bookings and add to response
  const departuresWithReserved = departures.map((dep: any) => {
    const bookedSeats = dep.bookings.reduce(
      (sum: number, b: any) => sum + b.participants,
      0
    );
    return {
      ...dep,
      reserved: bookedSeats,
    };
  });

  if (params.onlyAvailable) {
    const filtered = departuresWithReserved.filter((dep: any) => {
      return dep.reserved < dep.capacity;
    });
    return { items: filtered };
  }

  return { items: departuresWithReserved };
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
    where: { id: data.packageId },
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
    },
  });

  return departure;
}

export async function updateDeparture(departureId: number, body: unknown) {
  const schema = z.object({
    packageId: z.number().int().positive().optional(),
    departureTime: z.string().datetime().optional(),
    capacity: z.number().int().positive().optional(),
  });

  const data = schema.parse(body);

  // Check if departure exists
  const departure = await prisma.departure.findUnique({
    where: { id: departureId },
  });

  if (!departure) {
    throw { status: 404, error: "Departure not found" };
  }

  // Check if package exists if packageId is being updated
  if (data.packageId) {
    const packageExists = await prisma.safariPackage.findUnique({
      where: { id: data.packageId },
    });

    if (!packageExists) {
      throw { status: 400, error: "Package not found" };
    }
  }

  // Update the departure
  const updatedDeparture = await prisma.departure.update({
    where: { id: departureId },
    data: {
      ...(data.packageId && { packageId: data.packageId }),
      ...(data.departureTime && { departureTime: new Date(data.departureTime) }),
      ...(data.capacity && { capacity: data.capacity }),
    },
  });

  return updatedDeparture;
}

export async function deleteDeparture(departureId: number) {
  // Check if departure exists
  const departure = await prisma.departure.findUnique({
    where: { id: departureId },
  });

  if (!departure) {
    throw { status: 404, error: "Departure not found" };
  }

  // Delete associated bookings first (cascade)
  await prisma.booking.deleteMany({
    where: { departureId: departureId },
  });

  // Delete the departure
  const deletedDeparture = await prisma.departure.delete({
    where: { id: departureId },
  });

  return deletedDeparture;
}
