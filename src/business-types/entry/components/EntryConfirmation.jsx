// src/business-types/entry/components/EntryConfirmation.jsx - Fixed Mobile Responsive
import React from "react";
import { useUniversalBooking } from "../../../core/UniversalStateManager";
import {
  CheckCircle,
  Download,
  Mail,
  Calendar,
  MapPin,
  Users,
  Ticket,
  Phone,
  Clock,
  X,
} from "lucide-react";
import { ActionTypes } from "../../../core/UniversalStateManager";

const EntryConfirmation = () => {
  const { state, dispatch, adapter } = useUniversalBooking();

  // Get data from state
  const selectedTickets = Object.values(state.selections || {});
  const bookingRef = state.bookingReference;
  const customerInfo = state.customerInfo;
  const totalAmount = state.totalAmount;

  const handleDownloadTicket = () => {
    console.log("Download ticket for booking:", bookingRef);
    // Implement download functionality
  };

  const handleEmailTicket = () => {
    console.log("Email ticket to:", customerInfo.email);
    // Implement email functionality
  };

  const handleCloseWidget = () => {
    dispatch({ type: ActionTypes.SET_WIDGET_OPEN, payload: false });
  };

  const handleNewBooking = () => {
    dispatch({ type: ActionTypes.RESET_BOOKING });
  };

  const getStepIcon = (stepKey, isActive, isCompleted) => {
    const icons = {
      list: Ticket,
      booking: Users,
      confirmation: CheckCircle,
    };

    const Icon = icons[stepKey];
    return Icon ? (
      <Icon size={16} />
    ) : (
      <div className="w-4 h-4 bg-current rounded-full" />
    );
  };

  const bookingSteps = adapter?.getBookingSteps() || [];
  const currentStepIndex = bookingSteps.findIndex(
    (step) => step.key === state.currentStep
  );

  return (
    <div className="h-full flex flex-col lg:flex-row bg-gray-50">
      {/* Left Sidebar - Hidden on mobile, shown on desktop */}
      <div className="hidden lg:block w-72 bg-white border-r border-gray-200 p-6 flex-shrink-0">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Nike Lake Resort, Enugu
          </h2>
          <p className="text-gray-600 text-sm">
            Enjoy the perfect blend of business and leisure with peaceful
            waterfront setting.
          </p>
        </div>

        {/* Booking Steps */}
        <div className="space-y-2">
          {bookingSteps.map((step, index) => {
            const isActive = state.currentStep === step.key;
            const isCompleted = index <= currentStepIndex;

            return (
              <div
                key={step.key}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-green-100 text-green-700 border-l-4 border-green-500"
                    : isCompleted
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-50 text-gray-500"
                }`}
              >
                <div className="flex-shrink-0 text-green-600">
                  {getStepIcon(step.key, isActive, isCompleted)}
                </div>
                <span className="font-medium text-sm">{step.label}</span>
              </div>
            );
          })}
        </div>

        {/* Secure Booking Badge */}
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Secure Booking
            </span>
          </div>
          <p className="text-xs text-green-700">
            Your payment information is encrypted and secure
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Booking Confirmed
          </h2>
          <button
            onClick={handleCloseWidget}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Success Header */}
            <div className="text-center">
              <div className="mx-auto w-16 h-16 lg:w-20 lg:h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 lg:w-10 lg:h-10 text-green-600" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                Booking Confirmed!
              </h1>
              <p className="text-base lg:text-lg text-gray-600 mb-4">
                Your entry tickets have been successfully booked.
              </p>
              {bookingRef && (
                <div className="inline-block p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm font-medium text-green-800">
                    Booking Reference:
                  </div>
                  <div className="text-lg font-mono font-bold text-green-900 mt-1">
                    {bookingRef}
                  </div>
                </div>
              )}
            </div>

            {/* Booking Details Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3">
                Booking Details
              </h2>

              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-gray-600" />
                  Customer Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 w-16">
                        Name:
                      </span>
                      <span className="text-gray-900">
                        {customerInfo?.firstName} {customerInfo?.lastName}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-gray-900 text-xs sm:text-sm break-all">
                        {customerInfo?.email}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-gray-900">
                        {customerInfo?.phone}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-gray-900">
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ticket Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <Ticket className="w-5 h-5 mr-2 text-gray-600" />
                  Ticket Information
                </h3>
                <div className="space-y-3">
                  {selectedTickets.map((ticket, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-gray-900">
                          {ticket.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          Quantity: {ticket.quantity}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          ₦{(ticket.price * ticket.quantity).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          ₦{ticket.price.toLocaleString()} each
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Amount */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-gray-900">Total Amount:</span>
                  <span className="text-green-600">
                    ₦{totalAmount?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Location & Visit Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-gray-600" />
                Location & Visit Information
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="font-medium text-gray-900">
                    Nike Lake Resort
                  </div>
                  <div className="text-gray-600">Enugu, Nigeria</div>
                  <div className="text-orange-600 font-medium">
                    Contact: +234 XXX XXX XXXX
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-500 mr-1" />
                    <span>Valid for any day</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-gray-500 mr-1" />
                    <span>Open daily: 8:00 AM - 6:00 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleDownloadTicket}
                className="flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Ticket
              </button>
              <button
                onClick={handleEmailTicket}
                className="flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email Ticket
              </button>
            </div>

            {/* Help Section */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-medium text-orange-900 mb-2">Need Help?</h3>
              <p className="text-sm text-orange-800 mb-3">
                Contact our support team if you have any questions about your
                booking.
              </p>
              <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors">
                Contact Support
              </button>
            </div>

            {/* Close Button */}
            <div className="pt-4">
              <button
                onClick={handleCloseWidget}
                className="w-full py-3 px-4 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntryConfirmation;
