import { FastifyInstance } from "fastify";
import { listPackages, getPackageBySlug } from "../controllers/packageController";

export async function packageRoutes(app: FastifyInstance) {
    app.get("/packages", async (req, reply) => {
        try { return reply.send(await listPackages(req.query)); }
        catch (e: any) { const c=e?.status ?? 500; if (!e?.status) app.log.error(e); return reply.code(c).send(e); }
    });

    app.get("/packages/:slug", async (req, reply) => {
        try { return reply.send(await getPackageBySlug(req.params as any)); }
        catch (e: any) { const c=e?.status ?? 500; if (!e?.status) app.log.error(e); return reply.code(c).send(e); }
    });
}