import { FastifyInstance } from "fastify";
import { createBooking } from "../controllers/bookingController";

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
}
