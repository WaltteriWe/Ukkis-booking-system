import {FastifyInstance} from "fastify";
import {
    createReservation,
    getReservationById,
    listReservations,
} from "../controllers/reservationController";

export async function reservationRouter(app: FastifyInstance) {
    app.post("/reservations", async (req, reply) => {
        try {
            const data = await createReservation(req.body);
            return reply.code(201).send(data);
        } catch (e: any) {
            const code = e?.status ?? 500;
            if (!e?.status) app.log.error(e);
            return reply.code(code).send(e);
        }
    });
    app.get("/reservations", async (req, reply) => {
        try {
            const data = await listReservations(req.query);
            return reply.send(data);
        } catch (e: any) {
            const code = e?.status ?? 500;
            if (!e?.status) app.log.error(e);
            return reply.code(code).send(e);
        }
    });
    app.get("/reservations/:id", async (req, reply) => {
        try {
            const data = await getReservationById((req.params as any).id);
            return reply.send(data);
        } catch (e: any) {
            const code = e?.status ?? 500;
            if (!e?.status) app.log.error(e);
            return reply.code(code).send(e);
        }
    });
}