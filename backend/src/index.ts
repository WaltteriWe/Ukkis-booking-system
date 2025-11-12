import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import path from "path";
import { API_PREFIX } from "../shared/constants";
import { packageRoutes } from "./routes/packageRoutes";
import { departureRoutes } from "./routes/departureRoutes";
import { bookingRoutes } from "./routes/bookingRoutes";
import { emailRoutes } from "./routes/emailRoutes";
import { uploadRoutes } from "./routes/uploadRoutes";
import { paymentRoutes } from "./routes/paymentRoutes";
import { adminRoutes } from "./routes/adminRoutes";
import { rentalRoutes } from "./routes/rentalRoutes";


async function main(){
  

const app = Fastify({
    logger: true,
});

await app.register(cors, {
    origin: true,
});

await app.register(packageRoutes, { prefix: API_PREFIX });
await app.register(departureRoutes, { prefix: API_PREFIX });
await app.register(bookingRoutes, { prefix: API_PREFIX });
await app.register(emailRoutes, { prefix: API_PREFIX });
await app.register(uploadRoutes, { prefix: API_PREFIX });
await app.register(paymentRoutes, { prefix: API_PREFIX });
await app.register(adminRoutes, { prefix: API_PREFIX });
await app.register(rentalRoutes, { prefix: API_PREFIX });

// Serve static files from uploads directory
await app.register(import('@fastify/static'), {
  root: path.join(__dirname, '../uploads'),
  prefix: '/uploads/',
});



  const port = Number(process.env.PORT) || 3001;
  await app.listen({ port, host: "0.0.0.0" });
  app.log.info(`Serveri käynnissä osoitteessa http://localhost:${port}`);
}

main().catch((e) => { console.error(e); process.exit(1); });