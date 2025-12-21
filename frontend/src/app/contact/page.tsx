"use client";

import { colors } from "@/lib/constants";
import { useLanguage } from "@/context/LanguageContext";
import { Mail, MapPin, Phone } from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useTheme } from "@/context/ThemeContext";

// Dynamically import the Map component to avoid SSR issues
const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
});

export default function Contact() {
  const { t } = useLanguage();
  const { darkMode } = useTheme();
  const position = useMemo(
    () => ({ lat: 64.7498157270232, lng: 28.257191314126082 }),
    []
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    const formEl = e.currentTarget as HTMLFormElement;
    const form = new FormData(formEl);
    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone"),
      subject: form.get("subject"),
      message: form.get("message"),
    };

    try {
      const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
      const res = await fetch(`${base}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok) {
        setMessage(t("messageSent"));
        formEl.reset();
      } else {
        setMessage(json?.error || t("errorOccurred"));
      }
    } catch (err) {
      console.error(err);
      setMessage(t("connectionFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        backgroundColor: darkMode ? "transparent" : colors.beige,
        background: darkMode
          ? "linear-gradient(135deg, #1a1a2e 0%, #16243a 30%, #2d1a3a 60%, #2a3a4e 100%)"
          : colors.beige,
      }}
      className="min-h-screen rounded-lg"
    >
      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: darkMode ? "#10b981" : colors.navy }}
          >
            {t("contactPageTitle")}
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: darkMode ? "rgba(255, 255, 255, 0.7)" : "#666" }}
          >
            {t("contactPageSubtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 object-center text-center ">
          {/* Contact Information */}
          <div
            className="rounded-lg shadow-lg p-8"
            style={{
              backgroundColor: darkMode ? "#1a1a2e" : colors.white,
              color: darkMode ? "white" : colors.darkGray,
            }}
          >
            <h2
              className="text-2xl font-bold mb-6 text-center object-center"
              style={{ color: darkMode ? "#10b981" : colors.navy }}
            >
              {t("getInTouch")}
            </h2>

            <div className="space-y-6 flex flex-col items-center">
              {/* Address */}
              <div className="flex items-center space-x-3">
                <div
                  className="rounded-full p-3 flex-shrink-0 flex items-center justify-center"
                  style={{
                    backgroundColor: colors.pink,
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div className="text-center">
                  <h3
                    className="font-semibold text-lg"
                    style={{ color: darkMode ? "#10b981" : colors.navy }}
                  >
                    {t("address")}
                  </h3>
                  <p
                    className="text-sm"
                    style={{
                      color: darkMode ? "rgba(255, 255, 255, 0.7)" : "#666",
                    }}
                  >
                    Ukkohallantie 5<br />
                    89400 Hyrynsalmi
                    <br />
                    Finland
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center space-x-3">
                <div
                  className="rounded-full p-3 flex-shrink-0 flex items-center justify-center"
                  style={{
                    backgroundColor: colors.pink,
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div className="text-center">
                  <h3
                    className="font-semibold text-lg"
                    style={{ color: darkMode ? "#10b981" : colors.navy }}
                  >
                    {t("phone")}
                  </h3>
                  <a
                    href="tel:+358401306777"
                    className="hover:underline text-sm"
                    style={{
                      color: darkMode ? "rgba(255, 255, 255, 0.7)" : "#666",
                    }}
                  >
                    +358 40 1306777
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center space-x-3">
                <div
                  className="rounded-full p-3 flex-shrink-0 flex items-center justify-center"
                  style={{
                    backgroundColor: colors.pink,
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div className="text-center">
                  <h3
                    className="font-semibold text-lg"
                    style={{ color: darkMode ? "#10b981" : colors.navy }}
                  >
                    {t("email")}
                  </h3>
                  <a
                    href="mailto:info@ukkis.fi"
                    className="hover:underline text-sm"
                    style={{
                      color: darkMode ? "rgba(255, 255, 255, 0.7)" : "#666",
                    }}
                  >
                    info@ukkis.fi
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div
            className="rounded-lg shadow-lg p-8"
            style={{
              backgroundColor: darkMode ? "#1a1a2e" : colors.white,
              color: darkMode ? "white" : colors.darkGray,
            }}
          >
            <h2
              className="text-2xl font-bold mb-6 text-center"
              style={{ color: darkMode ? "#10b981" : colors.navy }}
            >
              {t("sendUsMessage")}
            </h2>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-1"
                  style={{ color: darkMode ? "white" : colors.darkGray }}
                >
                  {t("name")} {t("required")}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  style={{
                    backgroundColor: darkMode ? "#16243a" : "white",
                    borderColor: darkMode ? "#2d1a3a" : "#ddd",
                    color: darkMode ? "white" : colors.darkGray,
                  }}
                  placeholder={t("yourName")}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-1"
                  style={{ color: darkMode ? "white" : colors.darkGray }}
                >
                  {t("email")} {t("required")}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  style={{
                    backgroundColor: darkMode ? "#16243a" : "white",
                    borderColor: darkMode ? "#2d1a3a" : "#ddd",
                    color: darkMode ? "white" : colors.darkGray,
                  }}
                  placeholder={t("yourEmail")}
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium mb-1"
                  style={{ color: darkMode ? "white" : colors.darkGray }}
                >
                  {t("phone")}
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  style={{
                    backgroundColor: darkMode ? "#16243a" : "white",
                    borderColor: darkMode ? "#2d1a3a" : "#ddd",
                    color: darkMode ? "white" : colors.darkGray,
                  }}
                  placeholder="+358 XX XXXXXXX"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium mb-1"
                  style={{ color: darkMode ? "white" : colors.darkGray }}
                >
                  {t("subject")} {t("required")}
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  style={{
                    backgroundColor: darkMode ? "#16243a" : "white",
                    borderColor: darkMode ? "#2d1a3a" : "#ddd",
                    color: darkMode ? "white" : colors.darkGray,
                  }}
                  placeholder={t("whatIsThisRegarding")}
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium mb-1"
                  style={{ color: darkMode ? "white" : colors.darkGray }}
                >
                  {t("message")} {t("required")}
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                  style={{
                    backgroundColor: darkMode ? "#16243a" : "white",
                    borderColor: darkMode ? "#2d1a3a" : "#ddd",
                    color: darkMode ? "white" : colors.darkGray,
                  }}
                  placeholder={t("tellUsMore")}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white font-medium rounded-full px-6 py-3 transition-all hover:opacity-90"
                style={{ backgroundColor: colors.pink }}
              >
                {loading ? t("sending") : t("sendMessage")}
              </button>
              {message && (
                <p
                  className="text-center mt-2"
                  style={{ color: darkMode ? "#10b981" : "#666" }}
                >
                  {message}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Map Section */}
        <div
          className="mt-12 rounded-lg shadow-lg p-4"
          style={{
            backgroundColor: darkMode ? "#1a1a2e" : colors.white,
          }}
        >
          <h2
            className="text-2xl font-bold mb-4 px-4 pt-4 text-center"
            style={{ color: darkMode ? "#10b981" : colors.navy }}
          >
            {t("findUs")}
          </h2>
          <Map position={position} />
        </div>
      </main>
    </div>
  );
}
