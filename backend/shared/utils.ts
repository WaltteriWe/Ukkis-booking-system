
export function parseISO(iso: string): Date {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) 
        throw new Error("Invalid date format");
    return d; 
}

