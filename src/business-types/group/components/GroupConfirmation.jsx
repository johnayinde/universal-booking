// src/business-types/group/components/GroupConfirmation.jsx
import React, { useContext, useEffect } from "react";
import {
  CheckCircle,
  Calendar,
  Users,
  Package,
  Mail,
  Phone,
  User,
  Download,
  Share,
  CreditCard,
  MapPin,
  Clock,
} from "lucide-react";
import UniversalBookingContext from "../../../core/UniversalStateManager";

/**
 * Group Confirmation Component
 * Final step: Display booking confirmation and details
 */
const GroupConfirmation = ({ apiService, adapter }) => {
  const { state } = useContext(UniversalBookingContext);
  const { bookingReference, selectedDate, selection, customerInfo } = state;

  // Get selected data from state
  const selectedPackageSize = selection?.packageSize;
  const selectedPackageOption = selection?.packageOption;
  const packageDetails = selection?.packageDetails || selectedPackageOption;

  // Calculate total amount
  const totalAmount =
    packageDetails && selectedPackageSize
      ? parseFloat(packageDetails.price || 0) *
        parseInt(selectedPackageSize.size || 1)
      : 0;

  // Format currency
  const formatCurrency = (amount) => {
    return `₦${parseFloat(amount).toLocaleString()}`;
  };

  // Get confirmation details from localStorage if available
  const paymentReference = localStorage.getItem("payment_reference");
  const storedBookingRef = localStorage.getItem("booking_reference");

  useEffect(() => {
    // You could fetch additional booking details here if needed
    console.log("📋 Group booking confirmed:", {
      bookingReference: bookingReference || storedBookingRef,
      paymentReference,
      customerInfo,
      selection,
    });
  }, []);

  const handleDownloadReceipt = () => {
    // Implement receipt download functionality
    console.log("📄 Downloading receipt...");
    // This would typically generate and download a PDF receipt
  };

  const handleShareBooking = () => {
    // Implement sharing functionality
    console.log("📤 Sharing booking...");
    if (navigator.share) {
      navigator.share({
        title: "Group Booking Confirmation",
        text: `My group booking is confirmed! Reference: ${
          bookingReference || storedBookingRef
        }`,
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      const bookingText = `Group Booking Confirmed!\nReference: ${
        bookingReference || storedBookingRef
      }\nDate: ${new Date(selectedDate).toLocaleDateString()}\nPackage: ${
        packageDetails?.name
      }\nGroup Size: ${selectedPackageSize?.size} people`;

      if (navigator.clipboard) {
        navigator.clipboard.writeText(bookingText).then(() => {
          alert("Booking details copied to clipboard!");
        });
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              Your group booking has been successfully processed
            </p>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 inline-block">
              <span className="text-sm text-emerald-700 font-medium">
                Booking Reference:
              </span>
              <span className="text-emerald-900 font-bold ml-2">
                {bookingReference || storedBookingRef || "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Booking Details */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Booking Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="flex items-start">
                  <Calendar className="mr-3 mt-1 text-emerald-600" size={20} />
                  <div>
                    <div className="font-medium text-gray-900">Date</div>
                    <div className="text-gray-600">
                      {selectedDate &&
                        new Date(selectedDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <Package className="mr-3 mt-1 text-emerald-600" size={20} />
                  <div>
                    <div className="font-medium text-gray-900">Package</div>
                    <div className="text-gray-600">{packageDetails?.name}</div>
                    {packageDetails?.description && (
                      <div className="text-sm text-gray-500 mt-1">
                        {packageDetails.description}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start">
                  <Users className="mr-3 mt-1 text-emerald-600" size={20} />
                  <div>
                    <div className="font-medium text-gray-900">Group Size</div>
                    <div className="text-gray-600">
                      {selectedPackageSize?.size} people
                    </div>
                  </div>
                </div>

                {packageDetails?.duration && (
                  <div className="flex items-start">
                    <Clock className="mr-3 mt-1 text-emerald-600" size={20} />
                    <div>
                      <div className="font-medium text-gray-900">Duration</div>
                      <div className="text-gray-600">
                        {packageDetails.duration}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="flex items-start">
                  <User className="mr-3 mt-1 text-emerald-600" size={20} />
                  <div>
                    <div className="font-medium text-gray-900">Lead Guest</div>
                    <div className="text-gray-600">
                      {customerInfo?.firstName} {customerInfo?.lastName}
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <Mail className="mr-3 mt-1 text-emerald-600" size={20} />
                  <div>
                    <div className="font-medium text-gray-900">Email</div>
                    <div className="text-gray-600">{customerInfo?.email}</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <Phone className="mr-3 mt-1 text-emerald-600" size={20} />
                  <div>
                    <div className="font-medium text-gray-900">Phone</div>
                    <div className="text-gray-600">{customerInfo?.phone}</div>
                  </div>
                </div>

                {paymentReference && (
                  <div className="flex items-start">
                    <CreditCard
                      className="mr-3 mt-1 text-emerald-600"
                      size={20}
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        Payment Reference
                      </div>
                      <div className="text-gray-600 font-mono text-sm">
                        {paymentReference}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Package Features */}
          {packageDetails?.features && packageDetails.features.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                What's Included
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {packageDetails.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="mr-2 text-emerald-500" size={16} />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Summary */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Payment Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">
                  {packageDetails?.name} × {selectedPackageSize?.size}
                </span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Price per person</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(packageDetails?.price || 0)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900 text-lg">
                    Total Paid
                  </span>
                  <span className="font-bold text-2xl text-emerald-600">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center">
              <MapPin className="mr-2" size={20} />
              Important Information
            </h2>
            <div className="space-y-3 text-blue-800">
              <div>
                <strong>Arrival:</strong> Please arrive 15 minutes before your
                scheduled time.
              </div>
              <div>
                <strong>Contact:</strong> If you need to make any changes or
                have questions, please contact us with your booking reference.
              </div>
              <div>
                <strong>Cancellation:</strong> Cancellations must be made at
                least 24 hours in advance for a full refund.
              </div>
              <div>
                <strong>Weather:</strong> In case of adverse weather conditions,
                we will contact you to reschedule your booking.
              </div>
            </div>
          </div>

          {/* Special Requirements */}
          {customerInfo?.specialRequirements && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Special Requirements
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">
                  {customerInfo.specialRequirements}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="bg-white border-t border-gray-200 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* <button
              onClick={handleDownloadReceipt}
              className="px-6 py-3 bg-emerald-100 text-emerald-700 rounded-lg font-medium hover:bg-emerald-200 transition-colors flex items-center justify-center space-x-2"
            >
              <Download size={18} />
              <span>Download Receipt</span>
            </button>

            <button
              onClick={handleShareBooking}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <Share size={18} />
              <span>Share Booking</span>
            </button> */}

            {/* <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Make Another Booking
            </button> */}
          </div>

          {/* Contact Information */}
          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <p className="text-gray-600 mb-2">
              Need help? Contact our support team
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
              <a
                href="mailto:support@nikelakeresort.com"
                className="text-emerald-600 hover:text-emerald-700 flex items-center justify-center space-x-1"
              >
                <Mail size={16} />
                <span>support@nikelakeresort.com</span>
              </a>
              <a
                href="tel:+2348000000000"
                className="text-emerald-600 hover:text-emerald-700 flex items-center justify-center space-x-1"
              >
                <Phone size={16} />
                <span>+234 800 000 0000</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupConfirmation;
