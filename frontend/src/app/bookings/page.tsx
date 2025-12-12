import { useLanguage } from "@/context/LanguageContext";
import { colors } from "@/lib/constants";

export default function BookingsPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen " style={{ backgroundColor: colors.lightGray }}>
      <h1>Bookings Page</h1>
    </div>
  );
}