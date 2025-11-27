"use client";

import { colors } from "@/lib/constants";
import { useLanguage } from "@/context/LanguageContext";
import { Mail, MapPin, Phone } from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

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
    <div className="min-h-screen" style={{ backgroundColor: colors.beige }}>
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: colors.navy }}
          >
            {t("contactPageTitle")}
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            {t("contactPageSubtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2
              className="text-2xl font-bold mb-6"
              style={{ color: colors.navy }}
            >
              {t("getInTouch")}
            </h2>

            <div className="space-y-6">
              {/* Address */}
              <div className="flex items-start space-x-4">
                <div
                  className="rounded-full p-3"
                  style={{ backgroundColor: colors.pink }}
                >
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3
                    className="font-semibold text-lg mb-1"
                    style={{ color: colors.navy }}
                  >
                    {t("address")}
                  </h3>
                  <p className="text-gray-700">
                    Ukkohallantie 5<br />
                    89400 Hyrynsalmi
                    <br />
                    Finland
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start space-x-4">
                <div
                  className="rounded-full p-3"
                  style={{ backgroundColor: colors.pink }}
                >
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3
                    className="font-semibold text-lg mb-1"
                    style={{ color: colors.navy }}
                  >
                    {t("phone")}
                  </h3>
                  <a
                    href="tel:+358401306777"
                    className="text-gray-700 hover:underline"
                  >
                    +358 40 1306777
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start space-x-4">
                <div
                  className="rounded-full p-3"
                  style={{ backgroundColor: colors.pink }}
                >
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3
                    className="font-semibold text-lg mb-1"
                    style={{ color: colors.navy }}
                  >
                    {t("email")}
                  </h3>
                  <a
                    href="mailto:info@ukkis.fi"
                    className="text-gray-700 hover:underline"
                  >
                    info@ukkis.fi
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2
              className="text-2xl font-bold mb-6"
              style={{ color: colors.navy }}
            >
              {t("sendUsMessage")}
            </h2>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("name")} {t("required")}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder={t("yourName")}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("email")} {t("required")}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder={t("yourEmail")}
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("phone")}
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="+358 XX XXXXXXX"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("subject")} {t("required")}
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder={t("whatIsThisRegarding")}
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("message")} {t("required")}
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
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
                <p className="text-center mt-2 text-gray-700">{message}</p>
              )}
            </form>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-4">
          <h2
            className="text-2xl font-bold mb-4 px-4 pt-4"
            style={{ color: colors.navy }}
          >
            {t("findUs")}
          </h2>
          <Map position={position} />
        </div>
      </div>
    </div>
  );
}
