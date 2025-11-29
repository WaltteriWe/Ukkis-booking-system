import "dotenv/config";
import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import path from "path";
import { API_PREFIX } from "../shared/constants";
import { packageRoutes } from "./routes/packageRoutes";
import { departureRoutes } from "./routes/departureRoutes";
import { bookingRoutes } from "./routes/bookingRoutes";
import { emailRoutes } from "./routes/emailRoutes";
import { contactRoutes } from "./routes/contactRoutes";
import { uploadRoutes } from "./routes/uploadRoutes";
import { paymentRoutes } from "./routes/paymentRoutes";
import { adminRoutes } from "./routes/adminRoutes";
import { rentalRoutes } from "./routes/rentalRoutes";
import { requireAuth } from "../middleware/auth";

async function main() {
  const app = Fastify({ logger: true });

  const protectedRoutes = [
    "/api/bookings",
    "/api/snowmobiles",
    "/api/departures",
    "/api/contact", // Admin viewing messages
    "/api/upload",
    "/api/snowmobile-rentals",
    "/api/reservations",
  ];

  app.addHook(
    "preHandler",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const path = request.url.split("?")[0];

      const needsAuth = protectedRoutes.some((route) => path.startsWith(route));

      if (!needsAuth) {
        return;
      }

      // special case for GET /api/packages?activeOnly=true being public
      if (path === "/api/packages" && request.method === "GET") {
        const params = new URL(request.url, `http://${request.headers.host}`)
          .searchParams;
        if (params.get("activeOnly") === "true") {
          return;
        }
      }

      await requireAuth(request, reply);
    }
  );

  // Enable CORS
  await app.register(cors, {
    origin: "*", // Allow all origins in development
    credentials: true,
  });

  await app.register(packageRoutes, { prefix: API_PREFIX });
  await app.register(departureRoutes, { prefix: API_PREFIX });
  await app.register(bookingRoutes, { prefix: API_PREFIX });
  await app.register(emailRoutes, { prefix: API_PREFIX });
  await app.register(contactRoutes, { prefix: API_PREFIX });
  await app.register(uploadRoutes, { prefix: API_PREFIX });
  await app.register(paymentRoutes, { prefix: API_PREFIX });
  await app.register(adminRoutes, { prefix: API_PREFIX });
  await app.register(rentalRoutes, { prefix: API_PREFIX });

  // Serve static files from uploads directory
  await app.register(import("@fastify/static"), {
    root: path.join(__dirname, "../uploads"),
    prefix: "/uploads/",
  });

  const port = Number(process.env.PORT) || 3001;
  await app.listen({ port, host: "0.0.0.0" });
  app.log.info(`Server running at http://localhost:${port}`);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
