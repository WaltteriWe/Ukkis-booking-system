import { FastifyInstance } from "fastify";
import { createBooking, getBookings, getBookingById, updateBookingStatus } from "../controllers/bookingController";

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
}
