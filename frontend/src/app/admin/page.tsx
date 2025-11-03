"use client";

import { useState, useEffect } from "react";
import { getPackages, createPackage, updatePackage, uploadImage, deletePackage as apiDeletePackage, getBookings, updateBookingStatus, adminLogin, adminRegister } from "@/lib/api";

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
    jacket: string;
    pants: string;
    boots: string;
    gloves: string;
    helmet: string;
  }[];
}

// Note: image listing is not used on this page currently

export default function AdminPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'packages' | 'bookings' | 'participants'>('packages');

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
    active: true
  });

  // Load data only when authenticated. Read token from localStorage on mount.
  useEffect(() => {
    try {
      const t = localStorage.getItem('adminToken');
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

  async function loadData() {
    try {
      setLoading(true);
      const [toursResponse, bookingsData] = await Promise.all([
        getPackages(false), // Get all packages including inactive
        getBookings()
      ]);
      setTours(toursResponse.items);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      console.log("Loaded bookings:", bookingsData);
    } catch (error) {
      console.error("Failed to load data:", error);
      alert("Failed to load data. Check console for details.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    const confirmDelete = window.confirm("Delete this package? This action cannot be undone.");
    if (!confirmDelete) return;
    try {
      await apiDeletePackage(id);
      // Optimistic update: remove from local state
      setTours(prev => prev.filter(t => t.id !== id));
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to delete package";
      alert(message);
    }
  }

  // Handle status update
  async function handleStatusUpdate(bookingId: number, newStatus: 'confirmed' | 'pending' | 'cancelled') {
    try {
      await updateBookingStatus(bookingId, newStatus);
      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus }
          : booking
      ));
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update booking status");
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
      setFormData(prev => ({
        ...prev,
        imageUrl: response.url
      }));
      
      alert("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image");
    }
  }

  // Admin auth handlers
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await adminLogin(authEmail, authPassword);
      if (res.token) {
        try { localStorage.setItem('adminToken', res.token); } catch {}
        setAdminToken(res.token);
      } else {
        alert(res.message || 'Login successful');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      alert(msg);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await adminRegister(authName, authEmail, authPassword);
      if (res.token) {
        try { localStorage.setItem('adminToken', res.token); } catch {}
        setAdminToken(res.token);
      } else {
        alert(res.message || 'Registration successful');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      alert(msg);
    }
  }

  function handleLogout() {
    try { localStorage.removeItem('adminToken'); } catch {}
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
      active: formData.active
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
        active: true
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
      active: tour.active
    });
    setShowCreateForm(true);
  }

  // Flatten participants from bookings for the Participants tab
  const participantsList = bookings.flatMap((b) => (b.participantGear ?? []).map((pg) => ({
    ...pg,
    bookingId: b.id,
    guestName: b.guest.name,
    guestEmail: b.guest.email,
    packageName: b.departure.package.name,
    departureTime: b.departure.departureTime
  })));

  // Participants view state: allow filtering by booking and searching by name
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [participantSearch, setParticipantSearch] = useState("");
  // Auth form state (client-side)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  // If not authenticated, show login/register form
  if (!adminToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Admin {authMode === 'login' ? 'Login' : 'Register'}</h2>
          <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-4">
            {authMode === 'register' && (
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input value={authName} onChange={(e) => setAuthName(e.target.value)} className="w-full border rounded px-3 py-2" required />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="w-full border rounded px-3 py-2" required />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">{authMode === 'login' ? 'Login' : 'Register'}</button>
              <button type="button" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="px-4 py-2 border rounded">{authMode === 'login' ? 'Switch to Register' : 'Switch to Login'}</button>
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
            {activeTab === 'packages' && (
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
                    active: true
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
              setActiveTab('packages');
              setShowCreateForm(false);
            }}
            className={`px-4 py-2 font-medium border-b-2 ${
              activeTab === 'packages'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Packages ({tours.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('bookings');
              setShowCreateForm(false);
            }}
            className={`px-4 py-2 font-medium border-b-2 ${
              activeTab === 'bookings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Bookings ({bookings.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('participants');
              setShowCreateForm(false);
            }}
            className={`px-4 py-2 font-medium border-b-2 ${
              activeTab === 'participants'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Participants ({bookings.reduce((acc, b) => acc + (b.participantGear?.length ?? 0), 0)})
          </button>
        </div>

        {/* Create/Edit Form */}
        {activeTab === 'packages' && showCreateForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">
              {editingTour ? "Edit Package" : "Create New Package"}
            </h2>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border rounded px-3 py-2 h-20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Base Price (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, basePrice: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.durationMin}
                  onChange={(e) => setFormData(prev => ({ ...prev, durationMin: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Capacity</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as "Easy" | "Moderate" | "Advanced" }))}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="Easy">Easy</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full border rounded px-3 py-2"
                />
                {formData.imageUrl && (
                  <div className="mt-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={formData.imageUrl} alt="Preview" className="h-20 w-20 object-cover rounded" />
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
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
        {activeTab === 'packages' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Existing Packages</h2>
            </div>
            
            <div className="divide-y">
              {tours.map((tour) => (
                <div key={tour.id} className="p-6 flex items-center justify-between">
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
                        €{tour.basePrice} • {Math.floor(tour.durationMin / 60)}h {tour.durationMin % 60}min • {tour.difficulty}
                      </p>
                      <span className={`inline-block px-2 py-1 text-xs rounded ${
                        tour.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {tour.active ? 'Active' : 'Inactive'}
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
        )}

        {/* Participants List */}
        {activeTab === 'participants' && (
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
                if (selectedBookingId) filtered = filtered.filter(p => p.bookingId === selectedBookingId);
                if (q.length > 0) {
                  filtered = filtered.filter(p => 
                    (p.name || '').toLowerCase().includes(q) ||
                    (p.guestName || '').toLowerCase().includes(q) ||
                    (p.packageName || '').toLowerCase().includes(q)
                  );
                }

                if (filtered.length === 0) {
                  return <div className="text-center py-12 text-gray-500">No participants found</div>;
                }

                // Group by booking
                const groups = filtered.reduce((acc: Record<number, typeof filtered>, p) => {
                  acc[p.bookingId] = acc[p.bookingId] || [];
                  acc[p.bookingId].push(p);
                  return acc;
                }, {} as Record<number, typeof filtered>);

                // Render groups sorted by booking id descending
                return Object.keys(groups)
                  .map(Number)
                  .sort((a, b) => b - a)
                  .map((bookingId) => {
                    const items = groups[bookingId].sort((x, y) => (x.name || '').localeCompare(y.name || ''));
                    const sample = items[0];
                    return (
                      <div key={bookingId} className="p-4 md:p-6">
                        <div className="mb-3">
                          <div className="font-semibold">Booking #{bookingId} • {sample.packageName}</div>
                          <div className="text-xs text-gray-500">Departure: {new Date(sample.departureTime).toLocaleDateString('fi-FI', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {items.map((p) => (
                            <div key={p.id} className="py-3">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                {/* Left: gear items */}
                                <div className="flex-1">
                                  <div className="mt-1 text-sm text-gray-600 flex flex-wrap md:flex-nowrap items-center gap-2 md:gap-4 md:text-base overflow-x-auto">
                                    <span className="whitespace-nowrap">Jacket: <span className="font-medium text-gray-900">{p.jacket}</span></span>
                                    <span className="hidden md:inline-block text-gray-300">•</span>
                                    <span className="whitespace-nowrap">Pants: <span className="font-medium text-gray-900">{p.pants}</span></span>
                                    <span className="hidden md:inline-block text-gray-300">•</span>
                                    <span className="whitespace-nowrap">Boots: <span className="font-medium text-gray-900">{p.boots}</span></span>
                                    <span className="hidden md:inline-block text-gray-300">•</span>
                                    <span className="whitespace-nowrap">Gloves: <span className="font-medium text-gray-900">{p.gloves}</span></span>
                                    <span className="hidden md:inline-block text-gray-300">•</span>
                                    <span className="whitespace-nowrap">Helmet: <span className="font-medium text-gray-900">{p.helmet}</span></span>
                                  </div>
                                </div>
                                {/* Right: participant name + email (no card) */}
                                <div className="text-right md:w-56">
                                  <div className="text-sm font-semibold text-gray-900">{p.name || 'Participant'}</div>
                                  <div className="text-xs text-gray-500 mt-1">{p.guestEmail}</div>
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

        {/* Bookings List */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">All Bookings</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Package</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Departure</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Participants & Gear</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
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
                          <div className="font-medium text-gray-900">{booking.guest.name}</div>
                          <div className="text-gray-500">{booking.guest.email}</div>
                          {booking.guest.phone && (
                            <div className="text-gray-500">{booking.guest.phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {booking.departure.package.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(booking.departure.departureTime).toLocaleDateString('fi-FI', {
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="font-medium text-gray-900">{booking.participants} participant{booking.participants > 1 ? 's' : ''}</div>
                        <div className="mt-2">
                          <button
                            onClick={() => { setActiveTab('participants'); setSelectedBookingId(booking.id); }}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            View participants
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        €{typeof booking.totalPrice === 'number' 
                          ? booking.totalPrice.toFixed(2) 
                          : Number(booking.totalPrice).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={booking.status}
                          onChange={(e) => handleStatusUpdate(booking.id, e.target.value as 'confirmed' | 'pending' | 'cancelled')}
                          className={`px-3 py-1 text-xs font-semibold rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${
                            booking.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : booking.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <option value="confirmed">confirmed</option>
                          <option value="pending">pending</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(booking.createdAt).toLocaleDateString('fi-FI', {
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
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
      </div>
    </div>
  );
}