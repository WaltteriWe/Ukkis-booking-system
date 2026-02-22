import { useState, useEffect, useCallback } from 'react';

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
  guestName: string;
  guestEmail: string;
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

export function useBookingPolling(
  adminToken: string | null,
  intervalMs: number = 30000
) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const loadBookings = useCallback(async () => {
    if (!adminToken) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      
      const data = await response.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [adminToken]);

  useEffect(() => {
    if (adminToken) {
      loadBookings();
    }
  }, [adminToken, loadBookings]);

  useEffect(() => {
    if (!adminToken) return;

    const interval = setInterval(() => {
      loadBookings();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [adminToken, intervalMs, loadBookings]);

  const pendingCount = bookings.filter(b => b.approvalStatus === 'pending').length;

  return {
    bookings,
    loading,
    pendingCount,
    refreshBookings: loadBookings,
    setBookings,
  };
}
