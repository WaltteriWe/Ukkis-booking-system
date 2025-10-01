import { FastifyInstance } from "fastify";
import { createPaymentIntent } from "../controllers/paymentController";

export async function paymentRoutes(app: FastifyInstance) {
	app.post("/create-payment-intent", async (req, reply) => {
		try {
			const data = await createPaymentIntent(req.body);
			return reply.send(data);
		} catch (e: any) {
			const c = e?.status ?? 500;
			if (!e?.status) app.log.error(e);
			return reply.code(c).send(e);
		}
	});
}
