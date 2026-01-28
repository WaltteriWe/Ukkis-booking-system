import { FastifyInstance } from "fastify";
import {
  getAdditionalServices,
  getAllAdditionalServices,
  createAdditionalService,
  updateAdditionalService,
  deleteAdditionalService,
} from "../controllers/additionalServiceController";
import { requireAuth } from "../../middleware/auth";


export default async function additionalServiceRoutes(fastify: FastifyInstance) {
  // Public route - get active services only
  fastify.get("/additional-services", getAdditionalServices);

  // Admin routes - require authentication
  fastify.get(
    "/additional-services/all",
    { preHandler: requireAuth },
    getAllAdditionalServices
  );

  fastify.post(
    "/additional-services",
    { preHandler: requireAuth },
    createAdditionalService
  );

  fastify.put(
    "/additional-services/:id",
    { preHandler: requireAuth },
    updateAdditionalService
  );

  fastify.delete(
    "/additional-services/:id",
    { preHandler: requireAuth },
    deleteAdditionalService
  );
}
