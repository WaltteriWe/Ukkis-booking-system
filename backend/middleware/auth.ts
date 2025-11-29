import { FastifyRequest, FastifyReply } from "fastify";

const jwt = require("jsonwebtoken");

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply.status(401).send({ error: "No token provided" });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    // Attach user info to request
    (request as any).user = decoded;
  } catch (error) {
    return reply.status(401).send({ error: "Invalid or expired token" });
  }
}
