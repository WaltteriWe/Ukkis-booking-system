import { FastifyInstance } from "fastify";
import {
  handleContact,
  listContactMessages,
  deleteContactMessage,
  sendContactReply,
} from "../controllers/contactController";

export async function contactRoutes(app: FastifyInstance) {
  app.post("/contact", async (req, reply) => {
    try {
      app.log.info("Contact form received");
      const res = await handleContact(req.body);
      return reply.code(201).send(res);
    } catch (err: any) {
      app.log.error({ err }, "Contact error");
      app.log.error(
        { message: err?.message, issues: err?.issues },
        "Error details"
      );
      return reply
        .code(400)
        .send({ success: false, error: err?.message || "Invalid request" });
    }
  });

  // Admin: list all contact messages
  app.get("/contact", async (req, reply) => {
    try {
      const messages = await listContactMessages();
      return reply.send(messages);
    } catch (err: any) {
      app.log.error("Failed to list contact messages:", err);
      return reply.code(500).send({ error: "Failed to list messages" });
    }
  });

  // Admin: delete a message by id
  app.delete("/contact/:id", async (req, reply) => {
    try {
      const id = Number((req.params as any).id);
      if (Number.isNaN(id))
        return reply.code(400).send({ error: "Invalid id" });
      const deleted = await deleteContactMessage(id);
      return reply.send(deleted);
    } catch (err: any) {
      app.log.error("Failed to delete contact message:", err);
      return reply.code(500).send({ error: "Failed to delete message" });
    }
  });

  // Admin: send a reply to a contact message
  app.post("/contact/:id/reply", async (req, reply) => {
    try {
      const id = Number((req.params as any).id);
      if (Number.isNaN(id))
        return reply.code(400).send({ error: "Invalid id" });
      const { to, subject, body } = req.body as any;
      const res = await sendContactReply(id, { to, subject, body });
      return reply.send(res);
    } catch (err: any) {
      app.log.error("Failed to send contact reply:", err);
      return reply.code(500).send({ error: "Failed to send reply" });
    }
  });
}
