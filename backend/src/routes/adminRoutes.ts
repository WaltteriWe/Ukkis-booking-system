import { FastifyInstance  } from "fastify";
import { loginAdmin } from "../controllers/adminController";


export async function adminRoutes(app: FastifyInstance) {
  app.post("/admin/login", async (req, reply) => {
    try {
      const data = await loginAdmin(req.body);
      return reply.send(data);
    } catch (e: any) {
      const c = e?.status ?? 500;
      if (!e?.status) app.log.error(e);
      return reply.code(c).send(e);
    }
  });
}

  