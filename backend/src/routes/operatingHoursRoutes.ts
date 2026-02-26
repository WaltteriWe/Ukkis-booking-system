import { FastifyInstance } from "fastify";
import {
  getOperatingHours,
  getAllOperatingHours,
  setDefaultOperatingHours,
  setDateOperatingHours,
  deleteDateOperatingHours,
  getOperatingHoursRange,
} from "../controllers/operatingHoursController";

export async function operatingHoursRoutes(app: FastifyInstance) {
  // Get operating hours for a specific date (or default if no date provided)
  app.get("/operating-hours", async (req, reply) => {
    try {
      const { date } = req.query as { date?: string };
      const hours = await getOperatingHours(date);
      return reply.send(hours);
    } catch (error: any) {
      app.log.error(error);
      return reply.code(500).send({ error: "Failed to fetch operating hours" });
    }
  });

  // Get all operating hours (default + all overrides)
  app.get("/operating-hours/all", async (req, reply) => {
    try {
      const hours = await getAllOperatingHours();
      return reply.send(hours);
    } catch (error: any) {
      app.log.error(error);
      return reply.code(500).send({ error: "Failed to fetch all operating hours" });
    }
  });

  // Get operating hours for a date range
  app.get("/operating-hours/range", async (req, reply) => {
    try {
      const { startDate, endDate } = req.query as { startDate: string; endDate: string };
      
      if (!startDate || !endDate) {
        return reply.code(400).send({ error: "startDate and endDate are required" });
      }

      const hours = await getOperatingHoursRange(startDate, endDate);
      return reply.send(hours);
    } catch (error: any) {
      app.log.error(error);
      return reply.code(500).send({ error: "Failed to fetch operating hours range" });
    }
  });

  // Set default operating hours (admin only)
  app.put("/operating-hours/default", async (req, reply) => {
    try {
      const data = req.body as {
        openingTime: string;
        closingTime: string;
        isClosed?: boolean;
        notes?: string;
      };

      if (!data.openingTime || !data.closingTime) {
        return reply.code(400).send({ error: "openingTime and closingTime are required" });
      }

      const hours = await setDefaultOperatingHours(data);
      return reply.send(hours);
    } catch (error: any) {
      app.log.error(error);
      return reply.code(500).send({ error: "Failed to set default operating hours" });
    }
  });

  // Set date-specific operating hours (admin only)
  app.put("/operating-hours/date", async (req, reply) => {
    try {
      const data = req.body as {
        date: string;
        openingTime: string;
        closingTime: string;
        isClosed?: boolean;
        notes?: string;
      };

      if (!data.date || !data.openingTime || !data.closingTime) {
        return reply.code(400).send({ 
          error: "date, openingTime and closingTime are required" 
        });
      }

      const hours = await setDateOperatingHours(data);
      return reply.send(hours);
    } catch (error: any) {
      app.log.error(error);
      return reply.code(500).send({ error: "Failed to set date-specific operating hours" });
    }
  });

  // Delete date-specific operating hours (admin only)
  app.delete("/operating-hours/date", async (req, reply) => {
    try {
      const { date } = req.query as { date: string };

      if (!date) {
        return reply.code(400).send({ error: "date is required" });
      }

      const result = await deleteDateOperatingHours(date);
      return reply.send(result);
    } catch (error: any) {
      app.log.error(error);
      return reply.code(500).send({ error: error.message || "Failed to delete operating hours" });
    }
  });
}
