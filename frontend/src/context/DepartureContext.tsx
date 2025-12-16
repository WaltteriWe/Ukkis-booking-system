"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface Departure {
  id: number;
  packageId: number;
  departureTime: string;
  reserved: number;
  capacity: number;
  isActive: boolean;
}

interface DepartureContextType {
  selectedDeparture: Departure | null;
  setSelectedDeparture: (departure: Departure | null) => void;
  packageDepartures: Departure[];
  setPackageDepartures: (departures: Departure[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const DepartureContext = createContext<DepartureContextType | undefined>(
  undefined
);

export function DepartureProvider({ children }: { children: ReactNode }) {
  const [selectedDeparture, setSelectedDeparture] = useState<Departure | null>(
    null
  );
  const [packageDepartures, setPackageDepartures] = useState<Departure[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const value: DepartureContextType = {
    selectedDeparture,
    setSelectedDeparture,
    packageDepartures,
    setPackageDepartures,
    loading,
    setLoading,
    error,
    setError,
  };

  return (
    <DepartureContext.Provider value={value}>
      {children}
    </DepartureContext.Provider>
  );
}

export function useDeparture() {
  const context = useContext(DepartureContext);
  if (context === undefined) {
    throw new Error("useDeparture must be used within a DepartureProvider");
  }
  return context;
}