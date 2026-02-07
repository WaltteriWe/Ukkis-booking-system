import "dotenv/config";
import { PrismaClient } from "../../generated/prisma";
import { z } from "zod";
import { BOOKING_STATUS } from "../../shared/constants";
import { format } from "date-fns";
import {
  sendApprovalEmail,
  sendRejectionEmail,
  sendPendingBookingEmail,
  sendConfirmationEmail,
} from "./emailController";

const prisma = new PrismaClient();

// Update the gear sizes schema
const gearSizesSchema = z.object({
  name: z.string().min(1, "Name is required"),
  overalls: z.string().min(1, "Overalls size is required"),
  boots: z.string().min(1, "Boots size is required"),
  gloves: z.string().min(1, "Gloves size is required"),
  helmet: z.string().min(1, "Helmet size is required"),
});

// Update the create booking schema
const createBookingSchema = z.object({
  packageId: z.number().int().positive(),
  departureId: z.number().int().positive().optional(),
  participants: z.number().int().positive(),
  totalPrice: z.number().positive().optional(), // Total price from frontend (includes add-ons)
  guestEmail: z.string().email(),
  guestName: z.string().min(1),
  phone: z.string().optional(),
  notes: z.string().optional(),
  participantGearSizes: z.record(z.string(), gearSizesSchema).optional(),
  snowmobileAssignments: z.array(z.object({
    snowmobileId: z.number().int().positive(),
    passengerCount: z.number().int().min(1).max(2),
  })).optional(),
});

export async function createBooking(body: unknown) {
  const data = createBookingSchema.parse(body);

  const booking = await prisma.$transaction(
    async (tx) => {
      const pkg = await tx.safariPackage.findUnique({
        where: { id: data.packageId },
      });

      if (!pkg) {
        console.error("Package not found:", data.packageId);
        throw { status: 400, error: "Invalid package" };
      }

      console.log("Package found:", pkg.name);

      // Use totalPrice from frontend if provided, otherwise calculate from basePrice
      const totalPrice =
        data.totalPrice ?? Number(pkg.basePrice) * data.participants;

      const guest = await tx.guest.upsert({
        where: { email: data.guestEmail },
        update: {
          name: data.guestName,
          phone: data.phone ?? undefined,
        },
        create: {
          email: data.guestEmail,
          name: data.guestName,
          phone: data.phone ?? undefined,
        },
      });

      // Extract date and time from notes
      let bookingDate = null;
      let bookingTime = null;
      if (data.notes) {
        const dateMatch = data.notes.match(/Date: (\d{4}-\d{2}-\d{2})/);
        const timeMatch = data.notes.match(/Time: (\d{2}:\d{2})/);

        if (dateMatch) bookingDate = dateMatch[1];
        if (timeMatch) bookingTime = timeMatch[1];
      }

      // Check departure capacity if departureId is provided
      if (data.departureId) {
        const departure = await tx.departure.findUnique({
          where: { id: data.departureId },
        });

        if (!departure) {
          throw { status: 400, error: "Invalid departure" };
        }

        // Calculate current reserved spots (only count approved bookings)
        const existingBookings = await tx.booking.findMany({
          where: {
            departureId: data.departureId,
            approvalStatus: "approved",
          },
        });

        const totalReserved = existingBookings.reduce(
          (sum, b) => sum + b.participants,
          0
        );

        // Check if adding this booking would exceed capacity
        if (totalReserved + data.participants > departure.capacity) {
          throw {
            status: 400,
            error: `Not enough capacity. Available: ${
              departure.capacity - totalReserved
            }, Requested: ${data.participants}`,
          };
        }

        console.log(
          `Capacity check passed: ${totalReserved}/${departure.capacity} reserved, adding ${data.participants}`
        );
      }

      const bookingData: any = {
        departureId: data.departureId,
        guestId: guest.id,
        packageId: data.packageId,
        participants: data.participants,
        totalPrice,
        status: "pending", // Changed to pending - requires admin approval
        approvalStatus: "pending", // Explicitly set approval status
        notes: data.notes ?? null,
        guestEmail: data.guestEmail,
        guestName: data.guestName,
        phone: data.phone ?? null,
        bookingDate: bookingDate,
        bookingTime: bookingTime,
      };

      if (data.departureId) {
        bookingData.departureId = data.departureId;
      }

      const createdBooking = await tx.booking.create({
        data: bookingData,
        include: {
          package: true,
        },
      });

      if (data.participantGearSizes) {
        const gearPromises = Object.entries(data.participantGearSizes).map(
          ([participantNum, gear]) =>
            tx.participantGear.create({
              data: {
                bookingId: createdBooking.id,
                name: gear.name,
                overalls: gear.overalls,
                boots: gear.boots,
                gloves: gear.gloves,
                helmet: gear.helmet,
              },
            })
        );

        await Promise.all(gearPromises);
      }

      // Create snowmobile assignments if provided
      if (data.snowmobileAssignments && data.snowmobileAssignments.length > 0) {
        // Validate total passenger count matches
        const totalSnowmobilePassengers = data.snowmobileAssignments.reduce(
          (sum, assignment) => sum + assignment.passengerCount,
          0
        );

        if (totalSnowmobilePassengers !== data.participants) {
          throw {
            status: 400,
            error: `Snowmobile passenger count (${totalSnowmobilePassengers}) must match total participants (${data.participants})`,
          };
        }

        // Check if snowmobiles are assigned to this departure
        if (data.departureId) {
          const assignedSnowmobiles = await tx.safariSnowmobileAssignment.findMany({
            where: {
              departureId: data.departureId,
              snowmobileId: { in: data.snowmobileAssignments.map(a => a.snowmobileId) },
            },
          });

          const assignedIds = new Set(assignedSnowmobiles.map(a => a.snowmobileId));
          const unassignedSnowmobiles = data.snowmobileAssignments.filter(
            a => !assignedIds.has(a.snowmobileId)
          );

          if (unassignedSnowmobiles.length > 0) {
            throw {
              status: 400,
              error: `Some selected snowmobiles are not assigned to this departure`,
            };
          }
        }

        const assignmentPromises = data.snowmobileAssignments.map((assignment) =>
          tx.bookingSnowmobileAssignment.create({
            data: {
              bookingId: createdBooking.id,
              snowmobileId: assignment.snowmobileId,
              passengerCount: assignment.passengerCount,
            },
          })
        );

        await Promise.all(assignmentPromises);
      }

      return createdBooking;
    },
    { isolationLevel: "Serializable" }
  );

  // Send pending booking notification email (outside transaction)
  try {
    await sendPendingBookingEmail({
      email: data.guestEmail,
      name: data.guestName,
      tour: booking.package?.name || "Safari Tour",
      date: booking.bookingDate || "TBD",
      time: booking.bookingTime || "TBD",
      total: Number(booking.totalPrice),
      bookingId: String(booking.id),
      participants: data.participants,
      participantGearSizes: data.participantGearSizes,
    });
    console.log(`✅ Pending booking email sent for booking ${booking.id}`);
  } catch (error) {
    console.error(
      `❌ Failed to send pending booking email for booking ${booking.id}:`,
      error
    );
    // Don't throw error - booking is still created even if email fails
  }

  return booking;
}

export async function getBookings() {
  return await prisma.booking.findMany({
    include: {
      guest: true,
      package: true,
      departure: {
        include: {
          package: true,
        },
      },
      participantGear: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getBookingById(id: number) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      guest: true,
      package: true,
      departure: {
        include: {
          package: true,
        },
      },
      participantGear: true,
    },
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

  // Use transaction to handle reserved count updates
  const updatedBooking = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw { status: 404, error: "Booking not found" };
    }

    // If cancelling an approved booking, decrease reserved count
    if (
      data.status === "cancelled" &&
      booking.approvalStatus === "approved" &&
      booking.departureId
    ) {
      const departure = await tx.departure.findUnique({
        where: { id: booking.departureId },
      });

      if (departure) {
        const newReserved = Math.max(0, departure.reserved - booking.participants);
        await tx.departure.update({
          where: { id: booking.departureId },
          data: { reserved: newReserved },
        });
        console.log(
          `Decreased reserved count from ${departure.reserved} to ${newReserved} for departure ${booking.departureId} (cancelled)`
        );
      }
    }

    return await tx.booking.update({
      where: { id },
      data: { status: data.status },
      include: {
        guest: true,
        departure: {
          include: {
            package: true,
          },
        },
        participantGear: true,
      },
    });
  });

  return updatedBooking;
}

export async function getAvailability(packageId: number, month: string) {
  const startOfMonth = new Date(month);
  const endOfMonth = new Date(
    startOfMonth.getFullYear(),
    startOfMonth.getMonth() + 1,
    0
  );

  console.log(
    `Checking availability for package ${packageId} from ${startOfMonth.toISOString()} to ${endOfMonth.toISOString()}`
  );

  const bookings = await prisma.booking.findMany({
    where: {
      packageId: packageId,
      bookingDate: {
        gte: format(startOfMonth, "yyyy-MM-dd"),
        lte: format(endOfMonth, "yyyy-MM-dd"),
      },
    },
    select: {
      bookingDate: true,
      participants: true,
    },
  });

  console.log(
    `Found ${bookings.length} bookings for package ${packageId} in this month`
  );

  const pkg = await prisma.safariPackage.findUnique({
    where: { id: packageId },
    select: { capacity: true },
  });
  const capacity = pkg?.capacity || 8;

  const availability: Record<
    string,
    {
      booked: number;
      capacity: number;
      status: "available" | "limited" | "full";
    }
  > = {};

  bookings.forEach((booking) => {
    if (booking.bookingDate) {
      const dateStr = booking.bookingDate;

      if (!availability[dateStr]) {
        availability[dateStr] = {
          booked: 0,
          capacity: capacity,
          status: "available",
        };
      }
      availability[dateStr].booked += booking.participants;
      console.log(
        `Date ${dateStr}: +${booking.participants} participants (total: ${availability[dateStr].booked}/${capacity})`
      );
    }
  });

  Object.keys(availability).forEach((date) => {
    const day = availability[date];
    const percentBooked = (day.booked / day.capacity) * 100;

    if (percentBooked >= 100) {
      day.status = "full";
    } else if (percentBooked >= 60) {
      day.status = "limited";
    } else {
      day.status = "available";
    }

    console.log(
      `${date}: ${day.booked}/${day.capacity} = ${percentBooked.toFixed(1)}% (${
        day.status
      })`
    );
  });

  console.log("Final availability:", availability);

  return availability;
}

const approveBookingSchema = z.object({
  adminMessage: z.string().optional(),
});

export async function approveBooking(id: number, body: unknown) {
  const data = approveBookingSchema.parse(body);

  // Use a transaction to prevent race conditions
  const updatedBooking = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id },
      include: {
        package: true,
        participantGear: true,
      },
    });

    if (!booking) {
      throw { status: 404, error: "Booking not found" };
    }

    // Prevent approving already approved bookings
    if (booking.approvalStatus === "approved") {
      throw { status: 400, error: "Booking is already approved" };
    }

    // Check capacity if this booking has a departureId
    if (booking.departureId) {
      // Lock the departure row to prevent concurrent modifications
      const departure = await tx.departure.findUnique({
        where: { id: booking.departureId },
      });

      if (!departure) {
        throw { status: 400, error: "Invalid departure" };
      }

      // Calculate current approved bookings (excluding this one)
      const existingBookings = await tx.booking.findMany({
        where: {
          departureId: booking.departureId,
          approvalStatus: "approved",
          id: { not: id }, // Exclude current booking
        },
      });

      const totalReserved = existingBookings.reduce(
        (sum, b) => sum + b.participants,
        0
      );

      // Check if approving this booking would exceed capacity
      if (totalReserved + booking.participants > departure.capacity) {
        throw {
          status: 400,
          error: `Cannot approve: Exceeds capacity. Available: ${
            departure.capacity - totalReserved
          }, Booking has: ${booking.participants}`,
        };
      }

      console.log(
        `Approval capacity check passed: ${totalReserved}/${departure.capacity} reserved, approving ${booking.participants}`
      );

      // Update the reserved count on the departure
      await tx.departure.update({
        where: { id: booking.departureId },
        data: { reserved: totalReserved + booking.participants },
      });
    }

    // Update booking approval status
    return await tx.booking.update({
      where: { id },
      data: { approvalStatus: "approved" },
      include: {
        guest: true,
        package: true,
        participantGear: true,
      },
    });
  });

  // Send approval confirmation email
  try {
    await sendApprovalEmail({
      email: updatedBooking.guestEmail,
      name: updatedBooking.guestName,
      tour: updatedBooking.package.name,
      date: updatedBooking.bookingDate || "TBD",
      time: updatedBooking.bookingTime || "TBD",
      total: updatedBooking.totalPrice,
      bookingId: String(updatedBooking.id),
      participants: updatedBooking.participants,
      adminMessage: data.adminMessage,
      participantGearSizes: (updatedBooking.participantGearSizes as any) || undefined,
    });
    console.log(`✅ Approval email sent for booking ${id}`);
  } catch (error) {
    console.error(`❌ Failed to send approval email for booking ${id}:`, error);
    // Don't throw error - booking is still approved even if email fails
  }

  return updatedBooking;
}

const rejectBookingSchema = z.object({
  rejectionReason: z.string().min(1, "Rejection reason is required"),
});

export async function rejectBooking(id: number, body: unknown) {
  const data = rejectBookingSchema.parse(body);

  // Use a transaction to handle reserved count properly
  const updatedBooking = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id },
      include: {
        package: true,
        participantGear: true,
      },
    });

    if (!booking) {
      throw { status: 404, error: "Booking not found" };
    }

    // If the booking was previously approved, we need to decrease the reserved count
    if (booking.approvalStatus === "approved" && booking.departureId) {
      const departure = await tx.departure.findUnique({
        where: { id: booking.departureId },
      });

      if (departure) {
        const newReserved = Math.max(0, departure.reserved - booking.participants);
        await tx.departure.update({
          where: { id: booking.departureId },
          data: { reserved: newReserved },
        });
        console.log(
          `Decreased reserved count from ${departure.reserved} to ${newReserved} for departure ${booking.departureId}`
        );
      }
    }

    // Update booking to rejected
    return await tx.booking.update({
      where: { id },
      data: {
        approvalStatus: "rejected",
        rejectionReason: data.rejectionReason,
      },
      include: {
        guest: true,
        package: true,
        participantGear: true,
      },
    });
  });

  // Send rejection email
  try {
    await sendRejectionEmail({
      email: updatedBooking.guestEmail,
      name: updatedBooking.guestName,
      tour: updatedBooking.package.name,
      bookingId: String(updatedBooking.id),
      rejectionReason: data.rejectionReason,
    });
    console.log(`✅ Rejection email sent for booking ${id}`);
  } catch (error) {
    console.error(
      `❌ Failed to send rejection email for booking ${id}:`,
      error
    );
    // Don't throw error - booking is still rejected even if email fails
  }

  return updatedBooking;
}

// This function is no longer needed as payment is handled on-site
// Removed Stripe payment confirmation logic

/**
 * Recalculate and sync the reserved counts for all departures
 * Use this to fix any inconsistencies in the reserved field
 */
export async function syncDepartureReservedCounts() {
  const departures = await prisma.departure.findMany({
    include: {
      bookings: {
        where: {
          approvalStatus: "approved",
        },
        select: {
          participants: true,
        },
      },
    },
  });

  const updates = [];
  for (const departure of departures) {
    const calculatedReserved = departure.bookings.reduce(
      (sum, b) => sum + b.participants,
      0
    );

    if (departure.reserved !== calculatedReserved) {
      console.log(
        `🔄 Syncing departure ${departure.id}: ${departure.reserved} -> ${calculatedReserved}`
      );
      updates.push(
        prisma.departure.update({
          where: { id: departure.id },
          data: { reserved: calculatedReserved },
        })
      );
    }
  }

  if (updates.length > 0) {
    await Promise.all(updates);
    console.log(`✅ Synced ${updates.length} departure(s)`);
  } else {
    console.log(`✅ All departures are in sync`);
  }

  return { synced: updates.length, total: departures.length };
}
