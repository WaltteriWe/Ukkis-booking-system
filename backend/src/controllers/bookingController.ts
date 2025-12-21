import "dotenv/config";
import { PrismaClient } from "../../generated/prisma";
import { z } from "zod";
import { BOOKING_STATUS } from "../../shared/constants";
import { format } from "date-fns";
import Stripe from "stripe";
import {
  sendApprovalEmail,
  sendRejectionEmail,
  sendPendingBookingEmail,
  sendConfirmationEmail,
} from "./emailController";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

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

  const booking = await prisma.booking.findUnique({
    where: { id },
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
          package: true,
        },
      },
      participantGear: true,
    },
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

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      package: true,
      participantGear: true,
    },
  });

  if (!booking) {
    throw { status: 404, error: "Booking not found" };
  }

  // Check capacity if this booking has a departureId
  if (booking.departureId) {
    const departure = await prisma.departure.findUnique({
      where: { id: booking.departureId },
    });

    if (!departure) {
      throw { status: 400, error: "Invalid departure" };
    }

    // Calculate current approved bookings (excluding this one)
    const existingBookings = await prisma.booking.findMany({
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
  }

  const updatedBooking = await prisma.booking.update({
    where: { id },
    data: { approvalStatus: "approved" },
    include: {
      guest: true,
      package: true,
      participantGear: true,
    },
  });

  // Send approval confirmation email
  try {
    await sendApprovalEmail({
      email: booking.guestEmail,
      name: booking.guestName,
      tour: booking.package.name,
      date: booking.bookingDate || "TBD",
      time: booking.bookingTime || "TBD",
      total: booking.totalPrice,
      bookingId: String(booking.id),
      participants: booking.participants,
      adminMessage: data.adminMessage,
      participantGearSizes: (booking.participantGearSizes as any) || undefined,
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

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      package: true,
      participantGear: true,
    },
  });

  if (!booking) {
    throw { status: 404, error: "Booking not found" };
  }

  const updatedBooking = await prisma.booking.update({
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

  // Send rejection email
  try {
    await sendRejectionEmail({
      email: booking.guestEmail,
      name: booking.guestName,
      tour: booking.package.name,
      bookingId: String(booking.id),
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

// Confirm payment manually (for local development without webhooks)
export async function confirmPayment(paymentIntentId: string) {
  // Find booking with this payment intent
  const booking = await prisma.booking.findFirst({
    where: { paymentIntentId },
    include: {
      guest: true,
      package: true,
      participantGear: true,
    },
  });

  if (!booking) {
    throw { status: 404, error: "Booking not found for this payment" };
  }

  // Check if already confirmed
  if (booking.paymentStatus === "succeeded") {
    return { message: "Payment already confirmed", booking };
  }

  // Verify payment with Stripe
  let paymentIntent: Stripe.PaymentIntent;
  try {
    paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ["charges.data.payment_method_details"],
    });
    console.log(
      `✅ Retrieved payment intent from Stripe: ${paymentIntent.id}, status: ${paymentIntent.status}`
    );
  } catch (error) {
    console.error("❌ Failed to retrieve payment intent from Stripe:", error);
    throw { status: 400, error: "Failed to verify payment with Stripe" };
  }

  // Check if payment actually succeeded on Stripe's side
  if (paymentIntent.status !== "succeeded") {
    console.warn(
      `⚠️ Payment intent ${paymentIntentId} has status: ${paymentIntent.status}`
    );
    throw {
      status: 400,
      error: "Payment not completed",
      stripeStatus: paymentIntent.status,
    };
  }

  // Update booking status
  const updatedBooking = await prisma.booking.update({
    where: { id: booking.id },
    data: {
      paymentStatus: "succeeded",
      status: "confirmed",
      paymentMethod:
        (paymentIntent as any).charges?.data[0]?.payment_method_details?.type ||
        null,
    },
    include: {
      guest: true,
      package: true,
      participantGear: true,
    },
  });

  // Send confirmation email
  try {
    console.log(
      `Sending confirmation email for booking ${booking.id} to ${booking.guest.email}`
    );

    // Extract date and time from notes or use booking created date
    const noteMatch = booking.notes?.match(
      /Date: (\d{4}-\d{2}-\d{2}), Time: (\d{2}:\d{2})/
    );
    const bookingDate =
      noteMatch?.[1] || new Date(booking.createdAt).toISOString().split("T")[0];
    const bookingTime = noteMatch?.[2] || "09:00";

    // Convert participant gear to the format expected by email
    const gearSizes: Record<string, any> = {};
    if (booking.participantGear && booking.participantGear.length > 0) {
      booking.participantGear.forEach((gear, index) => {
        gearSizes[String(index + 1)] = {
          name: gear.name,
          overalls: gear.overalls,
          boots: gear.boots,
          gloves: gear.gloves,
          helmet: gear.helmet,
        };
      });
    }

    const emailData = {
      email: booking.guest.email,
      name: booking.guest.name,
      tour: booking.package.name,
      date: bookingDate,
      time: bookingTime,
      participants: booking.participants,
      total: Number(booking.totalPrice),
      bookingId: `UK${booking.id}`,
      phone: booking.guest.phone || "",
      addons: booking.notes || "",
      gearSizes: Object.keys(gearSizes).length > 0 ? gearSizes : undefined,
    };

    await sendConfirmationEmail(emailData);
    console.log(`✅ Confirmation email sent for booking ${booking.id}`);
  } catch (error) {
    console.error(
      `❌ Failed to send confirmation email for booking ${booking.id}:`,
      error
    );
    // Don't throw - we still want the payment to be marked as succeeded
  }

  return { message: "Payment confirmed successfully", booking: updatedBooking };
}
