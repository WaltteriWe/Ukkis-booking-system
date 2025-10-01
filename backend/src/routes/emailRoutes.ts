import { FastifyInstance } from "fastify";
import { sendConfirmationEmail, sendSMSConfirmation } from "../controllers/emailController";

export async function emailRoutes(app: FastifyInstance) {
  app.post("/send-confirmation", async (req, reply) => {
    try {
      const data = await sendConfirmationEmail(req.body);
      return reply.send(data);
    } catch (e: any) {
      const c = e?.status ?? 500;
      if (!e?.status) app.log.error(e);
      return reply.code(c).send(e);
    }
  });

  app.post("/send-sms", async (req, reply) => {
    try {
      const data = await sendSMSConfirmation(req.body);
      return reply.send(data);
    } catch (e: any) {
      const c = e?.status ?? 500;
      if (!e?.status) app.log.error(e);
      return reply.code(c).send(e);
    }
  });
}