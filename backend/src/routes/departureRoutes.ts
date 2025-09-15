import {FastifyInstance} from "fastify";
import {listDepartures} from "../controllers/departureController";

export async function departureRoutes(app: FastifyInstance) {
    app.get("/departures", async (req, reply) => {
        try { return reply.send(await listDepartures(req.query)); }
        catch (e: any) { const c=e?.status ?? 500; if (!e?.status) app.log.error(e); return reply.code(c).send(e); }
    });
}
