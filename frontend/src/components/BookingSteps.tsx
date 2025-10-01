type BookingStepsProps = {
  step: 1 | 2 | 3;
};

export default function BookingSteps({ step }: BookingStepsProps) {
  const items = [
    { n: 1 as const, label: "Select Tour" },
    { n: 2 as const, label: "Customize" },
    { n: 3 as const, label: "Confirm" },
  ];

  return (
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
          {items.map((s) => (
            <div key={s.n} className="flex items-center gap-3">
              <div
                className={
                  "h-10 w-10 rounded-full grid place-items-center text-white font-bold " +
                  (step >= s.n ? "bg-[#ffb64d]" : "bg-gray-300")
                }
              >
                {s.n}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-[#101651]">
                  {s.label}
                </div>
                <div className="mt-1 h-1 w-full rounded bg-gray-200">
                  <div
                    className={
                      "h-1 rounded " +
                      (step > s.n
                        ? "w-full bg-[#ffb64d]"
                        : step === s.n
                        ? "w-1/3 bg-[#ffb64d]"
                        : "w-0")
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
