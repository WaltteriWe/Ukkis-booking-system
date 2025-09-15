import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { API_PREFIX } from "../shared/constants";
import { packageRoutes } from "./routes/packageRoutes";
import { departureRoutes } from "./routes/departureRoutes";
import { bookingRoutes } from "./routes/bookingRoutes";


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



  const port = Number(process.env.PORT) || 3001;
  await app.listen({ port, host: "0.0.0.0" });
  app.log.info(`Serveri käynnissä osoitteessa http://localhost:${port}`);
}

main().catch((e) => { console.error(e); process.exit(1); });