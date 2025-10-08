import { FastifyInstance } from "fastify";
import { sendConfirmationEmail } from "../controllers/emailController";

export async function emailRoutes(app: FastifyInstance) {
  app.post("/send-confirmation", async (req, reply) => {
    try {
      app.log.info('Received email confirmation request');
      const data = await sendConfirmationEmail(req.body);
      return reply.send(data);
    } catch (e: any) {
      const c = e?.status ?? 500;
      app.log.error('Email sending error:', e);
      
      // Return a proper error response instead of the raw error object
      const errorMessage = e?.message || 'Internal Server Error';
      return reply.code(c).send({ 
        error: errorMessage,
        success: false 
      });
    }
  });


}