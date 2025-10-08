// src/business-types/entry/components/EntryConfirmation.jsx - FIXED Download
import React, { useRef } from "react";
import { useUniversalBooking } from "../../../core/UniversalStateManager";
import { CheckCircle, Users, Ticket, Download } from "lucide-react";
import { ActionTypes } from "../../../core/UniversalStateManager";
import { generatePdfFromElement } from "../../../utils/pdfUtils";

const EntryConfirmation = ({ config = {} }) => {
  const { state, dispatch } = useUniversalBooking();

  // Get data from state
  const selectedTickets = Object.values(state.selections || {}).filter(
    (ticket) => ticket && ticket.quantity > 0
  );
  const bookingRef = state.bookingReference || "";
  const customerInfo = state.customerInfo;
  const totalAmount = state.totalAmount;
  const selectedDate = state.bookingData?.date;

  const contentRef = useRef(null);

  const handleCloseWidget = () => {
    // Clear the selected business type
    sessionStorage.removeItem("selectedBusinessType");

    // Destroy current widget
    if (window.UniversalBookingWidget) {
      window.UniversalBookingWidget.destroyAll?.();
    }

    // Reinitialize widget without business type (shows bookables list)
    setTimeout(() => {
      const widget = window.UniversalBookingWidget.init({
        businessType: null, // This shows the bookables list
        locationId: state.config?.locationId || 1,
        apiBaseUrl: state.config?.apiBaseUrl,
        branding: state.config?.branding,
        autoShow: true,
      });
      widget.open();
    }, 100);
  };

  const handleNewBooking = () => {
    dispatch({ type: ActionTypes.RESET_BOOKING });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleDownloadPdf = async () => {
    try {
      await generatePdfFromElement(
        contentRef.current,
        `Entry-Confirmation-${bookingRef || Date.now()}`,
        {
          scale: 2,
          margin: 10,
          orientation: "p",
          format: "a4",
        }
      );
    } catch (error) {
      console.error("Download failed:", error);
    }
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
            Your entry tickets have been successfully booked.
          </p>
        </div>
      </div>

      {/* Content - THIS IS WHAT GETS DOWNLOADED */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div
          ref={contentRef}
          className="max-w-6xl space-y-6 bg-white p-8 rounded-lg"
        >
          {/* Success Icon & Message */}
          <div className="text-center">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Booking Confirmed!
            </h2>
            <p className="text-gray-600 mb-4">
              Your entry tickets have been successfully booked.
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
                        <span className="text-gray-900">
                          {customerInfo.email}
                        </span>
                      </div>
                    )}
                    {customerInfo.phone && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="text-gray-900">
                          {customerInfo.phone}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="text-gray-900">
                        {new Date().toLocaleDateString("en-GB")}
                      </span>
                    </div>
                  </div>
                </div>
              )}

            {/* Ticket Information */}
            {selectedTickets.length > 0 && (
              <div className="mb-6">
                <h4 className="flex items-center text-gray-900 font-medium mb-3">
                  <Ticket className="w-4 h-4 mr-2" />
                  Ticket Information
                </h4>
                <div className="space-y-3">
                  {selectedTickets.map((ticket) => (
                    <div key={ticket.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-medium text-gray-900">
                            {ticket.name}
                          </h5>
                          <p className="text-sm text-gray-600">
                            Quantity: {ticket.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(ticket.price * ticket.quantity)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatCurrency(ticket.price)} each
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="text-gray-900">{selectedDate}</span>
                      </div>
                      {ticket.description && (
                        <p className="text-xs text-gray-500 mt-2">
                          {ticket.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Total Amount */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">
                      Total Amount:
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between max-w-6xl gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleNewBooking}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              New Booking
            </button>

            <button
              onClick={handleDownloadPdf}
              className="px-6 py-3 border border-gray-300 text-gray-800 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
              title="Download this confirmation as PDF"
            >
              <Download className="w-4 h-4" />
              Download Confirmation
            </button>
          </div>

          <button
            onClick={handleCloseWidget}
            className="px-8 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EntryConfirmation;
