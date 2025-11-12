"use client";

import { useState } from 'react';
import { getAvailableSnowmobiles, createSnowmobileRental, sendConfirmationEmail } from '@/lib/api';
import { colors } from '@/lib/constants';

export default function SnowmobileRentalPage() {
  const [step, setStep] = useState(1);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [availableSnowmobiles, setAvailableSnowmobiles] = useState<any[]>([]);
  const [selectedSnowmobile, setSelectedSnowmobile] = useState<number | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const HOURLY_RATE = 50; // €50 per hour

  async function checkAvailability() {
    if (!startTime || !endTime) {
      alert('Please select both start and end times');
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      alert('End time must be after start time');
      return;
    }

    setLoading(true);
    try {
      const available = await getAvailableSnowmobiles(startTime, endTime);
      setAvailableSnowmobiles(available);
      setStep(2);
    } catch (error) {
      console.error(error);
      alert('Failed to check availability');
    } finally {
      setLoading(false);
    }
  }

  function calculateTotal() {
    if (!startTime || !endTime) return 0;
    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
    return hours * HOURLY_RATE;
  }

  async function handleBooking(e: React.FormEvent) {
    e.preventDefault();
    
    if (!selectedSnowmobile) {
      alert('Please select a snowmobile');
      return;
    }

    setLoading(true);
    try {
      // Convert to ISO strings
      const startTimeISO = new Date(startTime).toISOString();
      const endTimeISO = new Date(endTime).toISOString();

      // Create the rental
      const rental = await createSnowmobileRental({
        snowmobileId: selectedSnowmobile,
        guestEmail,
        guestName,
        phone,
        startTime: startTimeISO,
        endTime: endTimeISO,
        totalPrice: calculateTotal(),
        notes: `Private snowmobile rental`,
      });

      // Send confirmation email
      try {
        await sendConfirmationEmail({
          email: guestEmail,
          name: guestName,
          tour: `Snowmobile Rental - ${availableSnowmobiles.find(sm => sm.id === selectedSnowmobile)?.name || 'Snowmobile'}`,
          date: new Date(startTime).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          time: `${new Date(startTime).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })} - ${new Date(endTime).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}`,
          total: calculateTotal(),
          bookingId: rental.id.toString(),
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the booking if email fails
      }

      alert('Booking confirmed! Check your email for details.');
      // Reset form
      setStep(1);
      setStartTime('');
      setEndTime('');
      setSelectedSnowmobile(null);
      setGuestName('');
      setGuestEmail('');
      setPhone('');
    } catch (error) {
      console.error(error);
      alert('Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.beige }}>
      <header className="text-white py-12" style={{ backgroundColor: colors.navy }}>
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Snowmobile Rental</h1>
          <p className="text-lg text-gray-300">Book a snowmobile for your private adventure</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        {step === 1 && (
          <div className="rounded-lg shadow-md p-8" style={{ backgroundColor: colors.white }}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: colors.navy }}>
              Check Availability
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.darkGray }}>
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  style={{ color: colors.darkGray }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.darkGray }}>
                  End Time
                </label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  style={{ color: colors.darkGray }}
                />
              </div>

              {startTime && endTime && (
                <div className="p-4 rounded-md" style={{ backgroundColor: `${colors.teal}20` }}>
                  <p className="text-sm" style={{ color: colors.darkGray }}>
                    Duration: {Math.ceil((new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60 * 60))} hours
                  </p>
                  <p className="text-lg font-bold mt-2" style={{ color: colors.navy }}>
                    Estimated Total: €{calculateTotal()}
                  </p>
                </div>
              )}

              <button
                onClick={checkAvailability}
                disabled={loading}
                className="w-full text-white py-3 px-6 rounded-md transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: colors.navy }}
              >
                {loading ? 'Checking...' : 'Check Availability'}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <button
              onClick={() => setStep(1)}
              className="mb-4 hover:underline"
              style={{ color: colors.teal }}
            >
              ← Back to time selection
            </button>

            {availableSnowmobiles.length === 0 ? (
              <div className="rounded-lg shadow-md p-8 text-center" style={{ backgroundColor: colors.white }}>
                <p className="text-xl" style={{ color: colors.darkGray }}>
                  No snowmobiles available for the selected time.
                </p>
                <p className="text-sm mt-2" style={{ color: colors.darkGray, opacity: 0.7 }}>
                  Please try different dates/times.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-6" style={{ color: colors.navy }}>
                  Select a Snowmobile
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
                  {availableSnowmobiles.map((snowmobile) => (
                    <div
                      key={snowmobile.id}
                      onClick={() => setSelectedSnowmobile(snowmobile.id)}
                      className={`rounded-lg shadow-md p-6 cursor-pointer transition ${
                        selectedSnowmobile === snowmobile.id
                          ? 'ring-4'
                          : 'hover:shadow-lg'
                      }`}
                      style={{
                        backgroundColor: colors.white,
                        ringColor: selectedSnowmobile === snowmobile.id ? colors.teal : 'transparent'
                      }}
                    >
                      <h3 className="text-lg font-bold" style={{ color: colors.navy }}>
                        {snowmobile.name}
                      </h3>
                      {snowmobile.model && (
                        <p className="text-sm" style={{ color: colors.darkGray }}>
                          {snowmobile.model}
                        </p>
                      )}
                      {snowmobile.year && (
                        <p className="text-sm" style={{ color: colors.darkGray, opacity: 0.7 }}>
                          Year: {snowmobile.year}
                        </p>
                      )}
                      {snowmobile.licensePlate && (
                        <p className="text-xs mt-2" style={{ color: colors.darkGray, opacity: 0.5 }}>
                          Plate: {snowmobile.licensePlate}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {selectedSnowmobile && (
                  <form onSubmit={handleBooking} className="rounded-lg shadow-md p-8" style={{ backgroundColor: colors.white }}>
                    <h3 className="text-xl font-bold mb-6" style={{ color: colors.navy }}>
                      Your Details
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: colors.darkGray }}>
                          Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-md"
                          style={{ color: colors.darkGray }}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: colors.darkGray }}>
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-md"
                          style={{ color: colors.darkGray }}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: colors.darkGray }}>
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-md"
                          style={{ color: colors.darkGray }}
                        />
                      </div>

                      <div className="p-4 rounded-md" style={{ backgroundColor: `${colors.teal}20` }}>
                        <p className="text-lg font-bold" style={{ color: colors.navy }}>
                          Total: €{calculateTotal()}
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full text-white py-3 px-6 rounded-md transition-opacity hover:opacity-90 disabled:opacity-50"
                        style={{ backgroundColor: colors.navy }}
                      >
                        {loading ? 'Processing...' : 'Confirm Booking'}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}