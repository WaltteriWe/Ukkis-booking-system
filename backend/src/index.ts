import "module-alias/register";
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
import { webhookRoutes } from "./routes/webhookRoutes";
import { adminRoutes } from "./routes/adminRoutes";
import { rentalRoutes } from "./routes/rentalRoutes";
import { requireAuth } from "../middleware/auth";

async function main() {
  const app = Fastify({ logger: true });

  // Enable CORS
  await app.register(cors, {
    origin: "*", // Allow all origins in development
    credentials: true,
  });

  // Register webhook routes BEFORE body parsing and auth
  await app.register(webhookRoutes, { prefix: `${API_PREFIX}/webhook` });

  // Serve static files from uploads directory (BEFORE auth hook)
  await app.register(import("@fastify/static"), {
    root: path.join(process.cwd(), "uploads"),
    prefix: "/uploads/",
  });

  const publicEndpoints = [
    { method: "GET", path: "/api/packages" }, // Get packages (public)
    { method: "GET", path: "/api/packages/slug/" }, // Get by slug (public)
    { method: "GET", path: "/api/departures" }, // Get departures (public)
    { method: "GET", path: "/api/upload/images" }, // Get images (public)
    { method: "GET", path: "/api/bookings/availability/" }, // Get availability (public)
    { method: "POST", path: "/api/bookings" }, // Create booking (customer)
    { method: "POST", path: "/api/bookings/confirm-payment" }, // Confirm payment (customer)
    { method: "POST", path: "/api/contact" }, // Create contact message (customer)
    { method: "POST", path: "/api/send-confirmation" }, // Send email (customer)
    { method: "POST", path: "/api/snowmobile-rentals" }, // Create rental (customer)
    { method: "POST", path: "/api/create-payment-intent" }, // Payment (customer)
    { method: "POST", path: "/api/webhook/stripe" }, // Stripe webhook (public)
    { method: "GET", path: "/api/snowmobiles" },
    { method: "POST", path: "/api/admin/register" },
    { method: "POST", path: "/api/admin/login" },
    { method: "GET", path: "/uploads/" }, // Static files (images) - public
  ];

  app.addHook(
    "preHandler",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const urlPath = request.url.split("?")[0];
      const method = request.method;

      // Check if this endpoint is public
      const isPublic = publicEndpoints.some((endpoint) => {
        if (endpoint.method !== method) return false;
        if (endpoint.path.includes("/")) {
          // For paths with wildcards, check if URL starts with the path
          return urlPath.startsWith(endpoint.path);
        }
        return urlPath === endpoint.path;
      });

      if (isPublic) {
        return; // Allow public endpoints
      }

      // All other endpoints require auth
      await requireAuth(request, reply);
    }
  );

  await app.register(packageRoutes, { prefix: API_PREFIX });
  await app.register(departureRoutes, { prefix: API_PREFIX });
  await app.register(bookingRoutes, { prefix: API_PREFIX });
  await app.register(emailRoutes, { prefix: API_PREFIX });
  await app.register(contactRoutes, { prefix: API_PREFIX });
  await app.register(uploadRoutes, { prefix: API_PREFIX });
  await app.register(paymentRoutes, { prefix: API_PREFIX });
  await app.register(adminRoutes, { prefix: API_PREFIX });
  await app.register(rentalRoutes, { prefix: API_PREFIX });

  const port = Number(process.env.PORT) || 3001;
  await app.listen({ port, host: "0.0.0.0" });
  app.log.info(`Server running at http://localhost:${port}`);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
