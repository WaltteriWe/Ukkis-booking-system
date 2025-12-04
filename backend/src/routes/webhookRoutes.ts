import { FastifyInstance } from "fastify";
import { handleStripeWebhook } from "../controllers/webhookController";

export async function webhookRoutes(app: FastifyInstance) {
  // Stripe webhook - must receive raw body
  app.post(
    "/stripe",
    {
      config: {
        rawBody: true, // This tells Fastify to preserve the raw body
      },
    },
    async (req, reply) => {
      try {
        const signature = req.headers["stripe-signature"];
        if (!signature || typeof signature !== "string") {
          return reply.code(400).send({ error: "No signature provided" });
        }

        const rawBody =
          (req as any).rawBody || Buffer.from(JSON.stringify(req.body));
        const result = await handleStripeWebhook(rawBody, signature);
        return reply.send(result);
      } catch (e: any) {
        const c = e?.status ?? 500;
        if (!e?.status) app.log.error(e);
        return reply.code(c).send(e);
      }
    }
  );
}
