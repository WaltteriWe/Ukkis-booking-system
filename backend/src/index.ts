import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import {reservationRouter} from "./routes/reservationRouter";
import { API_PREFIX } from "../shared/constants";

async function main():Promise<void> {
  

const app = Fastify({
    logger: true,
});

await app.register(cors, {
    origin: true,
});

app.get("/health", async () => ({ok: true}));

await app.register(reservationRouter, { prefix: API_PREFIX });

const port = 3001;
  try {
    await app.listen({ port, host: "0.0.0.0" });
    app.log.info(`Server listening at http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error during startup:", err);
  process.exit(1);
});