"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getPackages,
  createPackage,
  updatePackage,
  uploadImage,
  deletePackage as apiDeletePackage,
  getBookings,
  approveBooking,
  rejectBooking,
  adminRegister,
  getSingleReservations,
  approveSnowmobileRental,
  rejectSnowmobileRental,
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
import { useDepartureManagement } from "@/hooks/useDepartureManagement";

// Helper to get full image URL (backend serves images)
const getImageUrl = (url?: string) => {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/uploads")) {
    return `http://localhost:3001${url}`;
  }
  return url;
};

import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/dist/style.css";
import { useError } from "@/hooks/useError";

interface Tour {
  id: number;
  slug: string;
  name: string;
  description?: string;
  basePrice: number;
  durationMin: number;
  difficulty: "Easy" | "Moderate" | "Advanced";
  imageUrl?: string;
  active: boolean;
}

interface Snowmobile {
  id: number;
  name: string;
  licensePlate?: string;
  model?: string;
  year?: number;
  hourlyRate?: number;
}

interface Departure {
  id: number;
  departureTime: string;
  capacity: number;
  reserved: number;
  packageId?: number;
  package?: {
    id: number;
    name: string;
  };
}

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  repliedAt?: string;
}

interface Booking {
  id: number;
  guestId: number;
  departureId: number;
  participants: number;
  totalPrice: number | string;
  status: string;
  approvalStatus?: string;
  adminMessage?: string;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
  bookingDate?: string;
  bookingTime?: string;
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
  package?: {
    id: number;
    name: string;
    slug: string;
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
  totalPrice: number | string;
  status: string;
  approvalStatus?: string;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
  startTime: string;
  endTime: string;
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
  snowmobile?: {
    id: number;
    name: string;
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

export default function AdminPage() {
  // ========================================
  // ALL HOOKS MUST BE AT THE TOP - NO EXCEPTIONS
  // ========================================

  // Custom hook
  const {
    departures,
    showDepartureForm,
    setShowDepartureForm,
    editingDepartureId,
    setEditingDepartureId,
    selectedPackageForDeparture,
    setSelectedPackageForDeparture,
    newDeparture,
    setNewDeparture,
    selectedDate,
    setSelectedDate,
    loadDepartures,
    handleCreateDeparture,
    handleDeleteDeparture,
    handleEditDeparture,
    handleCancelEdit,
  } = useDepartureManagement();

  // All useState hooks
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

  const [formData, setFormData] = useState({
    slug: "",
    name: "",
    description: "",
    basePrice: "",
    durationMin: "",
    difficulty: "Easy" as "Easy" | "Moderate" | "Advanced",
    imageUrl: "",
    active: true,
  });

  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");

  const [snowmobileAction, setSnowmobileAction] = useState<
    "" | "add" | "edit" | "view"
  >("");
  const [selectedDeparture, setSelectedDeparture] = useState<number | null>(
    null
  );
  const [snowmobiles, setSnowmobiles] = useState<Snowmobile[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyToEmail, setReplyToEmail] = useState<string>("");
  const [replyBody, setReplyBody] = useState<string>("");
  const [sendingReply, setSendingReply] = useState(false);
  const [selectedSnowmobileIds, setSelectedSnowmobileIds] = useState<number[]>(
    []
  );
  const [newSnowmobile, setNewSnowmobile] = useState({
    name: "",
    licensePlate: "",
    model: "",
    year: new Date().getFullYear(),
    hourlyRate: 0,
    pricing: {
      "2h": 0,
      "4h": 0,
      "6h": 0,
      "8h": 0,
      vrk: 0,
    },
  });

  const [snowmobileTab, setSnowmobileTab] = useState<
    "add" | "view" | "maintenance"
  >("view");
  const [editingSnowmobileId, setEditingSnowmobileId] = useState<number | null>(
    null
  );
  const [editingSnowmobileData, setEditingSnowmobileData] = useState<any>({});
  const [disabledSnowmobiles, setDisabledSnowmobiles] = useState<number[]>([]);

  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(
    null
  );
  const [participantSearch, setParticipantSearch] = useState("");

  const [approvalModal, setApprovalModal] = useState<{
    open: boolean;
    bookingId: number | null;
    action: "approve" | "reject" | null;
    message: string;
  }>({ open: false, bookingId: null, action: null, message: "" });

  const [rentalApprovalModal, setRentalApprovalModal] = useState<{
    open: boolean;
    rentalId: number | null;
    action: "approve" | "reject" | null;
    message: string;
  }>({ open: false, rentalId: null, action: null, message: "" });

  // useError hook
  const { setError } = useError();

  // ========================================
  // ALL useCallback HOOKS
  // ========================================

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [toursResponse, bookingsData] = await Promise.all([
        getPackages(false),
        getBookings(),
      ]);

      let reservationsData = [];
      try {
        reservationsData = await getSingleReservations();
      } catch (error: unknown) {
        console.error("Failed to load single reservations:", error);
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
  }, []);

  const loadSnowmobilesAndDepartures = useCallback(async () => {
    try {
      const snowmobilesData = await getSnowmobiles();
      setSnowmobiles(snowmobilesData);
      await loadDepartures();
    } catch (error) {
      console.error("Failed to load snowmobile data:", error);
    }
  }, [adminToken]);

  const loadContactMessages = useCallback(async () => {
    try {
      const msgs = await getContactMessages();
      setContactMessages(Array.isArray(msgs) ? msgs : []);
    } catch (error) {
      console.error("Failed to load contact messages:", error);
      setContactMessages([]);
    }
  }, []);

  // ✅ MOVED: These were after early returns - now they're here with other useCallbacks
  const handleEditSnowmobile = useCallback(
    (snowmobileId: number) => {
      const snowmobile = snowmobiles.find((s) => s.id === snowmobileId);
      if (!snowmobile) return;

      setEditingSnowmobileId(snowmobileId);
      setEditingSnowmobileData({
        name: snowmobile.name,
        licensePlate: snowmobile.licensePlate || "",
        model: snowmobile.model || "",
        year: snowmobile.year || new Date().getFullYear(),
        hourlyRate: snowmobile.hourlyRate || 0,
      });
    },
    [snowmobiles]
  );

  const handleSaveSnowmobile = useCallback(async () => {
    if (!editingSnowmobileId) return;

    try {
      const response = await fetch(`/api/snowmobiles/${editingSnowmobileId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify(editingSnowmobileData),
      });

      if (response.ok) {
        alert("Snowmobile updated successfully!");
        setEditingSnowmobileId(null);
        loadSnowmobilesAndDepartures();
      } else {
        alert("Failed to update snowmobile");
      }
    } catch (error) {
      console.error("Failed to save snowmobile:", error);
      alert("Failed to save snowmobile");
    }
  }, [editingSnowmobileId, editingSnowmobileData, loadSnowmobilesAndDepartures, adminToken]);

  // ========================================
  // ALL useEffect HOOKS
  // ========================================

  useEffect(() => {
    try {
      const t = localStorage.getItem("adminToken");
      if (t) {
        setAdminToken(t);
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (adminToken) {
      loadData();
    }
  }, [adminToken, loadData]);

  useEffect(() => {
    if (adminToken && activeTab === "snowmobiles") {
      loadSnowmobilesAndDepartures();
    }
    if (adminToken && activeTab === "messages") {
      loadContactMessages();
    }
  }, [
    adminToken,
    activeTab,
    loadSnowmobilesAndDepartures,
    loadContactMessages,
  ]);

  useEffect(() => {
    if (adminToken) {
      loadDepartures();
    }
  }, [adminToken]); // REMOVE loadDepartures from dependencies

  useEffect(() => {
    if (adminToken && activeTab === "snowmobiles") {
      async function loadDisabled() {
        try {
          const response = await fetch("/api/snowmobiles/disabled");
          const data = await response.json();
          setDisabledSnowmobiles(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error("Failed to load disabled snowmobiles:", error);
        }
      }
      loadDisabled();
    }
  }, [adminToken, activeTab]);

  // ========================================
  // ALL useMemo HOOKS
  // ========================================

  const participantsList = useMemo(
    () =>
      bookings.flatMap((b) =>
        (b.participantGear || []).map((gear, i) => ({
          id: gear.id,
          bookingId: b.id,
          name: gear.name || `Participant ${i + 1}`,
          boots: gear.boots || "N/A",
          gloves: gear.gloves || "N/A",
          helmet: gear.helmet || "N/A",
          overalls: gear.overalls || "N/A",
          guestName: b.guest?.name || "Unknown",
          guestEmail: b.guest?.email || "",
          packageName: b.departure?.package?.name || "Safari Tour",
          departureTime: b.departure?.departureTime || "",
        }))
      ),
    [bookings]
  );

  // ========================================
  // REGULAR FUNCTIONS (not hooks)
  // ========================================

  async function handleDeleteMessage(id: number) {
    const confirmed = window.confirm(
      "Delete this message? This cannot be undone."
    );
    if (!confirmed) return;
    try {
      await deleteContactMessage(id);
      setContactMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (error) {
      console.error("Failed to delete message:", error);
      alert("Failed to delete message");
    }
  }

  function handleOpenReply(message: ContactMessage) {
    setReplyingToId(message.id);
    setReplyToEmail(message.email || "");
    setReplyBody(`Hi ${message.name || ""},\n\n`);
  }

  async function handleSendReply(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!replyingToId) return;
    try {
      setSendingReply(true);
      await sendContactReply(replyingToId, {
        to: replyToEmail,
        body: replyBody,
      });
      alert("Reply sent");
      setReplyingToId(null);
      setReplyBody("");
      loadContactMessages();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Failed to send reply: ${msg}`);
    } finally {
      setSendingReply(false);
    }
  }

  async function handleDelete(id: number) {
    const confirmDelete = window.confirm(
      "Delete this package? This action cannot be undone."
    );
    if (!confirmDelete) return;
    try {
      await apiDeletePackage(id);
      setTours((prev) => prev.filter((t) => t.id !== id));
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Failed to delete package";
      alert(message);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const response = await uploadImage(file);
      console.log("Image uploaded:", response);
      setFormData((prev) => ({
        ...prev,
        imageUrl: response.url,
      }));
      alert("Image uploaded successfully!");
    } catch (error: unknown) {
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
        hourlyRate: newSnowmobile.hourlyRate || undefined,
        pricing: newSnowmobile.pricing,
      });
      alert("Snowmobile created successfully!");
      setNewSnowmobile({
        name: "",
        licensePlate: "",
        model: "",
        year: new Date().getFullYear(),
        hourlyRate: 0,
        pricing: {
          "2h": 0,
          "4h": 0,
          "6h": 0,
          "8h": 0,
          vrk: 0,
        },
      });
      setSnowmobileAction("");
      loadSnowmobilesAndDepartures();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to create snowmobile: ${msg}`);
    }
  }

  async function handleDepartureSelect(departureId: number) {
    setSelectedDeparture(departureId);
    try {
      const assignments = await getSnowmobileAssignments(departureId);
      setSelectedSnowmobileIds(
        assignments.map((a: { snowmobileId: number }) => a.snowmobileId)
      );
    } catch (error: unknown) {
      console.error("Failed to load assignments:", error);
      setSelectedSnowmobileIds([]);
    }
  }

  function toggleSnowmobileSelection(snowmobileId: number) {
    setSelectedSnowmobileIds((prev) =>
      prev.includes(snowmobileId)
        ? prev.filter((id) => id !== snowmobileId)
        : [...prev, snowmobileId]
    );
  }

  async function handleAssignSnowmobiles() {
    if (!selectedDeparture) {
      alert("Please select a departure first");
      return;
    }
    try {
      await assignSnowmobilesToDeparture(
        selectedDeparture,
        selectedSnowmobileIds
      );
      alert("Snowmobiles assigned successfully!");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to assign snowmobiles: ${msg}`);
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: authEmail, password: authPassword }),
        }
      );

      const data = await response.json();

      if (data.token) {
        localStorage.setItem("adminToken", data.token);
        setAdminToken(data.token);
        setAuthEmail("");
        setAuthPassword("");
      } else {
        setError("No token received");
      }
    } catch {
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const data = {
      slug: formData.slug,
      name: formData.name,
      description: formData.description || undefined,
      basePrice: Number(formData.basePrice),
      durationMin: Number(formData.durationMin),
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

      setFormData({
        slug: "",
        name: "",
        description: "",
        basePrice: "",
        durationMin: "",
        difficulty: "Easy",
        imageUrl: "",
        active: true,
      });
      setEditingTour(null);
      setShowCreateForm(false);
      loadData();
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save package");
    }
  }

  function startEdit(tour: Tour) {
    setEditingTour(tour);
    setFormData({
      slug: tour.slug,
      name: tour.name,
      description: tour.description || "",
      basePrice: tour.basePrice.toString(),
      durationMin: tour.durationMin.toString(),
      difficulty: tour.difficulty,
      imageUrl: tour.imageUrl || "",
      active: tour.active,
    });
    setShowCreateForm(true);
  }

  async function handleApprove(bookingId: number) {
    try {
      await approveBooking(bookingId, approvalModal.message || undefined);
      alert(
        "Booking approved successfully! Confirmation email sent to customer."
      );
      setApprovalModal({
        open: false,
        bookingId: null,
        action: null,
        message: "",
      });
      loadData();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to approve booking: ${msg}`);
    }
  }

  async function handleReject(bookingId: number) {
    if (!approvalModal.message.trim()) {
      alert("Please provide a rejection reason");
      return;
    }
    try {
      await rejectBooking(bookingId, approvalModal.message);
      alert("Booking rejected. Notification email sent to customer.");
      setApprovalModal({
        open: false,
        bookingId: null,
        action: null,
        message: "",
      });
      loadData();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to reject booking: ${msg}`);
    }
  }

  async function handleApproveRental(rentalId: number) {
    try {
      await approveSnowmobileRental(
        rentalId,
        rentalApprovalModal.message || undefined
      );
      alert(
        "Rental approved successfully! Confirmation email sent to customer."
      );
      setRentalApprovalModal({
        open: false,
        rentalId: null,
        action: null,
        message: "",
      });
      loadData();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to approve rental: ${msg}`);
    }
  }

  async function handleRejectRental(rentalId: number) {
    if (!rentalApprovalModal.message.trim()) {
      alert("Please provide a rejection reason");
      return;
    }
    try {
      await rejectSnowmobileRental(rentalId, rentalApprovalModal.message);
      alert("Rental rejected. Notification email sent to customer.");
      setRentalApprovalModal({
        open: false,
        rentalId: null,
        action: null,
        message: "",
      });
      loadData();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to reject rental: ${msg}`);
    }
  }

  async function handleToggleMaintenance(snowmobileId: number) {
    try {
      const isCurrentlyDisabled = disabledSnowmobiles.includes(snowmobileId);
      
      const response = await fetch(`/api/snowmobiles/${snowmobileId}/maintenance`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify({ disabled: !isCurrentlyDisabled }),
      });

      if (response.ok) {
        setDisabledSnowmobiles((prev) =>
          isCurrentlyDisabled
            ? prev.filter((id) => id !== snowmobileId)
            : [...prev, snowmobileId]
        );
        alert(
          isCurrentlyDisabled
            ? "Snowmobile re-enabled"
            : "Snowmobile disabled for maintenance"
        );
      }
    } catch (error) {
      console.error("Failed to toggle maintenance:", error);
      alert("Failed to update snowmobile status");
    }
  }

  // ========================================
  // EARLY RETURNS (after ALL hooks)
  // ========================================

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

  // ========================================
  // MAIN RENDER
  // ========================================

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
            {activeTab === "packages" && (
              <button
                onClick={() => {
                  setShowDepartureForm(true);
                  setEditingDepartureId(null);
                  setNewDeparture({ departureTime: "", capacity: 10 });
                  setSelectedPackageForDeparture(null);
                }}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                Add Departure
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
                      src={getImageUrl(formData.imageUrl)}
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

        {/* Departure Form */}
        {activeTab === "packages" && showDepartureForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">
              {editingDepartureId ? "Edit Departure" : "Add New Departure"}
            </h2>

            <form
              onSubmit={handleCreateDeparture}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Package</label>
                <select
                  value={selectedPackageForDeparture || ""}
                  onChange={(e) =>
                    setSelectedPackageForDeparture(Number(e.target.value))
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Select a package</option>
                  {tours.map((tour) => (
                    <option key={tour.id} value={tour.id}>
                      {tour.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  value={newDeparture.capacity}
                  onChange={(e) =>
                    setNewDeparture((prev) => ({
                      ...prev,
                      capacity: Number(e.target.value),
                    }))
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Select Departure Date
                </label>
                <div className="border rounded p-4 bg-gray-50">
                  <DayPicker
                    mode="single"
                    selected={selectedDate || undefined}
                    onSelect={(date) => {
                      setSelectedDate(date || null);
                      if (date && newDeparture.departureTime) {
                        const [hours, minutes] = newDeparture.departureTime.split(':');
                        const dateTime = new Date(date);
                        dateTime.setHours(Number(hours), Number(minutes));
                        setNewDeparture((prev) => ({
                          ...prev,
                          departureTime: dateTime.toISOString(),
                        }));
                      }
                    }}
                    disabled={(date) => date < new Date()}
                    className="mx-auto"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Departure Time
                </label>
                <select
                  value={newDeparture.departureTime ? newDeparture.departureTime.split('T')[1]?.substring(0, 5) || "" : ""}
                  onChange={(e) => {
                    const time = e.target.value;
                    if (selectedDate && time) {
                      const [hours, minutes] = time.split(':');
                      const dateTime = new Date(selectedDate);
                      dateTime.setHours(Number(hours), Number(minutes));
                      setNewDeparture((prev) => ({
                        ...prev,
                        departureTime: dateTime.toISOString(),
                      }));
                    }
                  }}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Select a time</option>
                  {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 flex gap-2">
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  {editingDepartureId ? "Update" : "Create"} Departure
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
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
            {!showCreateForm && (
              <div className="bg-white rounded-lg shadow mt-8 mb-8">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-bold">Safari Departures</h2>
                </div>

                <div className="divide-y">
                  {departures.map((departure) => {
                    const pkg = tours.find((t) => t.id === departure.packageId);
                    return (
                      <div
                        key={departure.id}
                        className="p-6 flex items-center justify-between"
                      >
                        <div>
                          <h3 className="font-bold">
                            {pkg?.name || `Package ${departure.packageId}`}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {new Date(departure.departureTime).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            ID: {departure.id}
                          </p>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              Capacity: {departure.capacity}
                            </p>
                            <p className="text-sm text-gray-600">
                              Reserved: {departure.reserved || 0}
                            </p>
                            <p className="text-sm text-green-600 font-medium">
                              Available:{" "}
                              {departure.capacity - (departure.reserved || 0)}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditDeparture(departure)}
                              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                            >
                              Edit
                            </button>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleDeleteDeparture(departure.id)
                              }
                              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {departures.length === 0 && (
                  <div className="p-6 text-center text-gray-500">
                    No departures created yet
                  </div>
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
                          src={getImageUrl(tour.imageUrl)}
                          alt={tour.name}
                          className="h-16 w-16 object-cover rounded"
                        />
                      )}
                      <div>
                        <h3 className="font-bold">{tour.name}</h3>
                        <p className="text-gray-600">{tour.slug}</p>
                        <p className="text-sm text-gray-500">
                          €{tour.basePrice} •{" "}
                          {Math.floor(tour.durationMin / 60)}h{" "}
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

        {/* Snowmobiles Tab */}
        {activeTab === "snowmobiles" && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex gap-2 mb-6 border-b">
              <button
                onClick={() => {
                  setSnowmobileTab("view");
                  setEditingSnowmobileId(null);
                }}
                className={`px-4 py-2 font-medium border-b-2 ${
                  snowmobileTab === "view"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                All Snowmobiles ({snowmobiles.length})
              </button>
              <button
                onClick={() => {
                  setSnowmobileTab("add");
                  setEditingSnowmobileId(null);
                }}
                className={`px-4 py-2 font-medium border-b-2 ${
                  snowmobileTab === "add"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Add New
              </button>
              <button
                onClick={() => {
                  setSnowmobileTab("maintenance");
                  setEditingSnowmobileId(null);
                }}
                className={`px-4 py-2 font-medium border-b-2 ${
                  snowmobileTab === "maintenance"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Maintenance ({disabledSnowmobiles.length})
              </button>
            </div>

            {/* View Tab */}
            {snowmobileTab === "view" && (
              <div>
                <div className="space-y-4">
                  {snowmobiles.map((sm) => (
                    <div
                      key={sm.id}
                      className={`border rounded-lg p-4 ${
                        disabledSnowmobiles.includes(sm.id)
                          ? "bg-red-50 border-red-300"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      {editingSnowmobileId === sm.id ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Name
                              </label>
                              <input
                                type="text"
                                value={editingSnowmobileData.name}
                                onChange={(e) =>
                                  setEditingSnowmobileData({
                                    ...editingSnowmobileData,
                                    name: e.target.value,
                                  })
                                }
                                className="w-full border rounded px-3 py-2"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                License Plate
                              </label>
                              <input
                                type="text"
                                value={editingSnowmobileData.licensePlate}
                                onChange={(e) =>
                                  setEditingSnowmobileData({
                                    ...editingSnowmobileData,
                                    licensePlate: e.target.value,
                                  })
                                }
                                className="w-full border rounded px-3 py-2"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Model
                              </label>
                              <input
                                type="text"
                                value={editingSnowmobileData.model}
                                onChange={(e) =>
                                  setEditingSnowmobileData({
                                    ...editingSnowmobileData,
                                    model: e.target.value,
                                  })
                                }
                                className="w-full border rounded px-3 py-2"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Year
                              </label>
                              <input
                                type="number"
                                value={editingSnowmobileData.year}
                                onChange={(e) =>
                                  setEditingSnowmobileData({
                                    ...editingSnowmobileData,
                                    year: parseInt(e.target.value),
                                  })
                                }
                                className="w-full border rounded px-3 py-2"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Hourly Rate (€)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={editingSnowmobileData.hourlyRate}
                              onChange={(e) =>
                                setEditingSnowmobileData({
                                  ...editingSnowmobileData,
                                  hourlyRate: parseFloat(e.target.value),
                                })
                              }
                              className="w-full border rounded px-3 py-2"
                              placeholder="e.g., 45.50"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Leave empty or 0 to use tier-based pricing
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveSnowmobile}
                              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Save Changes
                            </button>
                            <button
                              onClick={() => setEditingSnowmobileId(null)}
                              className="px-4 py-2 border rounded hover:bg-gray-100"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-lg">{sm.name}</h3>
                            <p className="text-sm text-gray-600">
                              {sm.licensePlate || "No plate"} •{" "}
                              {sm.model || "No model"} • {sm.year || "N/A"}
                            </p>
                            <p className="text-sm font-medium mt-2">
                              Hourly Rate:{" "}
                              <span className="text-blue-600">
                                €{sm.hourlyRate || "Not set"}
                              </span>
                            </p>
                            {disabledSnowmobiles.includes(sm.id) && (
                              <p className="text-sm text-red-600 font-semibold mt-1">
                                🔧 In Maintenance
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditSnowmobile(sm.id)}
                              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleMaintenance(sm.id)}
                              className={`px-4 py-2 rounded text-white ${
                                disabledSnowmobiles.includes(sm.id)
                                  ? "bg-gray-600 hover:bg-gray-700"
                                  : "bg-orange-600 hover:bg-orange-700"
                              }`}
                            >
                              {disabledSnowmobiles.includes(sm.id)
                                ? "Enable"
                                : "Disable"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Tab */}
            {snowmobileTab === "add" && (
              <form
                onSubmit={handleCreateSnowmobile}
                className="space-y-4 max-w-md"
              >
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSnowmobile.name}
                    onChange={(e) =>
                      setNewSnowmobile({
                        ...newSnowmobile,
                        name: e.target.value,
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                    placeholder="Snowmobile 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    License Plate
                  </label>
                  <input
                    type="text"
                    value={newSnowmobile.licensePlate}
                    onChange={(e) =>
                      setNewSnowmobile({
                        ...newSnowmobile,
                        licensePlate: e.target.value,
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                    placeholder="ABC-123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    value={newSnowmobile.model}
                    onChange={(e) =>
                      setNewSnowmobile({
                        ...newSnowmobile,
                        model: e.target.value,
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                    placeholder="Lynx Xtrim"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Year</label>
                  <input
                    type="number"
                    value={newSnowmobile.year}
                    onChange={(e) =>
                      setNewSnowmobile({
                        ...newSnowmobile,
                        year: parseInt(e.target.value),
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Hourly Rate (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newSnowmobile.hourlyRate}
                    onChange={(e) =>
                      setNewSnowmobile({
                        ...newSnowmobile,
                        hourlyRate: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                    placeholder="e.g., 50.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty or 0 to use tier-based pricing below
                  </p>
                </div>

                <div className="border rounded p-4 space-y-3">
                  <h3 className="text-sm font-medium mb-2">
                    Tier-Based Pricing (€)
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs mb-1">2 hours</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newSnowmobile.pricing["2h"]}
                        onChange={(e) =>
                          setNewSnowmobile({
                            ...newSnowmobile,
                            pricing: {
                              ...newSnowmobile.pricing,
                              "2h": parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full border rounded px-2 py-1 text-sm"
                        placeholder="100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">4 hours</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newSnowmobile.pricing["4h"]}
                        onChange={(e) =>
                          setNewSnowmobile({
                            ...newSnowmobile,
                            pricing: {
                              ...newSnowmobile.pricing,
                              "4h": parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full border rounded px-2 py-1 text-sm"
                        placeholder="180"
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">6 hours</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newSnowmobile.pricing["6h"]}
                        onChange={(e) =>
                          setNewSnowmobile({
                            ...newSnowmobile,
                            pricing: {
                              ...newSnowmobile.pricing,
                              "6h": parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full border rounded px-2 py-1 text-sm"
                        placeholder="250"
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">8 hours</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newSnowmobile.pricing["8h"]}
                        onChange={(e) =>
                          setNewSnowmobile({
                            ...newSnowmobile,
                            pricing: {
                              ...newSnowmobile.pricing,
                              "8h": parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full border rounded px-2 py-1 text-sm"
                        placeholder="320"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs mb-1">
                        Full Day (vrk)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={newSnowmobile.pricing["vrk"]}
                        onChange={(e) =>
                          setNewSnowmobile({
                            ...newSnowmobile,
                            pricing: {
                              ...newSnowmobile.pricing,
                              vrk: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full border rounded px-2 py-1 text-sm"
                        placeholder="400"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Pricing tiers are used when hourly rate is not set or is 0
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Add Snowmobile
                </button>
              </form>
            )}

            {/* Maintenance Tab */}
            {snowmobileTab === "maintenance" && (
              <div>
                {disabledSnowmobiles.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No snowmobiles in maintenance
                  </p>
                ) : (
                  <div className="space-y-4">
                    {snowmobiles
                      .filter((sm) => disabledSnowmobiles.includes(sm.id))
                      .map((sm) => (
                        <div
                          key={sm.id}
                          className="border border-red-300 rounded-lg p-4 bg-red-50"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-bold text-lg">{sm.name}</h3>
                              <p className="text-sm text-gray-600">
                                {sm.licensePlate || "No plate"} •{" "}
                                {sm.model || "No model"}
                              </p>
                            </div>
                            <button
                              onClick={() => handleToggleMaintenance(sm.id)}
                              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Re-enable
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Tour Bookings</h2>
            </div>
            <div className="divide-y">
              {bookings.map((booking) => (
                <div key={booking.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold">{booking.guest.name}</h3>
                      <p className="text-sm text-gray-600">
                        {booking.guest.email}
                      </p>
                      <p className="text-sm">
                        {booking.departure?.package?.name} •{" "}
                        {booking.participants} participants
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(
                          booking.departure?.departureTime
                        ).toLocaleString()}
                      </p>
                      <p className="font-medium mt-2">€{booking.totalPrice}</p>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded mt-2 ${
                          booking.approvalStatus === "approved"
                            ? "bg-green-100 text-green-800"
                            : booking.approvalStatus === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {booking.approvalStatus || "pending"}
                      </span>
                    </div>
                    {booking.approvalStatus === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setApprovalModal({
                              open: true,
                              bookingId: booking.id,
                              action: "approve",
                              message: "",
                            })
                          }
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            setApprovalModal({
                              open: true,
                              bookingId: booking.id,
                              action: "reject",
                              message: "",
                            })
                          }
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Single Reservations Tab */}
        {activeTab === "singleReservations" && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Snowmobile Rentals</h2>
            </div>
            <div className="divide-y">
              {singleReservations.map((rental) => (
                <div key={rental.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold">{rental.guest.name}</h3>
                      <p className="text-sm text-gray-600">
                        {rental.guest.email}
                      </p>
                      <p className="text-sm">
                        {rental.snowmobile?.name || "Snowmobile"} •{" "}
                        {rental.participants} participants
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(rental.startTime).toLocaleString()} -{" "}
                        {new Date(rental.endTime).toLocaleString()}
                      </p>
                      <p className="font-medium mt-2">€{rental.totalPrice}</p>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded mt-2 ${
                          rental.approvalStatus === "approved"
                            ? "bg-green-100 text-green-800"
                            : rental.approvalStatus === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {rental.approvalStatus || "pending"}
                      </span>
                    </div>
                    {rental.approvalStatus === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setRentalApprovalModal({
                              open: true,
                              rentalId: rental.id,
                              action: "approve",
                              message: "",
                            })
                          }
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            setRentalApprovalModal({
                              open: true,
                              rentalId: rental.id,
                              action: "reject",
                              message: "",
                            })
                          }
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Participants Tab */}
        {activeTab === "participants" && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">All Participants</h2>
              <div className="mt-4 flex gap-4">
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={participantSearch}
                  onChange={(e) => setParticipantSearch(e.target.value)}
                  className="border rounded px-3 py-2 flex-1"
                />
                <select
                  value={selectedBookingId || ""}
                  onChange={(e) =>
                    setSelectedBookingId(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="border rounded px-3 py-2"
                >
                  <option value="">All Bookings</option>
                  {bookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      Booking #{b.id} - {b.departure?.package?.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="divide-y">
              {participantsList
                .filter((p) => {
                  const matchesSearch = p.name
                    .toLowerCase()
                    .includes(participantSearch.toLowerCase());
                  const matchesBooking =
                    selectedBookingId === null ||
                    p.bookingId === selectedBookingId;
                  return matchesSearch && matchesBooking;
                })
                .map((participant) => (
                  <div key={participant.id} className="p-6">
                    <div>
                      <h3 className="font-bold">{participant.name}</h3>
                      <p className="text-sm text-gray-600">
                        Guest: {participant.guestName} ({participant.guestEmail}
                        )
                      </p>
                      <p className="text-sm text-gray-500">
                        {participant.packageName} •{" "}
                        {new Date(participant.departureTime).toLocaleString()}
                      </p>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Overalls:</span>{" "}
                          {participant.overalls}
                        </div>
                        <div>
                          <span className="font-medium">Boots:</span>{" "}
                          {participant.boots}
                        </div>
                        <div>
                          <span className="font-medium">Gloves:</span>{" "}
                          {participant.gloves}
                        </div>
                        <div>
                          <span className="font-medium">Helmet:</span>{" "}
                          {participant.helmet}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === "messages" && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Contact Messages</h2>
            </div>
            <div className="divide-y">
              {contactMessages.map((msg) => (
                <div key={msg.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold">{msg.name}</h3>
                      <p className="text-sm text-gray-600">{msg.email}</p>
                      <p className="text-sm font-medium mt-2">{msg.subject}</p>
                      <p className="text-sm text-gray-700 mt-1">
                        {msg.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Received: {new Date(msg.createdAt).toLocaleString()}
                      </p>
                      {msg.repliedAt && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ Replied: {new Date(msg.repliedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenReply(msg)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        disabled={!!msg.repliedAt}
                      >
                        Reply
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reply Modal */}
        {replyingToId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 p-6">
              <h3 className="text-xl font-bold mb-4">Reply to Message</h3>
              <form onSubmit={handleSendReply}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">To:</label>
                  <input
                    type="email"
                    value={replyToEmail}
                    onChange={(e) => setReplyToEmail(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Message:
                  </label>
                  <textarea
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    rows={8}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setReplyingToId(null);
                      setReplyBody("");
                    }}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                    disabled={sendingReply}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    disabled={sendingReply}
                  >
                    {sendingReply ? "Sending..." : "Send Reply"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Approval/Rejection Modal */}
        {approvalModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
              <h3 className="text-xl font-bold mb-4">
                {approvalModal.action === "approve"
                  ? "✅ Approve Booking"
                  : "❌ Reject Booking"}
              </h3>
              <p className="text-gray-600 mb-4">
                {approvalModal.action === "approve"
                  ? "You can optionally add a message to the customer with the approval confirmation."
                  : "Please provide a reason for rejecting this booking. This will be sent to the customer."}
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  {approvalModal.action === "approve"
                    ? "Message (optional)"
                    : "Rejection Reason (required)"}
                </label>
                <textarea
                  value={approvalModal.message}
                  onChange={(e) =>
                    setApprovalModal((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={
                    approvalModal.action === "approve"
                      ? "e.g., Looking forward to seeing you!"
                      : "e.g., Sorry, this date is fully booked. Please choose another date."
                  }
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() =>
                    setApprovalModal({
                      open: false,
                      bookingId: null,
                      action: null,
                      message: "",
                    })
                  }
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (
                      approvalModal.action === "approve" &&
                      approvalModal.bookingId
                    ) {
                      handleApprove(approvalModal.bookingId);
                    } else if (
                      approvalModal.action === "reject" &&
                      approvalModal.bookingId
                    ) {
                      handleReject(approvalModal.bookingId);
                    }
                  }}
                  className={`px-4 py-2 rounded-lg text-white ${
                    approvalModal.action === "approve"
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {approvalModal.action === "approve"
                    ? "Approve & Send Email"
                    : "Reject & Notify"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rental Approval/Rejection Modal */}
        {rentalApprovalModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
              <h3 className="text-xl font-bold mb-4">
                {rentalApprovalModal.action === "approve"
                  ? "✅ Approve Rental"
                  : "❌ Reject Rental"}
              </h3>
              <p className="text-gray-600 mb-4">
                {rentalApprovalModal.action === "approve"
                  ? "You can optionally add a message to the customer with the approval confirmation."
                  : "Please provide a reason for rejecting this rental. This will be sent to the customer."}
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  {rentalApprovalModal.action === "approve"
                    ? "Message (optional)"
                    : "Rejection Reason (required)"}
                </label>
                <textarea
                  value={rentalApprovalModal.message}
                  onChange={(e) =>
                    setRentalApprovalModal((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={
                    rentalApprovalModal.action === "approve"
                      ? "e.g., Looking forward to seeing you!"
                      : "e.g., Sorry, this snowmobile is not available. Please choose another date."
                  }
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() =>
                    setRentalApprovalModal({
                      open: false,
                      rentalId: null,
                      action: null,
                      message: "",
                    })
                  }
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (
                      rentalApprovalModal.action === "approve" &&
                      rentalApprovalModal.rentalId
                    ) {
                      handleApproveRental(rentalApprovalModal.rentalId);
                    } else if (
                      rentalApprovalModal.action === "reject" &&
                      rentalApprovalModal.rentalId
                    ) {
                      handleRejectRental(rentalApprovalModal.rentalId);
                    }
                  }}
                  className={`px-4 py-2 rounded-lg text-white ${
                    rentalApprovalModal.action === "approve"
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {rentalApprovalModal.action === "approve"
                    ? "Approve & Send Email"
                    : "Reject & Notify"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
