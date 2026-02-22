import { useState, useEffect, useCallback } from 'react';

interface Rental {
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
  guestName?: string;
  guestEmail?: string;
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
}

export function useRentalPolling(
  adminToken: string | null,
  intervalMs: number = 30000
) {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRentals = useCallback(async () => {
    if (!adminToken) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reservations`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch rentals');
      }
      
      const data = await response.json();
      setRentals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load rentals:', error);
      setRentals([]);
    } finally {
      setLoading(false);
    }
  }, [adminToken]);

  useEffect(() => {
    if (adminToken) {
      loadRentals();
    }
  }, [adminToken, loadRentals]);

  useEffect(() => {
    if (!adminToken) return;

    const interval = setInterval(() => {
      loadRentals();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [adminToken, intervalMs, loadRentals]);

  const pendingCount = rentals.filter(r => r.approvalStatus === 'pending').length;

  return {
    rentals,
    loading,
    pendingCount,
    refreshRentals: loadRentals,
    setRentals,
  };
}
