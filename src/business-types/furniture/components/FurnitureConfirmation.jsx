// src/business-types/furniture/components/FurnitureConfirmation.jsx
import React from "react";
import { CheckCircle, Calendar, CreditCard, Home } from "lucide-react";
import {
  ActionTypes,
  useUniversalBooking,
} from "../../../core/UniversalStateManager";

const FurnitureConfirmation = ({ adapter, config }) => {
  const { state, dispatch } = useUniversalBooking();
  const { bookingReference, selectedFurniture, selectedSession, bookingData } =
    state;

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return "";
    try {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      return timeString;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  const handleNewBooking = () => {
    dispatch({ type: ActionTypes.RESET_BOOKING });
  };

  const handleCloseWidget = () => {
    sessionStorage.removeItem("selectedBusinessType");
    sessionStorage.removeItem("isReloading");

    if (window.UniversalBookingWidget) {
      window.UniversalBookingWidget.destroyAll?.();
      setTimeout(() => {
        const newConfig = { ...config, businessType: null };
        window.UniversalBookingWidget.init(newConfig).open();
      }, 100);
    }

    if (window.parent) window.parent.postMessage({ type: "close-widget" }, "*");
  };

  // Success state
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Success Header */}
          <div className="bg-green-50 p-6 text-center border-b border-green-200">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Furniture Booking Confirmed!
            </h1>
            <p className="text-lg text-gray-600">
              Your payment has been processed successfully
            </p>
          </div>

          <div className="p-6">
            {/* Booking Reference */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-orange-900 mb-2 flex items-center">
                <CreditCard className="mr-2" size={16} />
                Booking Reference
              </h3>
              <p className="text-orange-800 font-mono text-lg">
                {bookingReference ||
                  localStorage.getItem("booking_reference") ||
                  "FT-XXXXXXX"}
              </p>
              <p className="text-orange-700 text-sm mt-1">
                Please save this reference for your records
              </p>
            </div>

            {/* Booking Details */}
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Calendar className="mr-2" size={16} />
                  Booking Details
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {formatDate(bookingData?.date)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Furniture:</span>
                    <span className="font-medium">
                      {selectedFurniture?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Session:</span>
                    <span className="font-medium">
                      {selectedSession?.session_name || selectedSession?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">
                      {formatTime(selectedSession?.start_time)} -{" "}
                      {formatTime(selectedSession?.end_time)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">
                      {selectedSession?.duration_hours} hours
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between max-w-6xl">
                  <button
                    onClick={handleNewBooking}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    New Booking
                  </button>

                  <button
                    onClick={handleCloseWidget}
                    className="px-8 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FurnitureConfirmation;
