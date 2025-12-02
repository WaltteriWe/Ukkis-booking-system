"use client";

import { useState, useEffect } from "react";
import {
  getPackages,
  createPackage,
  updatePackage,
  uploadImage,
  deletePackage as apiDeletePackage,
  getBookings,
  updateBookingStatus,
  adminLogin,
  adminRegister,
  getSingleReservations,
  updateRentalStatus, // Changed from updateSingleReservationStatus
  getSnowmobiles,
  getDepartures,
  getContactMessages,
  deleteContactMessage,
  getSnowmobileAssignments,
  assignSnowmobilesToDeparture,
  createSnowmobile,
  sendContactReply,
  createDeparture,
} from "@/lib/api";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/dist/style.css";

interface Tour {
  id: number;
  slug: string;
  name: string;
  description?: string;
  basePrice: number;
  durationMin: number;
  capacity?: number;
  difficulty: "Easy" | "Moderate" | "Advanced";
  imageUrl?: string;
  active: boolean;
}

interface Booking {
  id: number;
  guestId: number;
  departureId: number;
  participants: number;
  totalPrice: number | string; // Can be Decimal from Prisma
  status: string;
  notes?: string;
  createdAt: string;
  guest: {
    id: number;
    email: string;
    name: string;
    phone?: string;
  };
  departure: {
    id: number;
    departureTime: string;
    capacity: number;
    reserved: number;
    package: {
      id: number;
      name: string;
      slug: string;
    };
  };
  participantGear?: {
    id: number;
    name: string;
    overalls: string;
    boots: string;
    gloves: string;
    helmet: string;
  }[];
}

interface singleReservations {
  id: number;
  guestId: number;
  departureId: number;
  participants: number;
  totalPrice: number | string; // Can be Decimal from Prisma
  status: string;
  notes?: string;
  createdAt: string;
  guest: {
    id: number;
    email: string;
    name: string;
    phone?: string;
  };
  departure: {
    id: number;
    departureTime: string;
    reserved: number;
    package: {
      id: number;
      name: string;
      slug: string;
    };
  };
  participantGear?: {
    id: number;
    name: string;
    overalls: string;
    boots: string;
    gloves: string;
    helmet: string;
  }[];
}

// Note: image listing is not used on this page currently

export default function AdminPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [singleReservations, setSingleReservations] = useState<
    singleReservations[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<
    | "packages"
    | "bookings"
    | "participants"
    | "singleReservations"
    | "snowmobiles"
    | "messages"
  >("packages");

  // Form state
  const [formData, setFormData] = useState({
    slug: "",
    name: "",
    description: "",
    basePrice: "",
    durationMin: "",
    capacity: "",
    difficulty: "Easy" as "Easy" | "Moderate" | "Advanced",
    imageUrl: "",
    active: true,
  });

  // Auth form state (client-side)
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");

  // Snowmobile management state
  const [snowmobileAction, setSnowmobileAction] = useState<"" | "add" | "edit" | "view">("");
  const [selectedDeparture, setSelectedDeparture] = useState<number | null>(null);
  const [snowmobiles, setSnowmobiles] = useState<any[]>([]);
  const [departures, setDepartures] = useState<any[]>([]);
  const [contactMessages, setContactMessages] = useState<any[]>([]);
  // Reply state for contact messages
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyToEmail, setReplyToEmail] = useState<string>("");
  const [replyBody, setReplyBody] = useState<string>("");
  const [sendingReply, setSendingReply] = useState(false);
  const [selectedSnowmobileIds, setSelectedSnowmobileIds] = useState<number[]>([]);
  const [newSnowmobile, setNewSnowmobile] = useState({
    name: "",
    licensePlate: "",
    model: "",
    year: new Date().getFullYear(),
  });

  // Departure creation state
  const [showDepartureForm, setShowDepartureForm] = useState(false);
  const [selectedPackageForDeparture, setSelectedPackageForDeparture] = useState<number | null>(null);
  const [newDeparture, setNewDeparture] = useState({
    departureTime: "",
    capacity: 10,
  });

  // Date filter state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateString, setDateString] = useState("");

  // Load data only when authenticated. Read token from localStorage on mount.
  useEffect(() => {
    try {
      const t = localStorage.getItem("adminToken");
      if (t) {
        setAdminToken(t);
        // loadData will run in effect below when adminToken is set
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }, []);

  // When adminToken changes, load data if present
  useEffect(() => {
    if (adminToken) {
      loadData();
    }
  }, [adminToken]);

  // Load snowmobiles and departures when adminToken is set and activeTab is snowmobiles
  useEffect(() => {
    if (adminToken && activeTab === "snowmobiles") {
      loadSnowmobilesAndDepartures();
    }
    if (adminToken && activeTab === "messages") {
      loadContactMessages();
    }
  }, [adminToken, activeTab]);

  async function loadContactMessages() {
    try {
      const msgs = await getContactMessages();
      setContactMessages(Array.isArray(msgs) ? msgs : []);
    } catch (error) {
      console.error("Failed to load contact messages:", error);
      setContactMessages([]);
    }
  }

  async function handleDeleteMessage(id: number) {
    const confirmed = window.confirm("Delete this message? This cannot be undone.");
    if (!confirmed) return;
    try {
      await deleteContactMessage(id);
      setContactMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (error) {
      console.error("Failed to delete message:", error);
      alert("Failed to delete message");
    }
  }

  // Open reply modal and prefill
  function handleOpenReply(message: any) {
    setReplyingToId(message.id);
    setReplyToEmail(message.email || "");
    setReplyBody(`Hi ${message.name || ""},\n\n`);
  }

  // Send reply to backend
  async function handleSendReply(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!replyingToId) return;
    try {
      setSendingReply(true);
      await sendContactReply(replyingToId, {
        to: replyToEmail,
        body: replyBody,
      });
      alert('Reply sent');
      setReplyingToId(null);
      setReplyBody('');
      // refresh messages
      loadContactMessages();
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Failed to send reply: ${msg}`);
    } finally {
      setSendingReply(false);
    }
  }

  async function loadData() {
    try {
      setLoading(true);

      // Load packages and bookings
      const [toursResponse, bookingsData] = await Promise.all([
        getPackages(false), // Get all packages including inactive
        getBookings(),
      ]);

      // Try to load single reservations, but don't fail if it errors
      let reservationsData = [];
      try {
        reservationsData = await getSingleReservations();
      } catch (error) {
        console.warn("Single reservations not available yet:", error);
        // Continue without single reservations
      }

      setTours(toursResponse.items);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setSingleReservations(
        Array.isArray(reservationsData) ? reservationsData : []
      );

      console.log("Loaded data:", {
        tours: toursResponse.items.length,
        bookings: bookingsData.length,
        singleReservations: reservationsData.length,
      });
    } catch (error) {
      console.error("Failed to load data:", error);
      alert("Failed to load data. Check console for details.");
    } finally {
      setLoading(false);
    }
  }

  async function loadSnowmobilesAndDepartures() {
    try {
      const [snowmobilesData, departuresData] = await Promise.all([
        getSnowmobiles(),
        getDepartures({ onlyAvailable: false }),
      ]);
      setSnowmobiles(snowmobilesData);
      setDepartures(departuresData.items || departuresData);
    } catch (error) {
      console.error("Failed to load snowmobile data:", error);
    }
  }

  async function handleDelete(id: number) {
    const confirmDelete = window.confirm(
      "Delete this package? This action cannot be undone."
    );
    if (!confirmDelete) return;
    try {
      await apiDeletePackage(id);
      // Optimistic update: remove from local state
      setTours((prev) => prev.filter((t) => t.id !== id));
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Failed to delete package";
      alert(message);
    }
  }

  // Handle status update
  async function handleStatusUpdate(
    bookingId: number,
    newStatus: "confirmed" | "pending" | "cancelled"
  ) {
    try {
      await updateBookingStatus(bookingId, newStatus);
      // Update local state
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId ? { ...booking, status: newStatus } : booking
        )
      );
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update booking status");
    }
  }

  // Handle reservation status update
  async function handleReservationStatusUpdate(
    reservationId: number,
    newStatus: string
  ) {
    try {
      await updateRentalStatus(reservationId, newStatus);
      setSingleReservations((prev) =>
        prev.map((res) =>
          res.id === reservationId ? { ...res, status: newStatus } : res
        )
      );
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update reservation status");
    }
  }

  // Handle file upload
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const response = await uploadImage(file);
      console.log("Image uploaded:", response);

      // Set uploaded image URL to form
      setFormData((prev) => ({
        ...prev,
        imageUrl: response.url,
      }));

      alert("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image");
    }
  }

  async function handleCreateSnowmobile(e: React.FormEvent) {
  e.preventDefault();
  try {
    await createSnowmobile({
      name: newSnowmobile.name,
      licensePlate: newSnowmobile.licensePlate || undefined,
      model: newSnowmobile.model || undefined,
      year: newSnowmobile.year || undefined,
    });
    alert("Snowmobile created successfully!");
    setNewSnowmobile({ name: "", licensePlate: "", model: "", year: new Date().getFullYear() });
    setSnowmobileAction("");
    loadSnowmobilesAndDepartures();
  } catch (error: any) {
    alert(`Failed to create snowmobile: ${error.message}`);
  }
}

async function handleDepartureSelect(departureId: number) {
  setSelectedDeparture(departureId);
  try {
    const assignments = await getSnowmobileAssignments(departureId);
    setSelectedSnowmobileIds(assignments.map((a: any) => a.snowmobileId));
  } catch (error) {
    console.error("Failed to load assignments:", error);
    setSelectedSnowmobileIds([]);
  }
}

function toggleSnowmobileSelection(snowmobileId: number) {
  setSelectedSnowmobileIds(prev =>
    prev.includes(snowmobileId)
      ? prev.filter(id => id !== snowmobileId)
      : [...prev, snowmobileId]
  );
}

async function handleAssignSnowmobiles() {
  if (!selectedDeparture) {
    alert("Please select a departure first");
    return;
  }
  try {
    await assignSnowmobilesToDeparture(selectedDeparture, selectedSnowmobileIds);
    alert("Snowmobiles assigned successfully!");
  } catch (error: any) {
    alert(`Failed to assign snowmobiles: ${error.message}`);
  }
}
async function handleCreateDeparture(e: React.FormEvent) {
  e.preventDefault();
  if (!selectedPackageForDeparture) {
    alert("Please select a package first");
    return;
  }
  try {
    // Convert to ISO string format
    const departureTimeISO = new Date(newDeparture.departureTime).toISOString();
    
    await createDeparture({
      packageId: selectedPackageForDeparture,
      departureTime: departureTimeISO, // Send as ISO string
      capacity: newDeparture.capacity,
    });
    alert("Departure created successfully!");
    setNewDeparture({ departureTime: "", capacity: 10 });
    setShowDepartureForm(false);
    setSelectedPackageForDeparture(null);
    loadSnowmobilesAndDepartures();
  } catch (error: any) {
    console.error("Full error:", error); // Log the full error
    alert(`Failed to create departure: ${error.message}`);
  }
}

  // Admin auth handlers
 const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: authEmail, password: authPassword }),
    });

    const data = await response.json();

    if (data.token) {
      localStorage.setItem("adminToken", data.token); // ✅ Store the token
      setAdminToken(data.token); // ✅ Update state
      setAuthEmail("");
      setAuthPassword("");
    } else {
      setError("No token received");
    }
  } catch (err) {
    setError("Login failed");
  }
};

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await adminRegister(authName, authEmail, authPassword);
      if (res.token) {
        try {
          localStorage.setItem("adminToken", res.token);
        } catch {}
        setAdminToken(res.token);
      } else {
        alert(res.message || "Registration successful");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      alert(msg);
    }
  }

  function handleLogout() {
    try {
      localStorage.removeItem("adminToken");
    } catch {}
    setAdminToken(null);
    setLoading(false);
  }

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const data = {
      slug: formData.slug,
      name: formData.name,
      description: formData.description || undefined,
      basePrice: Number(formData.basePrice),
      durationMin: Number(formData.durationMin),
      capacity: Number(formData.capacity) || undefined,
      difficulty: formData.difficulty,
      imageUrl: formData.imageUrl || undefined,
      active: formData.active,
    };

    try {
      if (editingTour) {
        await updatePackage(editingTour.id, data);
        alert("Package updated successfully!");
      } else {
        await createPackage(data);
        alert("Package created successfully!");
      }

      // Reset form
      setFormData({
        slug: "",
        name: "",
        description: "",
        basePrice: "",
        durationMin: "",
        capacity: "",
        difficulty: "Easy",
        imageUrl: "",
        active: true,
      });
      setEditingTour(null);
      setShowCreateForm(false);

      // Reload data
      loadData();
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save package");
    }
  }

  // Start editing
  function startEdit(tour: Tour) {
    setEditingTour(tour);
    setFormData({
      slug: tour.slug,
      name: tour.name,
      description: tour.description || "",
      basePrice: tour.basePrice.toString(),
      durationMin: tour.durationMin.toString(),
      capacity: tour.capacity?.toString() || "",
      difficulty: tour.difficulty,
      imageUrl: tour.imageUrl || "",
      active: tour.active,
    });
    setShowCreateForm(true);
  }

  // Flatten participants from
  //  for the Participants tab
  const participantsList = bookings.flatMap((b) =>
  Array.from({ length: b.participants }).map((_, i) => ({
    bookingId: b.id,
    guestName: b.guestName || b.guest?.name || 'Unknown',
    tourName: b.departure?.package?.name || b.package?.name || 'Safari Tour', // Handle null departure
    date: b.departure?.datetime ? new Date(b.departure.datetime).toLocaleDateString() : 'TBD',
    participantIndex: i + 1,
  }))
);

  // Participants view state: allow filtering by booking and searching by name
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(
    null
  );
  const [participantSearch, setParticipantSearch] = useState("");

  // If not authenticated, show login/register form
  if (!adminToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">
            Admin {authMode === "login" ? "Login" : "Register"}
          </h2>
          <form
            onSubmit={authMode === "login" ? handleLogin : handleRegister}
            className="space-y-4"
          >
            {authMode === "register" && (
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                {authMode === "login" ? "Login" : "Register"}
              </button>
              <button
                type="button"
                onClick={() =>
                  setAuthMode(authMode === "login" ? "register" : "login")
                }
                className="px-4 py-2 border rounded"
              >
                {authMode === "login"
                  ? "Switch to Register"
                  : "Switch to Login"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex gap-2">
            <button
              onClick={loadData}
              className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 border"
            >
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 border"
            >
              Logout
            </button>
            {activeTab === "packages" && (
              <button
                onClick={() => {
                  setShowCreateForm(true);
                  setEditingTour(null);
                  setFormData({
                    slug: "",
                    name: "",
                    description: "",
                    basePrice: "",
                    durationMin: "",
                    capacity: "",
                    difficulty: "Easy",
                    imageUrl: "",
                    active: true,
                  });
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Create New Package
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => {
              setActiveTab("packages");
              setShowCreateForm(false);
            }}
            className={`px-4 py-2 font-medium border-b-2 ${
              activeTab === "packages"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Packages ({tours.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("bookings");
              setShowCreateForm(false);
            }}
            className={`px-4 py-2 font-medium border-b-2 ${
              activeTab === "bookings"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Bookings ({bookings.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("singleReservations");
              setShowCreateForm(false);
            }}
            className={`px-4 py-2 font-medium border-b-2 ${
              activeTab === "singleReservations"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Single Reservations ({singleReservations.length})
          </button>
          <button
            onClick={() => setActiveTab("snowmobiles")}
            className={`px-4 py-2 ${
              activeTab === "snowmobiles"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600"
            }`}
          >
            Snowmobile management
          </button>
          <button
            onClick={() => {
              setActiveTab("participants");
              setShowCreateForm(false);
            }}
            className={`px-4 py-2 font-medium border-b-2 ${
              activeTab === "participants"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Participants (
            {bookings.reduce(
              (acc, b) => acc + (b.participantGear?.length ?? 0),
              0
            )}
            )
          </button>
          <button
            onClick={() => {
              setActiveTab("messages");
              setShowCreateForm(false);
            }}
            className={`px-4 py-2 font-medium border-b-2 ${
              activeTab === "messages"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Messages ({contactMessages.length})
          </button>
        </div>

        {/* Create/Edit Form */}
        {activeTab === "packages" && showCreateForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">
              {editingTour ? "Edit Package" : "Create New Package"}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full border rounded px-3 py-2 h-20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Base Price (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      basePrice: e.target.value,
                    }))
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.durationMin}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      durationMin: e.target.value,
                    }))
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Capacity
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      capacity: e.target.value,
                    }))
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      difficulty: e.target.value as
                        | "Easy"
                        | "Moderate"
                        | "Advanced",
                    }))
                  }
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="Easy">Easy</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Upload Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full border rounded px-3 py-2"
                />
                {formData.imageUrl && (
                  <div className="mt-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="h-20 w-20 object-cover rounded"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        active: e.target.checked,
                      }))
                    }
                    className="mr-2"
                  />
                  Active
                </label>
              </div>

              <div className="md:col-span-2 flex gap-2">
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  {editingTour ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Packages List */}
        {activeTab === "packages" && (
          <>
            {/* ADD THIS DEPARTURE SECTION BEFORE "Existing Packages" */}
            {!showCreateForm && (
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Safari Departures</h2>
                  <button
                    onClick={() => setShowDepartureForm(!showDepartureForm)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    {showDepartureForm ? "Cancel" : "+ New Departure"}
                  </button>
                </div>

                {showDepartureForm && (
                  <form onSubmit={handleCreateDeparture} className="space-y-4 border-t pt-4">
    <div>
      <label className="block text-sm font-medium mb-2">Select Safari Package *</label>
      <select
        required
        value={selectedPackageForDeparture || ""}
        onChange={(e) => setSelectedPackageForDeparture(parseInt(e.target.value))}
        className="w-full border rounded px-3 py-2"
      >
        <option value="">-- Select a package --</option>
        {tours.map((tour) => (
          <option key={tour.id} value={tour.id}>
            {tour.name}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium mb-2">Select Departure Date & Time *</label>
      <div className="border rounded-lg p-4 bg-white">
        <DayPicker
          mode="single"
          selected={selectedDate || undefined}
          onSelect={(date) => {
            if (date) {
              setSelectedDate(date);
              setDateString(format(date, "yyyy-MM-dd"));
              // Update departure time with selected date
              const timeStr = newDeparture.departureTime.split('T')[1] || '10:00';
              setNewDeparture({
                ...newDeparture,
                departureTime: `${format(date, "yyyy-MM-dd")}T${timeStr}`
              });
            }
          }}
          disabled={(date) => date < new Date()}
          className="mx-auto"
        />
      </div>
      
      {selectedDate && (
        <div className="mt-3">
          <label className="block text-sm font-medium mb-1">Select Time</label>
          <select
            value={newDeparture.departureTime.split('T')[1] || '10:00'}
            onChange={(e) => {
              const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
              setNewDeparture({
                ...newDeparture,
                departureTime: `${dateStr}T${e.target.value}`
              });
            }}
            className="w-full border rounded px-3 py-2"
          >
            <option value="09:00">09:00</option>
            <option value="10:00">10:00</option>
            <option value="11:00">11:00</option>
            <option value="12:00">12:00</option>
            <option value="13:00">13:00</option>
            <option value="14:00">14:00</option>
            <option value="15:00">15:00</option>
            <option value="16:00">16:00</option>
            <option value="17:00">17:00</option>
          </select>
        </div>
      )}

      {selectedDate && (
        <p className="text-sm text-gray-600 mt-2">
          Selected: {format(selectedDate, "MMMM d, yyyy")} at {newDeparture.departureTime.split('T')[1] || '10:00'}
        </p>
      )}
    </div>

    <div>
      <label className="block text-sm font-medium mb-2">Capacity (max participants)</label>
      <input
        type="number"
        min="1"
        value={newDeparture.capacity}
        onChange={(e) => setNewDeparture({ ...newDeparture, capacity: parseInt(e.target.value) })}
        className="w-full border rounded px-3 py-2"
      />
    </div>

    <button
      type="submit"
      disabled={!selectedDate}
      className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Create Departure
    </button>
  </form>
                )}
              </div>
            )}

            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">Existing Packages</h2>
              </div>

              <div className="divide-y">
                {tours.map((tour) => (
                  <div
                    key={tour.id}
                    className="p-6 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      {tour.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={tour.imageUrl}
                          alt={tour.name}
                          className="h-16 w-16 object-cover rounded"
                        />
                      )}
                      <div>
                        <h3 className="font-bold">{tour.name}</h3>
                        <p className="text-gray-600">{tour.slug}</p>
                        <p className="text-sm text-gray-500">
                          €{tour.basePrice} • {Math.floor(tour.durationMin / 60)}h{" "}
                          {tour.durationMin % 60}min • {tour.difficulty}
                        </p>
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded ${
                            tour.active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {tour.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(tour)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(tour.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "snowmobiles" && (
  <div className="bg-white rounded-lg shadow p-6 mb-8">
    <div className="grid grid-cols-2 gap-6">
      {/* Left Side - Snowmobile Management */}
      <div>
        <h2 className="text-xl font-bold mb-4">Snowmobile Management</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Select Action</label>
          <select 
            value={snowmobileAction}
            onChange={(e) => setSnowmobileAction(e.target.value as "" | "add" | "edit" | "view")}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">-- Choose an action --</option>
            <option value="add">Add New Snowmobile</option>
            <option value="view">View All Snowmobiles</option>
          </select>
        </div>

        <div className="border rounded p-4 bg-gray-50 min-h-[300px]">
          {snowmobileAction === "" && (
            <p className="text-sm text-gray-600">Select an action from the dropdown above</p>
          )}

          {snowmobileAction === "add" && (
            <form onSubmit={handleCreateSnowmobile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={newSnowmobile.name}
                  onChange={(e) => setNewSnowmobile({ ...newSnowmobile, name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Snowmobile 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">License Plate</label>
                <input
                  type="text"
                  value={newSnowmobile.licensePlate}
                  onChange={(e) => setNewSnowmobile({ ...newSnowmobile, licensePlate: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="ABC-123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Model</label>
                <input
                  type="text"
                  value={newSnowmobile.model}
                  onChange={(e) => setNewSnowmobile({ ...newSnowmobile, model: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Lynx Xtrim"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Year</label>
                <input
                  type="number"
                  value={newSnowmobile.year}
                  onChange={(e) => setNewSnowmobile({ ...newSnowmobile, year: parseInt(e.target.value) })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Add Snowmobile
              </button>
            </form>
          )}

          {snowmobileAction === "view" && (
            <div className="overflow-auto max-h-[400px]">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Plate</th>
                    <th className="text-left p-2">Model</th>
                    <th className="text-left p-2">Year</th>
                  </tr>
                </thead>
                <tbody>
                  {snowmobiles.map((sm) => (
                    <tr key={sm.id} className="border-t">
                      <td className="p-2 font-medium">{sm.name}</td>
                      <td className="p-2">{sm.licensePlate || "-"}</td>
                      <td className="p-2">{sm.model || "-"}</td>
                      <td className="p-2">{sm.year || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {snowmobiles.length === 0 && (
                <p className="text-center py-4 text-gray-500">No snowmobiles found</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Safari Assignment */}
      <div>
        <h2 className="text-xl font-bold mb-4">Assign to Safari</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Select Safari Departure</label>
          <select 
            value={selectedDeparture || ""}
            onChange={(e) => handleDepartureSelect(parseInt(e.target.value))}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">-- Choose a departure --</option>
            {departures.map((dep) => (
              <option key={dep.id} value={dep.id}>
                {dep.package?.name || "Unknown"} - {new Date(dep.departureTime).toLocaleString()}
              </option>
            ))}
          </select>
        </div>

        <div className="border rounded p-4 bg-gray-50 min-h-[300px]">
          {!selectedDeparture && (
            <p className="text-sm text-gray-600">Select a departure to assign snowmobiles</p>
          )}

          {selectedDeparture && (
            <div>
              <p className="text-sm font-medium mb-3">Select Snowmobiles:</p>
              <div className="space-y-2 mb-4 max-h-[250px] overflow-auto">
                {snowmobiles.map((sm) => (
                  <div
                    key={sm.id}
                    onClick={() => toggleSnowmobileSelection(sm.id)}
                    className={`p-3 border rounded cursor-pointer transition ${
                      selectedSnowmobileIds.includes(sm.id)
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-300 hover:border-blue-400"
                    }`}
                  >
                    <div className="font-semibold text-sm">{sm.name}</div>
                    <div className="text-xs text-gray-600">
                      {sm.licensePlate || "No plate"} • {sm.model || "No model"}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={handleAssignSnowmobiles}
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                Save Assignment ({selectedSnowmobileIds.length} selected)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
)}

        {/* Participants List */}
        {activeTab === "participants" && (
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6 border-b flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold">All Participants</h2>
              <div className="flex items-center gap-3">
                {selectedBookingId && (
                  <button
                    onClick={() => setSelectedBookingId(null)}
                    className="text-sm px-3 py-1 border rounded bg-gray-50 hover:bg-gray-100"
                  >
                    Clear booking filter
                  </button>
                )}
                <input
                  type="text"
                  placeholder="Search participants or guest..."
                  value={participantSearch}
                  onChange={(e) => setParticipantSearch(e.target.value)}
                  className="border px-3 py-2 rounded w-64 text-sm"
                />
              </div>
            </div>
            <div className="divide-y">
              {(() => {
                // Apply filters: booking filter and search
                const q = participantSearch.trim().toLowerCase();
                let filtered = participantsList;
                if (selectedBookingId)
                  filtered = filtered.filter(
                    (p) => p.bookingId === selectedBookingId
                  );
                if (q.length > 0) {
                  filtered = filtered.filter(
                    (p) =>
                      (p.name || "").toLowerCase().includes(q) ||
                      (p.guestName || "").toLowerCase().includes(q) ||
                      (p.packageName || "").toLowerCase().includes(q)
                  );
                }

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-12 text-gray-500">
                      No participants found
                    </div>
                  );
                }

                // Group by booking
                const groups = filtered.reduce(
                  (acc: Record<number, typeof filtered>, p) => {
                    acc[p.bookingId] = acc[p.bookingId] || [];
                    acc[p.bookingId].push(p);
                    return acc;
                  },
                  {} as Record<number, typeof filtered>
                );

                // Render groups sorted by booking id descending
                return Object.keys(groups)
                  .map(Number)
                  .sort((a, b) => b - a)
                  .map((bookingId) => {
                    const items = groups[bookingId].sort((x, y) =>
                      (x.name || "").localeCompare(y.name || "")
                    );
                    const sample = items[0];
                    return (
                      <div key={bookingId} className="p-4 md:p-6">
                        <div className="mb-3">
                          <div className="font-semibold">
                            Booking #{bookingId} • {sample.packageName}
                          </div>
                          <div className="text-xs text-gray-500">
                            Departure:{" "}
                            {new Date(sample.departureTime).toLocaleDateString(
                              "fi-FI",
                              {
                                year: "numeric",
                                month: "numeric",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {items.map((p) => (
                            <div key={p.id} className="py-3">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                {/* Left: gear items */}
                                <div className="flex-1">
                                  <div className="mt-1 text-sm text-gray-600 flex flex-wrap md:flex-nowrap items-center gap-2 md:gap-4 md:text-base overflow-x-auto">
                                    <span className="whitespace-nowrap">
                                      Boots:{" "}
                                      <span className="font-medium text-gray-900">
                                        {p.boots}
                                      </span>
                                    </span>
                                    <span className="hidden md:inline-block text-gray-300">
                                      •
                                    </span>
                                    <span className="whitespace-nowrap">
                                      Gloves:{" "}
                                      <span className="font-medium text-gray-900">
                                        {p.gloves}
                                      </span>
                                    </span>
                                    <span className="hidden md:inline-block text-gray-300">
                                      •
                                    </span>
                                    <span className="whitespace-nowrap">
                                      Helmet:{" "}
                                      <span className="font-medium text-gray-900">
                                        {p.helmet}
                                      </span>
                                    </span>
                                  </div>
                                </div>
                                {/* Right: participant name + email (no card) */}
                                <div className="text-right md:w-56">
                                  <div className="text-sm font-semibold text-gray-900">
                                    {p.name || "Participant"}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {p.guestEmail}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  });
              })()}
            </div>
          </div>
        )}

        {/* Contact Messages (Admin) */}
        {activeTab === "messages" && (
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Contact Messages</h2>
              <div>
                <button
                  onClick={loadContactMessages}
                  className="px-3 py-1 border rounded bg-gray-50 hover:bg-gray-100"
                >
                  Refresh
                </button>
              </div>
            </div>
            <div className="p-4 overflow-auto">
              {contactMessages.length === 0 ? (
                <p className="text-sm text-gray-600">No messages found.</p>
              ) : (
                <table className="w-full text-left table-auto">
                  <thead>
                    <tr className="text-sm text-gray-600">
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Email</th>
                      <th className="px-3 py-2">Subject</th>
                      <th className="px-3 py-2">Message</th>
                      <th className="px-3 py-2">Received</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contactMessages.map((m) => (
                      <tr key={m.id} className="border-t">
                        <td className="px-3 py-2 text-sm">{m.id}</td>
                        <td className="px-3 py-2 text-sm">
                          <div className="flex items-center gap-2">
                            <div>{m.name}</div>
                            {m.repliedAt && (
                              <span className="inline-block text-xs px-2 py-0.5 rounded bg-green-100 text-green-800">
                                Replied
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-sm">{m.email}</td>
                        <td className="px-3 py-2 text-sm">{m.subject}</td>
                        <td className="px-3 py-2 text-sm max-w-xl">{m.message}</td>
                        <td className="px-3 py-2 text-sm">{new Date(m.createdAt).toLocaleString()}</td>
                        <td className="px-3 py-2 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenReply(m)}
                              className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                            >
                              Reply
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(m.id)}
                              className="px-2 py-1 text-white bg-red-600 rounded hover:bg-red-700 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Reply Modal */}
            {replyingToId !== null && (
              <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-2xl p-6">
                  <h3 className="text-lg font-semibold mb-3">Reply to message #{replyingToId}</h3>
                  <form onSubmit={handleSendReply} className="space-y-3">
                    <div>
                      <label className="block text-sm">To</label>
                      <input value={replyToEmail} onChange={(e) => setReplyToEmail(e.target.value)} className="w-full border rounded px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm">Message</label>
                      <textarea value={replyBody} onChange={(e) => setReplyBody(e.target.value)} rows={8} className="w-full border rounded px-3 py-2" />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => setReplyingToId(null)} className="px-4 py-2 border rounded">Cancel</button>
                      <button type="submit" disabled={sendingReply} className="px-4 py-2 bg-blue-600 text-white rounded">
                        {sendingReply ? "Sending..." : "Send Reply"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bookings List */}
        {activeTab === "bookings" && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">All Bookings</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Guest
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Package
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Departure
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Participants & Gear
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        #{booking.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {booking.guest.name}
                          </div>
                          <div className="text-gray-500">
                            {booking.guest.email}
                          </div>
                          {booking.guest.phone && (
                            <div className="text-gray-500">
                              {booking.guest.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {booking.departure?.package?.name || booking.package?.name || 'Safari Tour'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {booking.bookingDate 
    ? new Date(booking.bookingDate).toLocaleDateString()
    : booking.departure?.datetime 
      ? new Date(booking.departure.datetime).toLocaleDateString()
      : 'TBD'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="font-medium text-gray-900">
                          {booking.participants} participant
                          {booking.participants > 1 ? "s" : ""}
                        </div>
                        <div className="mt-2">
                          <button
                            onClick={() => {
                              setActiveTab("participants");
                              setSelectedBookingId(booking.id);
                            }}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            View participants
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        €
                        {typeof booking.totalPrice === "number"
                          ? booking.totalPrice.toFixed(2)
                          : Number(booking.totalPrice).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={booking.status}
                          onChange={(e) =>
                            handleStatusUpdate(
                              booking.id,
                              e.target.value as
                                | "confirmed"
                                | "pending"
                                | "cancelled"
                            )
                          }
                          className={`px-3 py-1 text-xs font-semibold rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : booking.status === "cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <option value="confirmed">confirmed</option>
                          <option value="pending">pending</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(booking.createdAt).toLocaleDateString(
                          "fi-FI",
                          {
                            year: "numeric",
                            month: "numeric",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {bookings.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No bookings found
                </div>
              )}
            </div>
          </div>
        )}

        {/* Single Reservations List */}
        {activeTab === "singleReservations" && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Single Snowmobile Reservations</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Snowmobile</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {singleReservations.map((reservation) => (
                    <tr key={reservation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        #{reservation.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {reservation.guest?.name || 'N/A'}
                          </div>
                          <div className="text-gray-500">
                            {reservation.guest?.email || 'N/A'}
                          </div>
                          {reservation.guest?.phone && (
                            <div className="text-gray-500">
                              {reservation.guest.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {reservation.snowmobile?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(reservation.startTime).toLocaleDateString('fi-FI', {
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(reservation.endTime).toLocaleDateString('fi-FI', {
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        €{typeof reservation.totalPrice === 'number'
                          ? reservation.totalPrice.toFixed(2)
                          : Number(reservation.totalPrice).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={reservation.status}
                          onChange={(e) => handleReservationStatusUpdate(reservation.id, e.target.value)}
                          className={`px-3 py-1 text-xs font-semibold rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${
                            reservation.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : reservation.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : reservation.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : reservation.status === 'completed'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <option value="pending">pending</option>
                          <option value="confirmed">confirmed</option>
                          <option value="completed">completed</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(reservation.createdAt).toLocaleDateString('fi-FI', {
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {singleReservations.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No snowmobile reservations yet
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


