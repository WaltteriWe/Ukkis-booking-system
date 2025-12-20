import { FastifyInstance } from "fastify";
import {
  getAvailableSnowmobiles,
  createSnowmobileRental,
  getSnowmobiles,
  createSnowmobile,
  getSingleReservations,
  updateRentalStatus,
  getSnowmobileAssignments,
  assignSnowmobilesToDeparture,
  approveSnowmobileRental,
  rejectSnowmobileRental,
  getDisabledSnowmobiles,
  updateSnowmobile,
  toggleSnowmobileMaintenance,
} from '../controllers/rentalController';

export async function rentalRoutes(app: FastifyInstance) {
  // Get all snowmobiles
  app.get("/snowmobiles", async (req, reply) => {
    try {
      const snowmobiles = await getSnowmobiles();
      return reply.send(snowmobiles);
    } catch (e: any) {
      const c = e?.status ?? 500;
      if (!e?.status) app.log.error(e);
      return reply.code(c).send(e);
    }
  });

  // Get disabled snowmobiles
  app.get("/snowmobiles/disabled", async (req, reply) => {
    try {
      const disabled = await getDisabledSnowmobiles();
      return reply.send(disabled);
    } catch (e: any) {
      const c = e?.status ?? 500;
      if (!e?.status) app.log.error(e);
      return reply.code(c).send(e);
    }
  });

  // Get available snowmobiles
  app.get('/snowmobiles/available', async (req, reply) => {
    try {
      const { startTime, endTime } = req.query as {
        startTime: string;
        endTime: string;
      };

      if (!startTime || !endTime) {
        return reply
          .code(400)
          .send({ error: "startTime and endTime are required" });
      }

      const available = await getAvailableSnowmobiles(
        new Date(startTime),
        new Date(endTime)
      );
      return reply.send(available);
    } catch (e: any) {
      const c = e?.status ?? 500;
      if (!e?.status) app.log.error(e);
      return reply.code(c).send(e);
    }
  });

  // Create a new snowmobile (admin only)
  app.post('/snowmobiles', async (req, reply) => {
    try {
      const snowmobile = await createSnowmobile(req.body);
      return reply.code(201).send(snowmobile);
    } catch (e: any) {
      const c = e?.status ?? 500;
      if (!e?.status) app.log.error(e);
      return reply.code(c).send(e);
    }
  });

  // Create a rental
  app.post("/snowmobile-rentals", async (req, reply) => {
    try {
      const rental = await createSnowmobileRental(req.body);
      return reply.code(201).send(rental);
    } catch (e: any) {
      const c = e?.status ?? 500;
      if (!e?.status) app.log.error(e);
      return reply.code(c).send(e);
    }
  });

  // Get all single reservations (for admin page)
  app.get("/reservations", async (req, reply) => {
    try {
      const reservations = await getSingleReservations();
      return reply.send(reservations);
    } catch (e: any) {
      const c = e?.status ?? 500;
      if (!e?.status) app.log.error(e);
      return reply.code(c).send(e);
    }
  });

  // Update rental status
  app.put("/snowmobile-rentals/:id/status", async (req, reply) => {
    try {
      const { id } = req.params as { id: string };
      const rental = await updateRentalStatus(parseInt(id), req.body);
      return reply.send(rental);
    } catch (e: any) {
      const c = e?.status ?? 500;
      if (!e?.status) app.log.error(e);
      return reply.code(c).send(e);
    }
  });

  // Approve a snowmobile rental
  app.post("/snowmobile-rentals/:id/approve", async (req, reply) => {
    try {
      const { id } = req.params as { id: string };
      const rental = await approveSnowmobileRental(parseInt(id), req.body);
      return reply.send(rental);
    } catch (e: any) {
      const c = e?.status ?? 500;
      if (!e?.status) app.log.error(e);
      return reply.code(c).send(e);
    }
  });

  // Reject a snowmobile rental
  app.post("/snowmobile-rentals/:id/reject", async (req, reply) => {
    try {
      const { id } = req.params as { id: string };
      const rental = await rejectSnowmobileRental(parseInt(id), req.body);
      return reply.send(rental);
    } catch (e: any) {
      const c = e?.status ?? 500;
      if (!e?.status) app.log.error(e);
      return reply.code(c).send(e);
    }
  });

  // Update snowmobile (edit)
  app.put("/snowmobiles/:id", async (req, reply) => {
    try {
      const { id } = req.params as { id: string };
      const snowmobile = await updateSnowmobile(parseInt(id), req.body);
      return reply.send(snowmobile);
    } catch (e: any) {
      const c = e?.status ?? 500;
      if (!e?.status) app.log.error(e);
      return reply.code(c).send(e);
    }
  });

  // Toggle maintenance status
  app.patch("/snowmobiles/:id/maintenance", async (req, reply) => {
    try {
      const { id } = req.params as { id: string };
      const snowmobile = await toggleSnowmobileMaintenance(parseInt(id), req.body);
      return reply.send(snowmobile);
    } catch (e: any) {
      const c = e?.status ?? 500;
      if (!e?.status) app.log.error(e);
      return reply.code(c).send(e);
    }
  });
}

export default rentalRoutes;
