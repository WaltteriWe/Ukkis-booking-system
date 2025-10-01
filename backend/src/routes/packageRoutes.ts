import { FastifyInstance } from "fastify";
import { listPackages, getPackageBySlug, getPackageById, createPackage, updatePackage, deletePackage } from "../controllers/packageController";

export async function packageRoutes(app: FastifyInstance) {
    // Get all packages
    app.get("/packages", async (req, reply) => {
        try { return reply.send(await listPackages(req.query)); }
        catch (e: any) { const c=e?.status ?? 500; if (!e?.status) app.log.error(e); return reply.code(c).send(e); }
    });

    // Get package by slug
    app.get("/packages/:slug", async (req, reply) => {
        try { return reply.send(await getPackageBySlug(req.params as any)); }
        catch (e: any) { const c=e?.status ?? 500; if (!e?.status) app.log.error(e); return reply.code(c).send(e); }
    });

    // Get package by ID
    app.get("/packages/id/:id", async (req, reply) => {
        try { 
            const { id } = req.params as { id: string };
            return reply.send(await getPackageById(Number(id))); 
        }
        catch (e: any) { const c=e?.status ?? 500; if (!e?.status) app.log.error(e); return reply.code(c).send(e); }
    });

    // Create new package
    app.post("/packages", async (req, reply) => {
        try { 
            const pkg = await createPackage(req.body);
            return reply.code(201).send(pkg); 
        }
        catch (e: any) { const c=e?.status ?? 500; if (!e?.status) app.log.error(e); return reply.code(c).send(e); }
    });

    // Update package
    app.put("/packages/id/:id", async (req, reply) => {
        try { 
            const { id } = req.params as { id: string };
            const pkg = await updatePackage(Number(id), req.body);
            return reply.send(pkg); 
        }
        catch (e: any) { const c=e?.status ?? 500; if (!e?.status) app.log.error(e); return reply.code(c).send(e); }
    });

    // Delete package
    app.delete("/packages/id/:id", async (req, reply) => {
        try {
            const { id } = req.params as { id: string };
            await deletePackage(Number(id));
            return reply.code(204).send();
        }
        catch (e: any) { const c=e?.status ?? 500; if (!e?.status) app.log.error(e); return reply.code(c).send(e); }
    });
}