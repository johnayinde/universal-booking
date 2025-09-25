// src/business-types/furniture/components/FurnitureConfirmation.jsx
import React from "react";
import { useUniversalBooking } from "../../../core/UniversalStateManager";
import {
  CheckCircle,
  Download,
  Mail,
  Calendar,
  MapPin,
  Users,
  Armchair,
  Phone,
  Clock,
  CreditCard,
} from "lucide-react";
import { ActionTypes } from "../../../core/UniversalStateManager";

const FurnitureConfirmation = () => {
  const { state, dispatch } = useUniversalBooking();

  // Get data from state
  const selectedFurniture = state.selectedFurniture;
  const selectedSession = state.selectedSession;
  const bookingData = state.bookingData;
  const bookingRef =
    state.bookingReference || "FB-" + Date.now().toString().slice(-8);
  const customerInfo = state.customerInfo;
  const totalAmount = state.totalAmount || state.bookingData?.totalAmount;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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

  const handleCloseWidget = () => {
    dispatch({ type: ActionTypes.SET_WIDGET_OPEN, payload: false });
  };

  const handleNewBooking = () => {
    dispatch({ type: ActionTypes.RESET_BOOKING });
  };

  // This component fits into the center column of the three-column layout
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="mb-4">
          <div className="flex items-center space-x-2 text-green-600 mb-2">
            <CheckCircle size={20} />
            <span className="text-sm font-medium">Confirmation</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600">
            Your furniture booking has been successfully confirmed.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl space-y-6">
          {/* Success Icon & Message */}
          <div className="text-center">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Booking Confirmed!
            </h2>
            <p className="text-gray-600 mb-4">
              Your furniture booking has been successfully confirmed.
            </p>
          </div>

          {/* Booking Reference */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <h3 className="text-sm font-medium text-green-800 mb-2">
              Booking Reference:
            </h3>
            <p className="text-2xl font-bold text-green-900 font-mono">
              {bookingRef}
            </p>
          </div>

          {/* Booking Details */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Booking Details
            </h3>

            {/* Customer Information */}
            {customerInfo &&
              (customerInfo.firstName ||
                customerInfo.lastName ||
                customerInfo.email) && (
                <div className="mb-6">
                  <h4 className="flex items-center text-gray-900 font-medium mb-3">
                    <Users className="w-4 h-4 mr-2" />
                    Customer Information
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    {(customerInfo.firstName || customerInfo.lastName) && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="text-gray-900 font-medium">
                          {customerInfo.firstName} {customerInfo.lastName}
                        </span>
                      </div>
                    )}
                    {customerInfo.email && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="text-gray-900 font-medium">
                          {customerInfo.email}
                        </span>
                      </div>
                    )}
                    {customerInfo.phone && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="text-gray-900 font-medium">
                          {customerInfo.phone}
                        </span>
                      </div>
                    )}
                    {customerInfo.guests && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Guests:</span>
                        <span className="text-gray-900 font-medium">
                          {customerInfo.guests}{" "}
                          {customerInfo.guests === 1 ? "person" : "people"}
                        </span>
                      </div>
                    )}
                    {customerInfo.specialRequests && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <span className="text-gray-600 block mb-1">
                          Special Requests:
                        </span>
                        <span className="text-gray-900">
                          {customerInfo.specialRequests}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

            {/* Booking Information */}
            <div className="mb-6">
              <h4 className="flex items-center text-gray-900 font-medium mb-3">
                <Calendar className="w-4 h-4 mr-2" />
                Booking Information
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                {bookingData?.date && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="text-gray-900 font-medium">
                      {new Date(bookingData.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}
                {selectedFurniture && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Furniture:</span>
                    <span className="text-gray-900 font-medium">
                      {selectedFurniture.name}
                    </span>
                  </div>
                )}
                {selectedSession && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Session:</span>
                      <span className="text-gray-900 font-medium">
                        {selectedSession.name}
                      </span>
                    </div>
                    {(selectedSession.start_time ||
                      selectedSession.end_time) && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time:</span>
                        <span className="text-gray-900 font-medium">
                          {formatTime(selectedSession.start_time)} -{" "}
                          {formatTime(selectedSession.end_time)}
                        </span>
                      </div>
                    )}
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-green-600 font-medium">Confirmed</span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            {totalAmount && (
              <div className="mb-6">
                <h4 className="flex items-center text-gray-900 font-medium mb-3">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Payment Information
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  {selectedFurniture?.price > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Furniture Fee:</span>
                      <span className="text-gray-900 font-medium">
                        {formatCurrency(selectedFurniture.price)}
                      </span>
                    </div>
                  )}
                  {selectedSession?.price > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Session Fee:</span>
                      <span className="text-gray-900 font-medium">
                        {formatCurrency(selectedSession.price)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-gray-900 font-semibold">
                        Total Paid:
                      </span>
                      <span className="text-green-600 font-bold text-lg">
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <span className="text-green-600 font-medium">Paid</span>
                  </div>
                </div>
              </div>
            )}

            {/* Location Information */}
            <div className="mb-6">
              <h4 className="flex items-center text-gray-900 font-medium mb-3">
                <MapPin className="w-4 h-4 mr-2" />
                Location
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 text-sm">
                <p className="text-gray-900 font-medium">Nike Lake Resort</p>
                <p className="text-gray-600">Enugu, Nigeria</p>
                <p className="text-gray-600 mt-2">
                  Please arrive 15 minutes before your scheduled time.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              What's Next?
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Download/Email Buttons */}
              <button className="flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                <Mail size={20} />
                <span>Email Confirmation</span>
              </button>

              <button className="flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors">
                <Download size={20} />
                <span>Download Receipt</span>
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleNewBooking}
                className="flex items-center justify-center space-x-2 bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors"
              >
                <Armchair size={20} />
                <span>New Booking</span>
              </button>

              <button
                onClick={handleCloseWidget}
                className="flex items-center justify-center py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                <span>Close</span>
              </button>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h4 className="flex items-center text-blue-900 font-medium mb-3">
              <Clock className="w-4 h-4 mr-2" />
              Important Information
            </h4>
            <div className="space-y-2 text-sm text-blue-800">
              <p>
                • Please arrive 15 minutes before your scheduled session time
              </p>
              <p>• Bring a valid ID for verification</p>
              <p>• Contact us at least 24 hours in advance for any changes</p>
              <p>• Late arrivals may result in reduced session time</p>
              <p>• Full refund available if cancelled 48 hours in advance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FurnitureConfirmation;
