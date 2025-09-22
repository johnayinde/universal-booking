// src/business-types/entry/components/EntryConfirmation.jsx
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
} from "lucide-react";

const EntryConfirmation = () => {
  const { state, adapter } = useUniversalBooking();

  const selectedTickets = state.selectedItem?.selectedTickets || [];
  const bookingRef = state.bookingReference;
  const customerInfo = state.customerInfo;
  const totalAmount = state.totalAmount;

  const handleDownloadTicket = () => {
    // Implement ticket download functionality
    console.log("Download ticket for booking:", bookingRef);
    // This would typically generate and download a PDF ticket
  };

  const handleEmailTicket = () => {
    // Implement email ticket functionality
    console.log("Email ticket to:", customerInfo.email);
    // This would typically trigger an email with the ticket
  };

  const getStepIcon = (stepKey, isActive, isCompleted) => {
    const icons = {
      list: Ticket,
      booking: Users,
      confirmation: CheckCircle,
    };

    const Icon = icons[stepKey];
    return Icon ? (
      <Icon size={20} />
    ) : (
      <div className="w-5 h-5 bg-current rounded-full" />
    );
  };

  const bookingSteps = adapter.getBookingSteps();
  const currentStepIndex = bookingSteps.findIndex(
    (step) => step.key === state.currentStep
  );

  return (
    <div className="h-full flex bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-72 bg-white border-r border-gray-200 p-6">
        <div className="mb-8">
          <img
            src="/api/placeholder/80/60"
            alt="Nike Lake Resort"
            className="w-20 h-15 rounded-lg object-cover mb-4"
          />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Nike Lake Resort, Enugu
          </h2>
          <p className="text-gray-600 text-sm">
            Enjoy the perfect blend of business and leisure with peaceful
            waterfront setting.
          </p>
        </div>

        {/* Booking Steps */}
        <div className="space-y-1">
          {bookingSteps.map((step, index) => {
            const isActive = state.currentStep === step.key;
            const isCompleted = index < currentStepIndex;

            return (
              <div
                key={step.key}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-green-100 text-green-700 border-l-4 border-green-500"
                    : "bg-green-50 text-green-700"
                }`}
              >
                <div className="flex-shrink-0 text-green-600">
                  {getStepIcon(step.key, isActive, isCompleted)}
                </div>
                <span className="font-medium text-green-800">{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        <div className="flex-1 p-8">
          <div className="max-w-2xl">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Booking Confirmed!
              </h1>
              <p className="text-lg text-gray-600">
                Your entry tickets have been successfully booked.
              </p>
              {bookingRef && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg inline-block">
                  <span className="text-sm font-medium text-green-800">
                    Booking Reference:{" "}
                    <span className="font-mono">{bookingRef}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Booking Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Booking Details
              </h2>

              {/* Customer Information */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-gray-600" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Name:</span>
                    <span className="ml-2 text-gray-900">
                      {customerInfo.firstName} {customerInfo.lastName}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="ml-2 text-gray-900">
                      {customerInfo.email}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Phone:</span>
                    <span className="ml-2 text-gray-900">
                      {customerInfo.phone}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Booking Date:
                    </span>
                    <span className="ml-2 text-gray-900">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ticket Information */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Ticket className="w-5 h-5 mr-2 text-gray-600" />
                  Ticket Information
                </h3>
                <div className="space-y-3">
                  {selectedTickets.map((ticket, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-gray-900">
                          {ticket.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          Quantity: {ticket.quantity}
                        </div>
                        <div className="text-sm text-gray-600">
                          {adapter.formatCurrency(ticket.price, state.config)}{" "}
                          per ticket
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {adapter.formatCurrency(
                            ticket.totalPrice,
                            state.config
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">
                    Total Amount:
                  </span>
                  <span className="text-xl font-bold text-green-600">
                    {adapter.formatCurrency(totalAmount, state.config)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={handleDownloadTicket}
                className="flex-1 bg-orange-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Download size={20} />
                <span>Download Ticket</span>
              </button>

              <button
                onClick={handleEmailTicket}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
              >
                <Mail size={20} />
                <span>Email Ticket</span>
              </button>
            </div>

            {/* Important Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    Important Information
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Please bring a valid ID for entry verification</li>
                    <li>
                      • Arrive at least 15 minutes before your scheduled time
                    </li>
                    <li>• Keep your ticket receipt for entry</li>
                    <li>• Contact us if you need to modify your booking</li>
                    <li>• Tickets are non-refundable but can be rescheduled</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Quick Actions */}
        <div className="w-80 bg-white border-l border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Next Steps
          </h3>

          <div className="space-y-4">
            {/* Location Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-3">
                <MapPin className="w-5 h-5 text-gray-600 mr-2" />
                <span className="font-medium text-gray-900">Location</span>
              </div>
              <p className="text-sm text-gray-600">
                Nike Lake Resort
                <br />
                Enugu, Nigeria
                <br />
                <a href="tel:+234" className="text-orange-600 hover:underline">
                  Contact: +234 XXX XXX XXXX
                </a>
              </p>
            </div>

            {/* Visit Date */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-3">
                <Calendar className="w-5 h-5 text-gray-600 mr-2" />
                <span className="font-medium text-gray-900">Visit Date</span>
              </div>
              <p className="text-sm text-gray-600">
                Valid for any day
                <br />
                <span className="text-orange-600">
                  Open daily: 8:00 AM - 6:00 PM
                </span>
              </p>
            </div>
          </div>

          {/* Contact Support */}
          <div className="mt-8 p-4 border border-orange-200 rounded-lg bg-orange-50">
            <h4 className="font-medium text-orange-900 mb-2">Need Help?</h4>
            <p className="text-sm text-orange-800 mb-3">
              Contact our support team if you have any questions about your
              booking.
            </p>
            <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors">
              Contact Support
            </button>
          </div>

          {/* Close Widget */}
          <div className="mt-6">
            <button
              onClick={() =>
                window.parent?.postMessage?.({ type: "close-widget" }, "*")
              }
              className="w-full py-3 px-4 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntryConfirmation;
