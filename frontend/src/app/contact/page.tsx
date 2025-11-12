"use client";

import { colors } from "@/lib/constants";
import { Mail, MapPin, Phone } from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo } from "react";

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
  const position = useMemo(() => ({ lat: 64.7498157270232, lng: 28.257191314126082 }), []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.beige }}>
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: colors.navy }}>
            Contact Us
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Get in touch with us for bookings, questions, or any other inquiries. We're here to help make your Arctic adventure unforgettable.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: colors.navy }}>
              Get In Touch
            </h2>

            <div className="space-y-6">
              {/* Address */}
              <div className="flex items-start space-x-4">
                <div className="rounded-full p-3" style={{ backgroundColor: colors.pink }}>
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1" style={{ color: colors.navy }}>
                    Address
                  </h3>
                  <p className="text-gray-700">
                    Ukkohallantie 5<br />
                    89400 Hyrynsalmi<br />
                    Finland
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start space-x-4">
                <div className="rounded-full p-3" style={{ backgroundColor: colors.pink }}>
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1" style={{ color: colors.navy }}>
                    Phone
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
                <div className="rounded-full p-3" style={{ backgroundColor: colors.pink }}>
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1" style={{ color: colors.navy }}>
                    Email
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

            {/* Business Hours */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="font-semibold text-lg mb-3" style={{ color: colors.navy }}>
                Business Hours
              </h3>
              <div className="space-y-2 text-gray-700">
                <div className="flex justify-between">
                  <span>Monday - Friday:</span>
                  <span className="font-medium">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday:</span>
                  <span className="font-medium">10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday:</span>
                  <span className="font-medium">Closed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: colors.navy }}>
              Send Us a Message
            </h2>

            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
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
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="What is this regarding?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              <button
                type="submit"
                className="w-full text-white font-medium rounded-full px-6 py-3 transition-all hover:opacity-90"
                style={{ backgroundColor: colors.pink }}
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-4">
          <h2 className="text-2xl font-bold mb-4 px-4 pt-4" style={{ color: colors.navy }}>
            Find Us
          </h2>
          <Map position={position} />
        </div>
      </div>
    </div>
  );
}
