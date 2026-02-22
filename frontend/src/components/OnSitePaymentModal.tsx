"use client";

import { useRouter } from "next/navigation";

interface OnSitePaymentModalProps {
  onConfirm?: () => void;
  onCancel?: () => void;
}

export default function OnSitePaymentModal({
  onConfirm,
  onCancel,
}: OnSitePaymentModalProps) {
  const router = useRouter();

  return (
    <div className="max-w-md mx-auto space-y-4 sm:space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-blue-900 mb-3 sm:mb-4">
          Payment Information
        </h3>
        <p className="text-sm sm:text-base text-blue-800 mb-3 sm:mb-4">
          Payment will be handled on-site at the hotel upon your arrival.
        </p>
        <p className="text-blue-700 text-xs sm:text-sm">
          Please proceed with your booking confirmation. You will receive a confirmation email with all the details.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {onCancel && (
          <button
            onClick={onCancel}
            className="flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-lg border-2 border-gray-300 font-semibold hover:bg-gray-50 transition text-sm sm:text-base"
          >
            Back
          </button>
        )}
        <button
          onClick={() => {
            if (onConfirm) {
              onConfirm();
            } else {
              router.push("/");
            }
          }}
          className="flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition text-sm sm:text-base"
        >
          Confirm Booking
        </button>
      </div>
    </div>
  );
}
