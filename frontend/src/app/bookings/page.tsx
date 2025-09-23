"use client";

import { useState } from "react";
import Link from "next/link";

type Tour = {
  id: string;
  title: string;
  duration: string;
  capacity: string;
  difficulty: "Easy" | "Moderate" | "Advanced";
  price: number; // €/person
  image: string; // käytä public/ -polkuja esim. /images/tour-1.jpg
};

type Addon = { id: string; title: string; desc: string; price: number };

const TOURS: Tour[] = [
  {
    id: "wilderness",
    title: "Arctic Wilderness Safari",
    duration: "4 hours",
    capacity: "Max 8 people",
    difficulty: "Moderate",
    price: 120,
    image: "/images/tour-1.jpg",
  },
  {
    id: "family",
    title: "Family Adventure",
    duration: "2.5 hours",
    capacity: "Max 12 people",
    difficulty: "Easy",
    price: 85,
    image: "/images/tour-2.jpg",
  },
  {
    id: "extreme",
    title: "Extreme Arctic",
    duration: "6 hours",
    capacity: "Max 6 people",
    difficulty: "Advanced",
    price: 180,
    image: "/images/tour-3.jpg",
  },
];

const ADDONS: Addon[] = [
  { id: "photo", title: "Professional Photography", desc: "High-quality photos of your adventure", price: 35 },
  { id: "meal", title: "Hot Meal & Drinks", desc: "Traditional Lapland lunch by campfire", price: 25 },
  { id: "pickup", title: "Hotel Pickup & Drop-off", desc: "Convenient transportation service", price: 15 },
];

export default function Bookings() {
  // stepper (1: select, 2: customize, 3: confirm)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // state
  const [selectedTour, setSelectedTour] = useState<Tour | null>(TOURS[0]);
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("10:00");
  const [participants, setParticipants] = useState<number>(2);
  const [addons, setAddons] = useState<Record<string, boolean>>({});

  const toggleAddon = (id: string) => setAddons((a) => ({ ...a, [id]: !a[id] }));

  const selectedAddons = Object.entries(addons)
    .filter(([, v]) => v)
    .map(([k]) => ADDONS.find((x) => x.id === k)!)
    .filter(Boolean);

  const total =
    (selectedTour?.price ?? 0) * participants +
    selectedAddons.reduce((sum, a) => sum + a.price, 0);

  return (
    <div className="min-h-screen bg-[#f7fbf9]">
      {/* Header + Stepper */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-5 flex items-center justify-between">
          <div className="text-2xl font-extrabold text-[#101651]">
            Ukkis <span className="text-[#101651]">Safaris</span>
          </div>

          <a
            href="/booking"
            className="rounded-full bg-gradient-to-r from-[#ffb64d] to-[#ff8c3a] px-5 py-2 text-white font-semibold shadow"
          >
            Book Now
          </a>
        </div>

        {/* Stepper */}
        <div className="mx-auto max-w-6xl px-4 pb-6">
          <div className="grid grid-cols-3 gap-6">
            {[
              { n: 1, label: "Select Tour" },
              { n: 2, label: "Customize" },
              { n: 3, label: "Confirm" },
            ].map((s) => (
              <div key={s.n} className="flex items-center gap-3">
                <div
                  className={
                    "h-10 w-10 rounded-full grid place-items-center text-white font-bold " +
                    (step >= (s.n as 1 | 2 | 3) ? "bg-[#ffb64d]" : "bg-gray-300")
                  }
                >
                  {s.n}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-[#101651]">{s.label}</div>
                  <div className="mt-1 h-1 w-full rounded bg-gray-200">
                    <div
                      className={
                        "h-1 rounded " +
                        (step > (s.n as 1 | 2 | 3) ? "w-full bg-[#ffb64d]" : step === s.n ? "w-1/3 bg-[#ffb64d]" : "w-0")
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="mx-auto max-w-6xl px-4 py-10 space-y-12">
        {/* STEP 1: SELECT TOUR */}
        {step === 1 && (
          <section>
            <h1 className="text-4xl font-extrabold text-[#101651]">
              Choose Your Arctic Adventure
            </h1>
            <p className="mt-2 text-lg text-[#3b4463]">
              Select from our premium collection of Lapland experiences
            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {TOURS.map((t) => {
                const active = selectedTour?.id === t.id;
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setSelectedTour(t)}
                    className={
                      "relative text-left rounded-3xl border bg-white shadow-sm transition hover:shadow " +
                      (active ? "border-[#ffb64d] ring-2 ring-[#ffb64d]/40" : "border-gray-200")
                    }
                  >
                    <div className="overflow-hidden rounded-t-3xl">
                      <img src={t.image} alt={t.title} className="h-56 w-full object-cover" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-[#101651] hover:underline">
                        {t.title}
                      </h3>
                      <ul className="mt-3 space-y-1 text-[#3b4463]">
                        <li>🕒 {t.duration}</li>
                        <li>👥 {t.capacity}</li>
                        <li>⭐ Difficulty: {t.difficulty}</li>
                      </ul>
                      <div className="mt-4 text-2xl font-extrabold text-[#ff8c3a]">
                        €{t.price}
                        <span className="text-base font-semibold text-[#3b4463]">/person</span>
                      </div>
                    </div>
                    {active && (
                      <span className="absolute left-4 top-4 rounded-full bg-[#ffb64d] px-3 py-1 text-sm font-semibold text-white shadow">
                        Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="rounded-full bg-gradient-to-r from-[#ffb64d] to-[#ff8c3a] px-6 py-3 text-white font-semibold shadow hover:opacity-95"
              >
                Continue
              </button>
            </div>
          </section>
        )}

        {/* STEP 2: CUSTOMIZE */}
        {step === 2 && (
          <section className="grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-extrabold text-[#101651]">Customize Your Experience</h2>
              <p className="mt-1 text-[#3b4463]">Personalize your Arctic adventure</p>

              <div className="mt-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-[#101651]">Select Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ffb64d]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#101651]">Select Start Time</label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ffb64d]"
                  >
                    {["09:00", "10:00", "12:00", "14:00"].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#101651]">Number of Participants</label>
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      onClick={() => setParticipants((p) => Math.max(1, p - 1))}
                      className="h-10 w-10 rounded-xl border border-gray-300 bg-white text-xl"
                    >
                      –
                    </button>
                    <div className="w-10 text-center text-xl font-bold">{participants}</div>
                    <button
                      onClick={() => setParticipants((p) => p + 1)}
                      className="h-10 w-10 rounded-xl border border-gray-300 bg-white text-xl"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-extrabold text-[#101651]">Add-on Services</h3>
              <div className="mt-4 space-y-4">
                {ADDONS.map((a) => (
                  <label
                    key={a.id}
                    className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={!!addons[a.id]}
                        onChange={() => toggleAddon(a.id)}
                        className="mt-1 h-5 w-5 rounded border-gray-300"
                      />
                      <div>
                        <div className="font-semibold text-[#101651]">{a.title}</div>
                        <div className="text-sm text-[#3b4463]">{a.desc}</div>
                      </div>
                    </div>
                    <div className="shrink-0 font-semibold text-[#ff8c3a]">+€{a.price}</div>
                  </label>
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#101651]">Estimated Total</span>
                  <span className="text-2xl font-extrabold text-[#ff8c3a]">€{total}</span>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setStep(3)}
                  className="rounded-full bg-gradient-to-r from-[#ffb64d] to-[#ff8c3a] px-6 py-3 text-white font-semibold shadow"
                >
                  Continue to Booking →
                </button>
              </div>
            </div>
          </section>
        )}

        {/* STEP 3: CONFIRM */}
        {step === 3 && (
          <section className="max-w-3xl">
            <h2 className="text-3xl font-extrabold text-[#101651]">Confirm</h2>
            <div className="mt-6 space-y-3 rounded-2xl bg-white p-6 shadow">
              <Row label="Tour" value={selectedTour?.title ?? "-"} />
              <Row label="Date" value={date || "-"} />
              <Row label="Start time" value={time} />
              <Row label="Participants" value={participants} />
              <Row
                label="Add-ons"
                value={selectedAddons.length ? selectedAddons.map((a) => a.title).join(", ") : "None"}
              />
              <Row label="Total" value={`€${total}`} />
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => setStep(2)}
                className="rounded-full border border-gray-300 bg-white px-6 py-3 font-semibold text-[#101651]"
              >
                Back
              </button>
              <button
                onClick={() => alert("Booking submitted (demo)")}
                className="rounded-full bg-gradient-to-r from-[#33c38b] to-[#0ea676] px-6 py-3 text-white font-semibold shadow"
              >
                Confirm & Pay
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between border-b border-gray-100 pb-3 last:border-0">
      <span className="text-[#3b4463]">{label}</span>
      <span className="font-semibold text-[#101651]">{value}</span>
    </div>
  );
}
