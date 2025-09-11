// Shared types between frontend and backend

export interface CreateReservationDTO {
  guestEmail: string;
  guestName?: string;
  phone?: string;
  startDate: string; // ISO date string
  participants: number;
  notes?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}