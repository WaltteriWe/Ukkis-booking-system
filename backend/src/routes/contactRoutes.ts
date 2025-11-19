import { FastifyInstance } from "fastify";
import { handleContact, listContactMessages, deleteContactMessage } from "../controllers/contactController";

export async function contactRoutes(app: FastifyInstance) {
  app.post("/contact", async (req, reply) => {
    try {
      app.log.info("Contact form received");
      const res = await handleContact(req.body);
      return reply.code(201).send(res);
    } catch (err: any) {
      app.log.error("Contact error:", err);
      return reply.code(400).send({ success: false, error: err?.message || "Invalid request" });
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
      if (Number.isNaN(id)) return reply.code(400).send({ error: "Invalid id" });
      const deleted = await deleteContactMessage(id);
      return reply.send(deleted);
    } catch (err: any) {
      app.log.error("Failed to delete contact message:", err);
      return reply.code(500).send({ error: "Failed to delete message" });
    }
  });
}