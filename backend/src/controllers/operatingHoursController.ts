import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

// Get operating hours for a specific date or default
export async function getOperatingHours(date?: string) {
  try {
    let operatingHours;

    if (date) {
      // Try to find specific hours for this date using date range to avoid timezone issues
      operatingHours = await prisma.operatingHours.findFirst({
        where: {
          date: {
            gte: new Date(date + 'T00:00:00.000Z'),
            lt: new Date(date + 'T23:59:59.999Z'),
          },
        },
      });
    }

    // If no specific hours found, get default hours (where date is null)
    if (!operatingHours) {
      operatingHours = await prisma.operatingHours.findFirst({
        where: { date: null },
      });
    }

    // If no default hours exist, return default values
    if (!operatingHours) {
      return {
        openingTime: "08:00",
        closingTime: "18:00",
        isClosed: false,
        notes: null,
      };
    }

    return operatingHours;
  } catch (error) {
    console.error("Error fetching operating hours:", error);
    throw error;
  }
}

// Get all operating hours (default + overrides)
export async function getAllOperatingHours() {
  try {
    const hours = await prisma.operatingHours.findMany({
      orderBy: [
        { date: { sort: "asc", nulls: "first" } },
      ],
    });
    return hours;
  } catch (error) {
    console.error("Error fetching all operating hours:", error);
    throw error;
  }
}

// Create or update default operating hours
export async function setDefaultOperatingHours(data: {
  openingTime: string;
  closingTime: string;
  isClosed?: boolean;
  notes?: string;
}) {
  try {
    const existing = await prisma.operatingHours.findFirst({
      where: { date: null },
    });

    if (existing) {
      return await prisma.operatingHours.update({
        where: { id: existing.id },
        data: {
          openingTime: data.openingTime,
          closingTime: data.closingTime,
          isClosed: data.isClosed || false,
          notes: data.notes,
        },
      });
    } else {
      return await prisma.operatingHours.create({
        data: {
          date: null,
          openingTime: data.openingTime,
          closingTime: data.closingTime,
          isClosed: data.isClosed || false,
          notes: data.notes,
        },
      });
    }
  } catch (error) {
    console.error("Error setting default operating hours:", error);
    throw error;
  }
}

// Create or update date-specific operating hours
export async function setDateOperatingHours(data: {
  date: string;
  openingTime: string;
  closingTime: string;
  isClosed?: boolean;
  notes?: string;
}) {
  try {
    // Use noon UTC to avoid timezone issues
    const dateObj = new Date(data.date + 'T12:00:00.000Z');
    
    // Find existing using date range
    const existing = await prisma.operatingHours.findFirst({
      where: {
        date: {
          gte: new Date(data.date + 'T00:00:00.000Z'),
          lt: new Date(data.date + 'T23:59:59.999Z'),
        },
      },
    });

    if (existing) {
      return await prisma.operatingHours.update({
        where: { id: existing.id },
        data: {
          openingTime: data.openingTime,
          closingTime: data.closingTime,
          isClosed: data.isClosed || false,
          notes: data.notes,
        },
      });
    } else {
      return await prisma.operatingHours.create({
        data: {
          date: dateObj,
          openingTime: data.openingTime,
          closingTime: data.closingTime,
          isClosed: data.isClosed || false,
          notes: data.notes,
        },
      });
    }
  } catch (error) {
    console.error("Error setting date-specific operating hours:", error);
    throw error;
  }
}

// Delete date-specific operating hours (will fall back to default)
export async function deleteDateOperatingHours(date: string) {
  try {
    // Parse date at noon UTC to avoid timezone issues
    const dateObj = new Date(date + 'T12:00:00.000Z');
    
    console.log("Attempting to delete operating hours for date:", date, "Parsed as:", dateObj);

    // Use findFirst with date comparison to handle timezone issues
    const existing = await prisma.operatingHours.findFirst({
      where: {
        date: {
          gte: new Date(date + 'T00:00:00.000Z'),
          lt: new Date(date + 'T23:59:59.999Z'),
        },
      },
    });

    console.log("Found existing operating hours:", existing);

    if (!existing) {
      throw new Error("No operating hours found for this date");
    }

    if (existing.date === null) {
      throw new Error("Cannot delete default operating hours");
    }

    await prisma.operatingHours.delete({
      where: { id: existing.id },
    });

    console.log("Successfully deleted operating hours with id:", existing.id);
    return { success: true };
  } catch (error) {
    console.error("Error deleting operating hours:", error);
    throw error;
  }
}

// Get operating hours for a date range
export async function getOperatingHoursRange(startDate: string, endDate: string) {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const overrides = await prisma.operatingHours.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { date: "asc" },
    });

    // Get default hours
    const defaultHours = await prisma.operatingHours.findFirst({
      where: { date: null },
    });

    return {
      defaultHours: defaultHours || {
        openingTime: "08:00",
        closingTime: "18:00",
        isClosed: false,
      },
      overrides,
    };
  } catch (error) {
    console.error("Error fetching operating hours range:", error);
    throw error;
  }
}
