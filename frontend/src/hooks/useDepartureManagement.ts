import { useState } from "react";
import { createDeparture, getDepartures, deleteDeparture, updateDeparture } from "@/lib/api";

interface Departure {
  id: number;
  departureTime: string;
  capacity: number;
  reserved: number;
  packageId: number;
}

export function useDepartureManagement() {
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [showDepartureForm, setShowDepartureForm] = useState(false);
  const [editingDepartureId, setEditingDepartureId] = useState<number | null>(null);
  const [selectedPackageForDeparture, setSelectedPackageForDeparture] = useState<number | null>(null);
  const [newDeparture, setNewDeparture] = useState({
    departureTime: "",
    capacity: 10,
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const loadDepartures = async () => {
    try {
      const response = await getDepartures();
      const depsArray = Array.isArray(response) ? response : response.items || [];
      setDepartures(depsArray);
    } catch (error) {
      console.error("Failed to load departures:", error);
      setDepartures([]);
    }
  };

  const handleCreateDeparture = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const departureDateTime = new Date(newDeparture.departureTime).toISOString();

      if (editingDepartureId) {
        // Update existing departure
        const updatedDeparture = await updateDeparture(editingDepartureId, {
          packageId: parseInt(selectedPackageForDeparture?.toString() || "0"),
          departureTime: departureDateTime,
          capacity: newDeparture.capacity,
        });

        setDepartures((prev) =>
          prev.map((d) => (d.id === editingDepartureId ? updatedDeparture : d))
        );
      } else {
        // Create new departure
        const createdDeparture = await createDeparture({
          packageId: parseInt(selectedPackageForDeparture?.toString() || "0"),
          departureTime: departureDateTime,
          capacity: newDeparture.capacity,
        });

        setDepartures([...departures, createdDeparture]);
      }

      setNewDeparture({ departureTime: "", capacity: 10 });
      setShowDepartureForm(false);
      setEditingDepartureId(null);
      setSelectedDate(null);
      setSelectedPackageForDeparture(null);
    } catch (error) {
      console.error("Failed to save departure:", error);
      throw error;
    }
  };

  const handleDeleteDeparture = async (departureId: number) => {
    const confirmed = window.confirm(
      "Delete this departure? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      await deleteDeparture(departureId);
      setDepartures((prev) => prev.filter((d) => d.id !== departureId));
    } catch (error) {
      console.error("Failed to delete departure:", error);
      throw error;
    }
  };

  const handleEditDeparture = (departure: Departure) => {
    setEditingDepartureId(departure.id);
    setSelectedPackageForDeparture(departure.packageId);
    setNewDeparture({
      departureTime: departure.departureTime,
      capacity: departure.capacity,
    });
    setShowDepartureForm(true);
  };

  const handleCancelEdit = () => {
    setEditingDepartureId(null);
    setNewDeparture({ departureTime: "", capacity: 10 });
    setShowDepartureForm(false);
    setSelectedPackageForDeparture(null);
  };

  return {
    departures,
    showDepartureForm,
    setShowDepartureForm,
    editingDepartureId,
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
    
  };
}