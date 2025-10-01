export type TourCard = {
  id: string;
  title: string;
  duration: string;
  capacity: string;
  difficulty: string;
  price: number;
  image: string;
};

type Props = {
  tours: TourCard[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onContinue: () => void;
};

export default function TourSelection({
  tours,
  selectedId,
  onSelect,
  onContinue,
}: Props) {
  return (
    <section>
      <h1 className="text-4xl font-extrabold text-[#101651]">
        Choose Your Arctic Adventure
      </h1>
      <p className="mt-2 text-lg text-[#3b4463]">
        Select from our premium collection of Lapland experiences
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tours.map((t) => {
          const active = selectedId === t.id;
          return (
            <button
              type="button"
              key={t.id}
              onClick={() => onSelect(t.id)}
              className={
                "group relative text-left rounded-3xl border bg-white shadow-sm transition hover:shadow " +
                (active
                  ? "border-[#ffb64d] ring-2 ring-[#ffb64d]/40"
                  : "border-gray-200")
              }
            >
              <div className="overflow-hidden rounded-t-3xl flex justify-center items-center bg-gray-100">
                <img
                  src={t.image}
                  alt={t.title}
                  className="h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
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
                  <span className="text-base font-semibold text-[#3b4463]">
                    /person
                  </span>
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
          onClick={onContinue}
          className="rounded-full bg-gradient-to-r from-[#ffb64d] to-[#ff8c3a] px-6 py-3 text-white font-semibold shadow hover:opacity-95"
        >
          Continue
        </button>
      </div>
    </section>
  );
}
