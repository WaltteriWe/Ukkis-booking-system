import fastify, { FastifyInstance } from "fastify";
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  getAvailability,
  approveBooking,
  rejectBooking,
  confirmPayment,
} from "../controllers/bookingController";

export async function bookingRoutes(app: FastifyInstance) {
  app.post("/bookings", async (req, reply) => {
    try {
      const data = await createBooking(req.body);
      return reply.code(201).send(data);
    } catch (e: any) {
      const c = e?.status ?? 500;
      if (!e?.status) app.log.error(e);
      return reply.code(c).send(e);
    }
  });

  app.get("/bookings", async (req, reply) => {
    try {
      const data = await getBookings();
      return reply.send(data);
    } catch (e: any) {
      const c = e?.status ?? 500;
      if (!e?.status) app.log.error(e);
      return reply.code(c).send(e);
    }
  });

  app.get("/bookings/:id", async (req, reply) => {
    try {
      const { id } = req.params as { id: string };
      const data = await getBookingById(Number(id));
      return reply.send(data);
    } catch (e: any) {
      const c = e?.status ?? 500;
      if (!e?.status) app.log.error(e);
      return reply.code(c).send(e);
    }
  });

  app.put("/bookings/:id/status", async (req, reply) => {
    try {
      const { id } = req.params as { id: string };
      const data = await updateBookingStatus(Number(id), req.body);
      return reply.send(data);
    } catch (e: any) {
      const c = e?.status ?? 500;
      if (!e?.status) app.log.error(e);
      return reply.code(c).send(e);
    }
  });

  app.get(
    "/bookings/availability/:packageId/:month",
    async (request, reply) => {
      try {
        const { packageId, month } = request.params as {
          packageId: string;
          month: string;
        };
        const availability = await getAvailability(parseInt(packageId), month);
        reply.send(availability);
      } catch (error) {
        console.error("Error fetching availability:", error);
        reply.status(500).send({ error: "Failed to fetch availability" });
      }
    }
  );

  app.put("/bookings/:id/approve", async (req, reply) => {
    try {
      const { id } = req.params as { id: string };
      const data = await approveBooking(Number(id), req.body);
      return reply.send(data);
    } catch (e: any) {
      const c = e?.status ?? 500;
      if (!e?.status) app.log.error(e);
      return reply.code(c).send(e);
    }
  });

  app.put("/bookings/:id/reject", async (req, reply) => {
    try {
      const { id } = req.params as { id: string };
      const data = await rejectBooking(Number(id), req.body);
      return reply.send(data);
    } catch (e: any) {
      const c = e?.status ?? 500;
      if (!e?.status) app.log.error(e);
      return reply.code(c).send(e);
    }
  });

  // Confirm payment manually (for local dev without webhooks)
  app.post("/bookings/confirm-payment", async (req, reply) => {
    try {
      const { paymentIntentId } = req.body as { paymentIntentId: string };
      if (!paymentIntentId) {
        return reply.code(400).send({ error: "paymentIntentId is required" });
      }
      const data = await confirmPayment(paymentIntentId);
      return reply.send(data);
    } catch (e: any) {
      const c = e?.status ?? 500;
      if (!e?.status) app.log.error(e);
      return reply.code(c).send(e);
    }
  });
}
