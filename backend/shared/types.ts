// Shared types between frontend and backend

export interface CreateBookingDTO {
  packageId: number;
  departureId: number;
  participants: number;
  guestEmail: string;
  guestName: string;
  phone?: string;
  notes?: string;
}

export interface ListDeparturesQuery {
  packageId?: number;
  from?: string;
  to?: string;
  onlyAvailable?: boolean;
}