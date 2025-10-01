type Addon = { id: string; title: string; desc: string; price: number };

type CustomizeSectionProps = {
  date: string;
  time: string;
  participants: number;
  total: number;
  addons: Record<string, boolean>;
  addonList: Addon[];
  onChangeDate: (v: string) => void;
  onChangeTime: (v: string) => void;
  onChangeParticipants: (v: number) => void;
  onToggleAddon: (id: string) => void;
  onContinue: () => void;
};

export default function CustomizeSection({
  date,
  time,
  participants,
  total,
  addons,
  addonList,
  onChangeDate,
  onChangeTime,
  onChangeParticipants,
  onToggleAddon,
  onContinue,
}: CustomizeSectionProps) {
  return (
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
              onChange={(e) => onChangeDate(e.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ffb64d]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#101651]">Select Start Time</label>
            <select
              value={time}
              onChange={(e) => onChangeTime(e.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ffb64d]"
            >
              {["09:00", "10:00", "12:00", "14:00"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#101651]">Number of Participants</label>
            <div className="mt-2 flex items-center gap-3">
              <button
                onClick={() => onChangeParticipants(Math.max(1, participants - 1))}
                className="h-10 w-10 rounded-xl border border-gray-300 bg-white text-xl"
              >
                –
              </button>
              <div className="w-10 text-center text-xl font-bold">{participants}</div>
              <button
                onClick={() => onChangeParticipants(participants + 1)}
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
          {addonList.map((a) => (
            <label
              key={a.id}
              className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={!!addons[a.id]}
                  onChange={() => onToggleAddon(a.id)}
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
            onClick={onContinue}
            className="rounded-full bg-gradient-to-r from-[#ffb64d] to-[#ff8c3a] px-6 py-3 text-white font-semibold shadow"
          >
            Continue to Booking →
          </button>
        </div>
      </div>
    </section>
  );
}
