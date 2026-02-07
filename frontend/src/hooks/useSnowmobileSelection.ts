import { useState, useCallback } from 'react';

interface Snowmobile {
  id: number;
  name: string;
  licensePlate?: string;
  model?: string;
  imageUrl?: string;
  description?: string;
  seating?: string;
  maxPassengers: number;
  currentPassengers: number;
  availableSpots: number;
  isAvailable: boolean;
}

export function useSnowmobileSelection() {
  const [availableSnowmobiles, setAvailableSnowmobiles] = useState<Snowmobile[]>([]);
  const [selectedSnowmobiles, setSelectedSnowmobiles] = useState<Record<number, number>>({});
  const [loadingSnowmobiles, setLoadingSnowmobiles] = useState(false);

  const loadSnowmobiles = useCallback(async (departureId: number, fetchFn: (id: number) => Promise<Snowmobile[]>) => {
    try {
      setLoadingSnowmobiles(true);
      const snowmobiles = await fetchFn(departureId);
      setAvailableSnowmobiles(snowmobiles);
      setSelectedSnowmobiles({}); // Reset selections
    } catch (error) {
      console.error('Failed to load snowmobiles:', error);
      setAvailableSnowmobiles([]);
    } finally {
      setLoadingSnowmobiles(false);
    }
  }, []);

  const incrementSnowmobile = useCallback((snowmobileId: number, maxPassengers: number, availableSpots: number, totalParticipants: number) => {
    setSelectedSnowmobiles(prev => {
      const current = prev[snowmobileId] || 0;
      const totalAssigned = Object.values(prev).reduce((sum, count) => sum + count, 0);
      
      if (current < 2 && current < availableSpots && totalAssigned < totalParticipants) {
        return {
          ...prev,
          [snowmobileId]: current + 1
        };
      }
      return prev;
    });
  }, []);

  const decrementSnowmobile = useCallback((snowmobileId: number) => {
    setSelectedSnowmobiles(prev => ({
      ...prev,
      [snowmobileId]: Math.max(0, (prev[snowmobileId] || 0) - 1)
    }));
  }, []);

  const getTotalAssigned = useCallback(() => {
    return Object.values(selectedSnowmobiles).reduce((sum, count) => sum + count, 0);
  }, [selectedSnowmobiles]);

  const getSnowmobileAssignments = useCallback(() => {
    return Object.entries(selectedSnowmobiles)
      .filter(([_, count]) => count > 0)
      .map(([snowmobileId, passengerCount]) => ({
        snowmobileId: parseInt(snowmobileId),
        passengerCount,
      }));
  }, [selectedSnowmobiles]);

  const resetSelections = useCallback(() => {
    setSelectedSnowmobiles({});
  }, []);

  return {
    availableSnowmobiles,
    selectedSnowmobiles,
    loadingSnowmobiles,
    loadSnowmobiles,
    incrementSnowmobile,
    decrementSnowmobile,
    getTotalAssigned,
    getSnowmobileAssignments,
    resetSelections,
  };
}
