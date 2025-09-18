import React from "react";
import {
  CheckCircle,
  Download,
  Mail,
  Calendar,
  MapPin,
  Clock,
  User,
  Phone,
} from "lucide-react";
import { useUniversalBooking } from "../../../core/UniversalStateManager";
import { ActionTypes } from "../../../core/UniversalStateManager";

const EventConfirmation = ({ adapter }) => {
  const { state, dispatch } = useUniversalBooking();
  const {
    selectedItem: event,
    selections,
    customerInfo,
    bookingReference,
    totalAmount,
  } = state;

  const handleNewBooking = () => {
    dispatch({ type: ActionTypes.RESET_BOOKING });
  };

  const handleCloseWidget = () => {
    dispatch({ type: ActionTypes.SET_WIDGET_OPEN, payload: false });
  };

  const totalTickets = Object.values(selections).reduce(
    (total, ticket) => total + ticket.quantity,
    0
  );

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Booking Confirmed!
        </h2>
        <p className="text-gray-600">
          Your tickets have been successfully booked. You should receive a
          confirmation email shortly.
        </p>
      </div>

      {/* Booking Details Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {/* Booking Reference */}
        <div className="mb-6 text-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800 mb-1">Booking Reference</p>
            <p className="text-2xl font-bold text-green-900 font-mono">
              {bookingReference}
            </p>
          </div>
        </div>

        {/* Event Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Event Details
          </h3>

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-gray-900">{event.name}</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {/* Date */}
              <div className="flex items-center text-gray-600">
                <Calendar size={16} className="mr-2" />
                <span>{event.formattedDate}</span>
              </div>

              {/* Time */}
              {event.formattedTime && (
                <div className="flex items-center text-gray-600">
                  <Clock size={16} className="mr-2" />
                  <span>{event.formattedTime}</span>
                </div>
              )}

              {/* Location */}
              {event.address && (
                <div className="flex items-center text-gray-600 sm:col-span-2">
                  <MapPin size={16} className="mr-2" />
                  <span>{event.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ticket Details */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Your Tickets
          </h3>

          <div className="space-y-3">
            {Object.values(selections).map((ticket) => (
              <div
                key={ticket.id}
                className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{ticket.name}</p>
                  <p className="text-sm text-gray-600">
                    Quantity: {ticket.quantity}
                  </p>
                  {ticket.description && (
                    <p className="text-sm text-gray-600">
                      {ticket.description}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {ticket.price === 0
                      ? "Free"
                      : `${(ticket.price * ticket.quantity).toFixed(2)}`}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Total Summary */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">
                  Total Tickets: {totalTickets}
                </p>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {totalAmount === 0
                    ? "Free Event"
                    : `${totalAmount.toFixed(2)}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Contact Information
          </h3>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center text-gray-600">
                <User size={16} className="mr-2" />
                <span>
                  {customerInfo.firstName} {customerInfo.lastName}
                </span>
              </div>

              <div className="flex items-center text-gray-600">
                <Phone size={16} className="mr-2" />
                <span>{customerInfo.phone}</span>
              </div>

              <div className="flex items-center text-gray-600 sm:col-span-2">
                <Mail size={16} className="mr-2" />
                <span>{customerInfo.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        {totalAmount > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Payment Status
            </h3>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                <div>
                  <p className="font-medium text-yellow-800">Payment Pending</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Payment processing will be completed. You will receive an
                    email confirmation once payment is processed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Important Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          Important Information
        </h3>

        <div className="space-y-2 text-blue-800 text-sm">
          <div className="flex items-start">
            <span className="font-medium mr-2">📧</span>
            <p>
              A confirmation email with your tickets will be sent to{" "}
              <strong>{customerInfo.email}</strong>
            </p>
          </div>

          <div className="flex items-start">
            <span className="font-medium mr-2">📱</span>
            <p>
              Please bring a valid ID and your booking reference number to the
              event
            </p>
          </div>

          <div className="flex items-start">
            <span className="font-medium mr-2">⏰</span>
            <p>Please arrive at least 15-30 minutes before the event starts</p>
          </div>

          <div className="flex items-start">
            <span className="font-medium mr-2">📞</span>
            <p>
              For any questions, contact us with your booking reference:{" "}
              <strong>{bookingReference}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Download/Print Tickets */}
        <button
          onClick={() => window.print()}
          className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          <Download size={20} className="mr-2" />
          Print Confirmation
        </button>

        {/* Email Tickets */}
        <button
          onClick={() => {
            const subject = `Booking Confirmation - ${event.name}`;
            const body = `Your booking reference: ${bookingReference}\n\nEvent: ${
              event.name
            }\nDate: ${event.formattedDate}\n${
              event.formattedTime ? `Time: ${event.formattedTime}\n` : ""
            }${
              event.address ? `Location: ${event.address}\n` : ""
            }\n\nTotal Tickets: ${totalTickets}\nTotal Amount: ${
              totalAmount === 0 ? "Free" : `${totalAmount.toFixed(2)}`
            }`;

            window.open(
              `mailto:${customerInfo.email}?subject=${encodeURIComponent(
                subject
              )}&body=${encodeURIComponent(body)}`
            );
          }}
          className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          <Mail size={20} className="mr-2" />
          Email Details
        </button>

        {/* Book Another Event */}
        <button
          onClick={handleNewBooking}
          className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          Book Another Event
        </button>

        {/* Close Widget */}
        <button
          onClick={handleCloseWidget}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          Close
        </button>
      </div>

      {/* Thank You Message */}
      <div className="text-center py-6">
        <p className="text-gray-600">
          Thank you for choosing {state.config.branding.companyName}! We look
          forward to seeing you at the event.
        </p>
      </div>
    </div>
  );
};

export default EventConfirmation;
