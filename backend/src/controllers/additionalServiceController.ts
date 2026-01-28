import { FastifyRequest, FastifyReply } from "fastify";
import { PrismaClient } from "../../generated/prisma/index";

const prisma = new PrismaClient();

// Get all additional services (public + admin)
export async function getAdditionalServices(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    console.log("🔍 GET /additional-services called");
    const services = await prisma.additionalService.findMany({
      where: { active: true },
      orderBy: { displayOrder: "asc" },
    });
    console.log("✅ Found services:", services);
    return services;
  } catch (error) {
    console.error("Error fetching additional services:", error);
    reply.status(500).send({ error: "Failed to fetch additional services" });
  }
}

// Get all services (admin only, including inactive)
export async function getAllAdditionalServices(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const services = await prisma.additionalService.findMany({
      orderBy: { displayOrder: "asc" },
    });
    return services;
  } catch (error) {
    console.error("Error fetching all additional services:", error);
    reply.status(500).send({ error: "Failed to fetch additional services" });
  }
}

// Create additional service (admin only)
export async function createAdditionalService(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { name, description, price, displayOrder } = request.body as {
      name: string;
      description?: string;
      price: number;
      displayOrder?: number;
    };

    const service = await prisma.additionalService.create({
      data: {
        name,
        description: description || null,
        price,
        displayOrder: displayOrder || 0,
        active: true,
      },
    });

    return service;
  } catch (error) {
    console.error("Error creating additional service:", error);
    reply.status(500).send({ error: "Failed to create additional service" });
  }
}

// Update additional service (admin only)
export async function updateAdditionalService(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { id } = request.params as { id: string };
    const { name, description, price, active, displayOrder } = request.body as {
      name?: string;
      description?: string;
      price?: number;
      active?: boolean;
      displayOrder?: number;
    };

    const service = await prisma.additionalService.update({
      where: { id: parseInt(id) },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(active !== undefined && { active }),
        ...(displayOrder !== undefined && { displayOrder }),
      },
    });

    return service;
  } catch (error) {
    console.error("Error updating additional service:", error);
    reply.status(500).send({ error: "Failed to update additional service" });
  }
}

// Delete additional service (admin only)
export async function deleteAdditionalService(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { id } = request.params as { id: string };

    await prisma.additionalService.delete({
      where: { id: parseInt(id) },
    });

    return { success: true, message: "Additional service deleted" };
  } catch (error) {
    console.error("Error deleting additional service:", error);
    reply.status(500).send({ error: "Failed to delete additional service" });
  }
}
