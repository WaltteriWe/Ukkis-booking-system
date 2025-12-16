// frontend/src/hooks/useDepartures.ts
import { useState } from "react";
import { getDepartures } from "@/lib/api";

interface Departure {
  id: number;
  packageId: number;
  departureTime: string;
  reserved: number;
  capacity: number;
  isActive: boolean;
}

export function useDepartures() {
  const [packageDepartures, setPackageDepartures] = useState<Departure[]>([]);
  const [selectedDeparture, setSelectedDeparture] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePackageSelect = async (packageId: number) => {
  setLoading(true);
  setError(null);
  try {
    console.log("Fetching departures for packageId:", packageId);
    
    const response = await getDepartures({ 
      packageId, 
      onlyAvailable: true 
    });
    
    console.log("Raw response:", response);
    
    const departures = Array.isArray(response) 
      ? response 
      : response.items || [];
    
    console.log("Parsed departures:", departures);
    console.log("Departures length:", departures.length);
    
    setPackageDepartures(departures);
    setSelectedDeparture(null);
  } catch (err) {
    console.error("Failed to load departures:", err);
    setError("Failed to load departures");
    setPackageDepartures([]);
  } finally {
    setLoading(false);
  }
};

  return {
    packageDepartures,
    selectedDeparture,
    loading,
    error,
    handlePackageSelect,
    setSelectedDeparture,
  };
}