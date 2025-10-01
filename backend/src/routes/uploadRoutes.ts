import { FastifyInstance } from "fastify";
import { uploadImage, deleteImage, getImages } from "../controllers/uploadController";

export async function uploadRoutes(app: FastifyInstance) {
  // Register multipart support for file uploads
  await app.register(import('@fastify/multipart'), {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
      files: 1
    }
  });

  // Upload image
  app.post("/upload/image", async (request, reply) => {
    try {
      return await uploadImage(request, reply);
    } catch (e: any) {
      const c = e?.status ?? 500;
      if (!e?.status) app.log.error(e);
      return reply.code(c).send({ error: e?.message || 'Upload failed' });
    }
  });

  // Delete image
  app.delete("/upload/image/:filename", async (request, reply) => {
    try {
      return await deleteImage(request, reply);
    } catch (e: any) {
      const c = e?.status ?? 500;
      if (!e?.status) app.log.error(e);
      return reply.code(c).send({ error: e?.message || 'Delete failed' });
    }
  });

  // Get all images
  app.get("/upload/images", async (request, reply) => {
    try {
      return await getImages(request, reply);
    } catch (e: any) {
      const c = e?.status ?? 500;
      if (!e?.status) app.log.error(e);
      return reply.code(c).send({ error: e?.message || 'Get images failed' });
    }
  });
}