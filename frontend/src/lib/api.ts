import { get } from "http";


const API_BASE_URL = "/api";

export interface CreateBookingRequest {
  packageId: number;
  departureId: number;
  participants: number;
  totalPrice?: number; // Total price including add-ons
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
  snowmobileAssignments?: Array<{
    snowmobileId: number;
    passengerCount: number;
  }>;
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
  gearSizes?: Record<
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

function getAuthHeaders() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// Image upload API calls
export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

  const response = await fetch(`${API_BASE_URL}/upload/image`, {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }), // ✅ Only auth header, no Content-Type
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Failed to upload image" }));
    throw new Error(error.error || "Failed to upload image");
  }

  return response.json();
}

export async function deleteImage(filename: string) {
  const response = await fetch(`${API_BASE_URL}/upload/image/${filename}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to delete image");
  }

  return response.json();
}

export async function getImages() {
  const response = await fetch(`${API_BASE_URL}/upload/images`);

  if (!response.ok) {
    throw new Error("Failed to get images");
  }

  return response.json();
}

// Booking API calls
export async function createBooking(data: CreateBookingRequest) {
  const response = await fetch(`${API_BASE_URL}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Failed to create booking" }));
    throw new Error(error.error || "Failed to create booking");
  }

  return response.json();
}

export async function getBookings() {
  const response = await fetch(`${API_BASE_URL}/bookings`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch bookings");
  }

  return response.json();
}

export async function updateBookingStatus(
  id: number,
  status: "confirmed" | "pending" | "cancelled"
) {
  const response = await fetch(`${API_BASE_URL}/bookings/${id}/status`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error("Failed to update booking status");
  }

  return response.json();
}

// Approve booking
export async function approveBooking(id: number, adminMessage?: string) {
  const response = await fetch(`${API_BASE_URL}/bookings/${id}/approve`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ adminMessage }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Failed to approve booking" }));
    throw new Error(error.error || "Failed to approve booking");
  }

  return response.json();
}

// Reject booking
export async function rejectBooking(id: number, rejectionReason: string) {
  const response = await fetch(`${API_BASE_URL}/bookings/${id}/reject`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ rejectionReason }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Failed to reject booking" }));
    throw new Error(error.error || "Failed to reject booking");
  }

  return response.json();
}

// Package API calls
export async function getPackages(activeOnly = true) {
  const queryParam = activeOnly ? "?activeOnly=true" : "";
  const response = await fetch(`${API_BASE_URL}/packages${queryParam}`);

  if (!response.ok) {
    throw new Error("Failed to fetch packages");
  }

  return response.json();
}

export async function getPackageById(id: number) {
  const response = await fetch(`${API_BASE_URL}/packages/id/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch package");
  }

  return response.json();
}

export async function getPackageBySlug(slug: string) {
  const response = await fetch(`${API_BASE_URL}/packages/${slug}`);

  if (!response.ok) {
    throw new Error("Failed to fetch package");
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
    searchParams.append("packageId", params.packageId.toString());
  }
  if (params?.from) {
    searchParams.append("from", params.from);
  }
  if (params?.to) {
    searchParams.append("to", params.to);
  }
  if (params?.onlyAvailable) {
    searchParams.append("onlyAvailable", "true");
  }

  const queryString = searchParams.toString();
  const url = `${API_BASE_URL}/departures${queryString ? "?" + queryString : ""}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch departures");
  }

  return response.json();
}

export async function getDepartureSnowmobiles(departureId: number) {
  const response = await fetch(
    `${API_BASE_URL}/departures/${departureId}/available-snowmobiles`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch departure snowmobiles");
  }

  return response.json();
}

export async function createDeparture(data: {
  packageId: number;
  departureTime: string;
  capacity: number;
}) {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    throw new Error("Unauthorized: No admin token found");
  }

  const response = await fetch(`${API_BASE_URL}/departures`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create departure");
  }

  return response.json();
}

// Email API calls
export async function sendConfirmationEmail(
  emailData: EmailConfirmationRequest
) {
  const response = await fetch(`${API_BASE_URL}/send-confirmation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }, // ✅ No auth
    body: JSON.stringify(emailData),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Failed to send confirmation email" }));
    throw new Error(error.error || "Failed to send confirmation email");
  }

  return response.json();
}

// Package management API calls
export const createPackage = async (packageData: {
  name: string;
  slug?: string;
  description?: string;
  basePrice: number;
  durationMin: number;
  difficulty: "Easy" | "Moderate" | "Advanced";
  imageUrl?: string;
}) => {
  const baseSlug =
    packageData.slug ||
    packageData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const slug = `${baseSlug}-${Date.now()}`;

  const response = await fetch(`${API_BASE_URL}/packages`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      name: packageData.name,
      slug: slug,
      description: packageData.description,
      basePrice: Number(packageData.basePrice),
      durationMin: Number(packageData.durationMin),
      difficulty: packageData.difficulty,
      imageUrl: packageData.imageUrl,
      isActive: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create package: ${errorText}`);
  }

  return response.json();
};

export async function updatePackage(
  id: number,
  packageData: Partial<{
    slug: string;
    name: string;
    description: string;
    basePrice: number;
    durationMin: number;
    difficulty: "Easy" | "Moderate" | "Advanced";
    imageUrl: string;
    active: boolean;
  }>
) {
  const response = await fetch(`${API_BASE_URL}/packages/id/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(packageData),
  });

  if (!response.ok) {
    throw new Error("Failed to update package");
  }

  return response.json();
}

export async function deletePackage(id: number) {
  const response = await fetch(`${API_BASE_URL}/packages/id/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 404) throw new Error("Package not found");
    if (response.status === 409)
      throw new Error("Cannot delete: package has related data");
    throw new Error("Failed to delete package");
  }

  return true;
}

// Admin authentication
export interface AdminAuthResponse {
  token?: string;
  message?: string;
}

export async function adminLogin(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Login failed" }));
    throw new Error(err.error || "Login failed");
  }

  return response.json() as Promise<AdminAuthResponse>;
}

// Snowmobile Rental API calls
export async function getSnowmobiles() {
  const response = await fetch(`${API_BASE_URL}/snowmobiles`);
  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`Failed to fetch snowmobiles (${response.status}): ${errorText}`);
  }
  return response.json();
}

// Get all snowmobiles for admin (including disabled and maintenance info)
export async function getSnowmobilesForAdmin() {
  const response = await fetch(`${API_BASE_URL}/snowmobiles/admin/all`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`Failed to fetch snowmobiles (${response.status}): ${errorText}`);
  }
  return response.json();
}

export async function getAvailableSnowmobiles(
  startTime: string,
  endTime: string
) {
  const response = await fetch(
    `${API_BASE_URL}/snowmobiles/available?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`
  );
  if (!response.ok) throw new Error("Failed to fetch available snowmobiles");
  return response.json();
}

export async function createSnowmobileRental(data: {
  snowmobiles?: Array<{ snowmobileId: number; quantity: number }>;
  snowmobileId?: number;
  guestEmail: string;
  guestName: string;
  phone?: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  notes?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/snowmobile-rentals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }, // ✅ No auth
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create rental");
  return response.json();
}

export async function createSnowmobile(data: {
  name: string;
  licensePlate?: string;
  model?: string;
  year?: number;
}) {
  const response = await fetch(`${API_BASE_URL}/snowmobiles`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create snowmobile");
  return response.json();
}

export async function getSingleReservations() {
  const response = await fetch(`${API_BASE_URL}/reservations`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch single reservations");
  return response.json();
}

export async function updateRentalStatus(
  id: number,
  status: "pending" | "confirmed" | "completed" | "cancelled"
) {
  const response = await fetch(
    `${API_BASE_URL}/snowmobile-rentals/${id}/status`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    }
  );
  if (!response.ok) throw new Error("Failed to update rental status");
  return response.json();
}

export async function approveSnowmobileRental(
  id: number,
  adminMessage?: string
) {
  const response = await fetch(
    `${API_BASE_URL}/snowmobile-rentals/${id}/approve`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ adminMessage: adminMessage || null }),
    }
  );
  if (!response.ok) throw new Error("Failed to approve rental");
  return response.json();
}

export async function rejectSnowmobileRental(
  id: number,
  rejectionReason: string
) {
  const response = await fetch(
    `${API_BASE_URL}/snowmobile-rentals/${id}/reject`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ rejectionReason }),
    }
  );
  if (!response.ok) throw new Error("Failed to reject rental");
  return response.json();
}

export async function assignSnowmobilesToDeparture(
  departureId: number,
  snowmobileIds: number[]
) {
  const response = await fetch(
    `${API_BASE_URL}/departures/${departureId}/snowmobiles`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ snowmobileIds }),
    }
  );
  if (!response.ok) throw new Error("Failed to assign snowmobiles");
  return response.json();
}

export async function getSnowmobileAssignments(departureId: number) {
  const response = await fetch(
    `${API_BASE_URL}/departures/${departureId}/snowmobiles`
  );
  if (!response.ok) throw new Error("Failed to get assignments");
  return response.json();
}

export async function getAllDepartureAssignments() {
  const response = await fetch(
    `${API_BASE_URL}/departures/assignments/all`,
    {
      headers: getAuthHeaders(),
    }
  );
  if (!response.ok) throw new Error("Failed to get all assignments");
  return response.json();
}

export async function getSnowmobileRentalStatus(departureId?: number) {
  const url = departureId
    ? `${API_BASE_URL}/snowmobiles/rental-status?departureId=${departureId}`
    : `${API_BASE_URL}/snowmobiles/rental-status`;
  
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to get rental status");
  return response.json();
}

// Contact messages (admin)
export async function getContactMessages() {
  const response = await fetch(`${API_BASE_URL}/contact`, {
    headers: getAuthHeaders(), // ✅ Keep auth — admin only
  });
  if (!response.ok) throw new Error("Failed to fetch contact messages");
  return response.json();
}

export async function deleteContactMessage(id: number) {
  const response = await fetch(`${API_BASE_URL}/contact/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to delete contact message");
  }

  return response.json();
}

export async function sendContactReply(
  id: number,
  payload: { to?: string; subject?: string; body: string }
) {
  const response = await fetch(`${API_BASE_URL}/contact/${id}/reply`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => "Failed to send reply");
    throw new Error(err || "Failed to send reply");
  }

  return response.json();
}

export async function deleteDeparture(departureId: number) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

  const response = await fetch(`${API_BASE_URL}/departures/${departureId}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new Error("Failed to delete departure");
  }

  return response.json();
}

export async function updateDeparture(
  departureId: number,
  data: {
    packageId: number;
    departureTime: string;
    capacity: number;
  }
) {
  const response = await fetch(`${API_BASE_URL}/departures/${departureId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update departure");
  }

  return response.json();
}

// Additional Services API calls
export async function getAdditionalServices() {
  const response = await fetch(`${API_BASE_URL}/additional-services`);
  if (!response.ok) throw new Error("Failed to fetch additional services");
  return response.json();
}

export async function getAllAdditionalServices() {
  const response = await fetch(`${API_BASE_URL}/additional-services/all`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch all additional services");
  return response.json();
}

export async function createAdditionalService(data: {
  name: string;
  description?: string;
  price: number;
  displayOrder?: number;
}) {
  const response = await fetch(`${API_BASE_URL}/additional-services`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create additional service");
  return response.json();
}

export async function updateAdditionalService(
  id: number,
  data: Partial<{
    name: string;
    description: string;
    price: number;
    active: boolean;
    displayOrder: number;
  }>
) {
  const response = await fetch(`${API_BASE_URL}/additional-services/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update additional service");
  return response.json();
}

export async function deleteAdditionalService(id: number) {
  const response = await fetch(`${API_BASE_URL}/additional-services/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to delete additional service");
  return response.json();
}

// Operating Hours API calls
export async function getOperatingHours(date?: string) {
  const url = date 
    ? `${API_BASE_URL}/operating-hours?date=${date}`
    : `${API_BASE_URL}/operating-hours`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch operating hours");
  return response.json();
}

export async function getAllOperatingHours() {
  const response = await fetch(`${API_BASE_URL}/operating-hours/all`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch all operating hours");
  return response.json();
}

export async function getOperatingHoursRange(startDate: string, endDate: string) {
  const response = await fetch(
    `${API_BASE_URL}/operating-hours/range?startDate=${startDate}&endDate=${endDate}`
  );
  if (!response.ok) throw new Error("Failed to fetch operating hours range");
  return response.json();
}

export async function setDefaultOperatingHours(data: {
  openingTime: string;
  closingTime: string;
  isClosed?: boolean;
  notes?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/operating-hours/default`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to set default operating hours");
  return response.json();
}

export async function setDateOperatingHours(data: {
  date: string;
  openingTime: string;
  closingTime: string;
  isClosed?: boolean;
  notes?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/operating-hours/date`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to set date-specific operating hours");
  return response.json();
}

export async function deleteDateOperatingHours(date: string) {
  const response = await fetch(
    `${API_BASE_URL}/operating-hours/date?date=${date}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );
  if (!response.ok) throw new Error("Failed to delete date-specific operating hours");
  return response.json();
}
