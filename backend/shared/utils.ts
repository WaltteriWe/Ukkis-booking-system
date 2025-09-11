import { PAGINATION } from "./constants";

export function parseISODate(iso: string): Date {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) 
        throw new Error("Invalid date format");
    return d; 
}

export function toPageLimit(input?: { page?: number; limit?: number }) {
    const page = !input?.page || input.page < 1 ? PAGINATION.DEFAULT_PAGE : Math.floor(input.page);
    let limit = !input?.limit || input.limit < 1 ? PAGINATION.DEFAULT_LIMIT : Math.floor(input.limit);
    if (limit > PAGINATION.MAX_LIMIT) limit = PAGINATION.MAX_LIMIT;
    
    const skip = (page - 1) * limit;
    return { page, limit, skip };
}