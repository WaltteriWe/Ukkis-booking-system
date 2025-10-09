const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface CreateBookingRequest {
  packageId: number;
  departureId: number;
  participants: number;
  guestEmail: string;
  guestName: string;
  phone?: string;
  notes?: string;
  participantGearSizes?: Record<
    string,
    {
      name: string;
      jacket: string;
      pants: string;
      boots: string;
      gloves: string;
      helmet: string;
    }
  >;
}

export interface EmailConfirmationRequest {
  email: string;
  name: string;
  tour: string;
  date: string;
  time: string;
  total: number;
  bookingId: string;
  participantGearSizes?: Record<
    string,
    {
      name: string;
      jacket: string;
      pants: string;
      boots: string;
      gloves: string;
      helmet: string;
    }
  >;
}



// Booking API calls
export async function createBooking(bookingData: CreateBookingRequest) {
  const response = await fetch(`${API_BASE_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bookingData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to create booking' }));
    throw new Error(error.error || 'Failed to create booking');
  }

  return response.json();
}

export async function getBookings() {
  const response = await fetch(`${API_BASE_URL}/bookings`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch bookings');
  }
  
  return response.json();
}

export async function getBookingById(id: number) {
  const response = await fetch(`${API_BASE_URL}/bookings/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch booking');
  }
  
  return response.json();
}

// Package API calls
export async function getPackages(activeOnly = true) {
  const queryParam = activeOnly ? '?activeOnly=true' : '';
  const response = await fetch(`${API_BASE_URL}/packages${queryParam}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch packages');
  }
  
  return response.json();
}

export async function getPackageById(id: number) {
  const response = await fetch(`${API_BASE_URL}/packages/id/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch package');
  }
  
  return response.json();
}

export async function getPackageBySlug(slug: string) {
  const response = await fetch(`${API_BASE_URL}/packages/${slug}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch package');
  }
  
  return response.json();
}

// Departure API calls
export async function getDepartures(params?: {
  packageId?: number;
  from?: string;
  to?: string;
  onlyAvailable?: boolean;
}) {
  const searchParams = new URLSearchParams();
  
  if (params?.packageId) {
    searchParams.append('packageId', params.packageId.toString());
  }
  if (params?.from) {
    searchParams.append('from', params.from);
  }
  if (params?.to) {
    searchParams.append('to', params.to);
  }
  if (params?.onlyAvailable) {
    searchParams.append('onlyAvailable', 'true');
  }

  const queryString = searchParams.toString();
  const url = `${API_BASE_URL}/departures${queryString ? '?' + queryString : ''}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch departures');
  }
  
  return response.json();
}

export async function createDeparture(departureData: {
  packageId: number;
  departureTime: string; // ISO string
  capacity?: number;
}) {
  const response = await fetch(`${API_BASE_URL}/departures`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(departureData),
  });

  if (!response.ok) {
    throw new Error('Failed to create departure');
  }

  return response.json();
}

// Email API calls
export async function sendConfirmationEmail(emailData: EmailConfirmationRequest) {
  const response = await fetch(`${API_BASE_URL}/send-confirmation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to send confirmation email' }));
    throw new Error(error.error || 'Failed to send confirmation email');
  }

  return response.json();
}



// Package management API calls
export async function createPackage(packageData: {
  slug: string;
  name: string;
  description?: string;
  basePrice: number;
  durationMin: number;
  capacity?: number;
  difficulty?: "Easy" | "Moderate" | "Advanced";
  imageUrl?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/packages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(packageData),
  });

  if (!response.ok) {
    throw new Error('Failed to create package');
  }

  return response.json();
}

export async function updatePackage(id: number, packageData: Partial<{
  slug: string;
  name: string;
  description: string;
  basePrice: number;
  durationMin: number;
  capacity: number;
  difficulty: "Easy" | "Moderate" | "Advanced";
  imageUrl: string;
  active: boolean;
}>) {
  const response = await fetch(`${API_BASE_URL}/packages/id/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(packageData),
  });

  if (!response.ok) {
    throw new Error('Failed to update package');
  }

  return response.json();
}

export async function deletePackage(id: number) {
  const response = await fetch(`${API_BASE_URL}/packages/id/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    if (response.status === 404) throw new Error('Package not found');
    if (response.status === 409) throw new Error('Cannot delete: package has related data');
    throw new Error('Failed to delete package');
  }

  // No content expected (204)
  return true;
}

// Image upload API calls
export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload/image`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to upload image' }));
    throw new Error(error.error || 'Failed to upload image');
  }

  return response.json();
}

export async function deleteImage(filename: string) {
  const response = await fetch(`${API_BASE_URL}/upload/image/${filename}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete image');
  }

  return response.json();
}

export async function getImages() {
  const response = await fetch(`${API_BASE_URL}/upload/images`);
  
  if (!response.ok) {
    throw new Error('Failed to get images');
  }
  
  return response.json();
}

// Stripe Payment Intent (jos halutaan käyttää oikeaa Stripe integraatiota)
export async function createPaymentIntent(paymentData: {
  amount: number; // centtiä
  currency: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  booking: {
    tour: string;
    date: string;
    time: string;
    participants: number;
  };
}) {
  const response = await fetch(`${API_BASE_URL}/create-payment-intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentData),
  });

  if (!response.ok) {
    throw new Error('Failed to create payment intent');
  }

  return response.json();
}