import { FastifyInstance } from 'fastify';
import { listDepartures, createDeparture, updateDeparture, deleteDeparture } from '../controllers/departureController';
import { assignSnowmobilesToDeparture, getSnowmobileAssignments } from '../controllers/rentalController';

export async function departureRoutes(app: FastifyInstance) {
  // Get departures
  app.get('/departures', async (req, reply) => {
    try {
      const { packageId, from, to, onlyAvailable } = req.query as {
        packageId?: string;
        from?: string;
        to?: string;
        onlyAvailable?: string;
      };

      const departures = await listDepartures({
        packageId: packageId ? parseInt(packageId) : undefined,
        from: from ? new Date(from) : undefined,
        to: to ? new Date(to) : undefined,
        onlyAvailable: onlyAvailable === 'true',
      });

      return reply.send(departures);
    } catch (e: any) {
      const c = e?.status ?? 500;
      if (!e?.status) app.log.error(e);
      return reply.code(c).send(e);
    }
  });

  // Create departure
  app.post('/departures', async (req, reply) => {
    try {
      const departure = await createDeparture(req.body);
      return reply.code(201).send(departure);
    } catch (e: any) {
      const c = e?.status ?? 500;
      if (!e?.status) app.log.error(e);
      return reply.code(c).send({ error: e?.message || 'Failed to create departure' });
    }
  });

  // Assign snowmobiles to a departure
  app.post('/departures/:id/snowmobiles', async (req, reply) => {
    try {
      const { id } = req.params as { id: string };
      const body = (req.body as Record<string, any>) ?? {};
      const assignments = await assignSnowmobilesToDeparture({
        ...body,
        departureId: parseInt(id),
      });
      return reply.send(assignments);
    } catch (e: any) {
      const c = e?.status ?? 500;
      if (!e?.status) app.log.error(e);
      return reply.code(c).send(e);
    }
  });

  // Get snowmobile assignments for a departure
  app.get('/departures/:id/snowmobiles', async (req, reply) => {
    try {
      const { id } = req.params as { id: string };
      const assignments = await getSnowmobileAssignments(parseInt(id));
      return reply.send(assignments);
    } catch (e: any) {
      const c = e?.status ?? 500;
      if (!e?.status) app.log.error(e);
      return reply.code(c).send(e);
    }
  });

  // Update departure
  app.put('/departures/:id', async (req, reply) => {
    try {
      const { id } = req.params as { id: string };
      const departure = await updateDeparture(parseInt(id), req.body);
      return reply.send(departure);
    } catch (e: any) {
      const c = e?.status ?? 500;
      if (!e?.status) app.log.error(e);
      return reply.code(c).send({ error: e?.message || 'Failed to update departure' });
    }
  });

  // Delete departure
  app.delete('/departures/:id', async (req, reply) => {
    try {
      const { id } = req.params as { id: string };
      const departure = await deleteDeparture(parseInt(id));
      return reply.send(departure);
    } catch (e: any) {
      const c = e?.status ?? 500;
      if (!e?.status) app.log.error(e);
      return reply.code(c).send({ error: e?.message || 'Failed to delete departure' });
    }
  });
}

export default departureRoutes;
