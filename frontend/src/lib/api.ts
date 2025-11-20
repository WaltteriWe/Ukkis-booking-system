const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface CreateBookingRequest {
  packageId: number;
  departureId?: number; // Make optional
  participants: number;
  guestEmail: string;
  guestName: string;
  phone?: string;
  notes?: string;
  participantGearSizes?: Record<
    string,
    {
      name: string;
      overalls: string;
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
  participants: number;
  total: number;
  bookingId: string;
  phone?: string;
  addons?: string;
  gearSizes?: Record<string, any>;
}

// Booking API calls
export async function createBooking(data: CreateBookingRequest) {
  const response = await fetch(`${API_BASE_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
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

export async function updateBookingStatus(id: number, status: 'confirmed' | 'pending' | 'cancelled') {
  const response = await fetch(`${API_BASE_URL}/bookings/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error('Failed to update booking status');
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
  departureTime: string;
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
export const createPackage = async (packageData: any) => {
  const baseSlug = packageData.slug || packageData.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  
  const slug = `${baseSlug}-${Date.now()}`;

  const response = await fetch(`${API_BASE_URL}/packages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: packageData.name,
      slug: slug,
      description: packageData.description,
      basePrice: Number(packageData.basePrice),
      durationMin: Number(packageData.durationMin),
      capacity: Number(packageData.capacity),
      difficulty: packageData.difficulty,
      imageUrl: packageData.imageUrl,
      isActive: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Package creation failed:", errorText);
    throw new Error(`Failed to create package: ${errorText}`);
  }

  return response.json();
};

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

// Stripe Payment Intent
export async function createPaymentIntent(paymentData: {
  amount: number;
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

// Admin authentication
export interface AdminAuthResponse {
  token?: string;
  message?: string;
}

export async function adminLogin(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Login failed' }));
    throw new Error(err.error || 'Login failed');
  }

  return response.json() as Promise<AdminAuthResponse>;
}

export async function adminRegister(name: string, email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/admin/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Registration failed' }));
    throw new Error(err.error || 'Registration failed');
  }

  return response.json() as Promise<AdminAuthResponse>;
}

// Snowmobile Rental API calls
export async function getSnowmobiles() {
  const response = await fetch(`${API_BASE_URL}/snowmobiles`);
  if (!response.ok) throw new Error('Failed to fetch snowmobiles');
  return response.json();
}

export async function getAvailableSnowmobiles(startTime: string, endTime: string) {
  const response = await fetch(
    `${API_BASE_URL}/snowmobiles/available?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`
  );
  if (!response.ok) throw new Error('Failed to fetch available snowmobiles');
  return response.json();
}

export async function createSnowmobileRental(data: {
  snowmobileId: number;
  guestEmail: string;
  guestName: string;
  phone?: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  notes?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/snowmobile-rentals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create rental');
  return response.json();
}

export async function createSnowmobile(data: {
  name: string;
  licensePlate?: string;
  model?: string;
  year?: number;
}) {
  const response = await fetch(`${API_BASE_URL}/snowmobiles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create snowmobile');
  return response.json();
}

export async function getSingleReservations() {
  const response = await fetch(`${API_BASE_URL}/reservations`);
  if (!response.ok) throw new Error('Failed to fetch single reservations');
  return response.json();
}

export async function updateRentalStatus(id: number, status: 'pending' | 'confirmed' | 'completed' | 'cancelled') {
  const response = await fetch(`${API_BASE_URL}/snowmobile-rentals/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error('Failed to update rental status');
  return response.json();
}

export async function assignSnowmobilesToDeparture(departureId: number, snowmobileIds: number[]) {
  const response = await fetch(`${API_BASE_URL}/departures/${departureId}/snowmobiles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ snowmobileIds }),
  });
  if (!response.ok) throw new Error('Failed to assign snowmobiles');
  return response.json();
}

export async function getSnowmobileAssignments(departureId: number) {
  const response = await fetch(`${API_BASE_URL}/departures/${departureId}/snowmobiles`);
  if (!response.ok) throw new Error('Failed to get assignments');
  return response.json();
}

// Contact messages (admin)
export async function getContactMessages() {
  const response = await fetch(`${API_BASE_URL}/contact`);
  if (!response.ok) throw new Error('Failed to fetch contact messages');
  return response.json();
}

export async function deleteContactMessage(id: number) {
  const response = await fetch(`${API_BASE_URL}/contact/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete contact message');
  }

  return response.json();
}

export async function sendContactReply(id: number, payload: { to?: string; subject?: string; body: string }) {
  const response = await fetch(`${API_BASE_URL}/contact/${id}/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => 'Failed to send reply');
    throw new Error(err || 'Failed to send reply');
  }

  return response.json();
}