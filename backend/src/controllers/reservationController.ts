import {z} from "zod";
import { PrismaClient } from "../../generated/prisma";
import { parseISODate, toPageLimit } from "../../shared/utils";

const prisma = new PrismaClient();

const createReservationSchema = z.object({
    guestEmail: z.string().email(),
    guestName: z.string().min(1).optional(),
    phone:z.string().optional(),
    startTime: z.string().datetime(),
    participants: z.number().int().min(1),
    notes: z.string().max(500).optional(),
});

const listSchema = z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
}); 

export async function createReservation(body: unknown) {
    const parsed = createReservationSchema.safeParse(body);
    if (!parsed.success) {
        const details = parsed.error.flatten();
        throw { status: 400, message: "Invalid request data", details };
    }
    const {guestEmail, guestName, phone, startTime, participants, notes} = parsed.data;

    const guest = await prisma.guest.upsert({
        where: { email: guestEmail },
        update: {
            name: guestName ?? undefined,
            phone: phone ?? undefined,
        },
        create: {
            email: guestEmail,
            name: guestName ?? guestEmail,
            phone: phone ?? null,
        },
    });
    const reservation = await prisma.reservation.create({
        data: {
            guestId: guest.id,
            startTime: parseISODate(startTime),
            participants,
            notes: notes ?? null,
        },
        include: { guest: true },
    });
    return reservation;
}
export async function listReservations(query: unknown) {
    const parsed = listSchema.safeParse(query ?? {});
    if (!parsed.success) {
        throw { status: 400, message: "Invalid query parameters", details: parsed.error.flatten() };
    }
    const { page, limit, skip } = toPageLimit(parsed.data);
    const [items, total] = await Promise.all([
        prisma.reservation.findMany({
            include: { guest: true },
            orderBy: { startTime: "desc" },
            skip,
            take: limit,
        }),
        prisma.reservation.count(),
    ]);
    return { items, page, limit, total };
}
export async function getReservationById(idParam: string) {
    const id = Number(idParam);
    if (Number.isNaN(id)) throw { status: 400, message: "Invalid reservation ID" };

    const resv = await prisma.reservation.findUnique({
        where: { id },
        include: { guest: true },
    });
    if (!resv) throw { status: 404, message: "Reservation not found" };
    return resv;
}