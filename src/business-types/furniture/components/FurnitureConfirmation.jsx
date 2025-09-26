// src/business-types/furniture/components/FurnitureConfirmation.jsx
import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  AlertCircle,
  Loader,
  Calendar,
  Clock,
  Armchair,
  User,
  Mail,
  Phone,
  CreditCard,
  Download,
  Printer,
  Home,
} from "lucide-react";
import { useUniversalBooking } from "../../../core/UniversalStateManager";

const FurnitureConfirmation = ({ adapter }) => {
  const { state } = useUniversalBooking();
  const { bookingReference, selectedFurniture, selectedSession, bookingData } =
    state;

  const [verificationStatus, setVerificationStatus] = useState("verifying");
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState("");

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

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      // Get payment reference from localStorage (set during payment)
      const paymentRef = localStorage.getItem("payment_reference");

      if (!paymentRef) {
        throw new Error("No payment reference found");
      }

      console.log("🔍 Verifying furniture booking payment:", paymentRef);

      // Call verification endpoint
      const apiBaseUrl =
        process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";
      const response = await fetch(
        `${apiBaseUrl}/payment/verify?reference=${paymentRef}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const result = await response.json();

      if (result.success && result.data.status === "success") {
        setPaymentData(result.data);
        setVerificationStatus("success");

        // Clear stored payment reference
        localStorage.removeItem("payment_reference");

        console.log(
          "✅ Furniture booking payment verified successfully:",
          result.data
        );
      } else {
        throw new Error(result.message || "Payment verification failed");
      }
    } catch (error) {
      console.error("❌ Furniture booking payment verification failed:", error);
      setError(error.message);
      setVerificationStatus("failed");
    }
  };

  // Verifying state
  if (verificationStatus === "verifying") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-6"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verifying Your Payment
            </h1>
            <p className="text-gray-600">
              Please wait while we confirm your furniture booking payment...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (verificationStatus === "success") {
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

                {/* Payment Details */}
                {paymentData && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <CreditCard className="mr-2" size={16} />
                      Payment Details
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount Paid:</span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(paymentData.amount / 100)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="font-medium">
                          {paymentData.channel} (
                          {paymentData.authorization?.brand || "Card"})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transaction ID:</span>
                        <span className="font-mono text-sm">
                          {paymentData.reference}
                        </span>
                      </div>
                      {paymentData.customer && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Customer:</span>
                          <span className="font-medium">
                            {paymentData.customer.first_name}{" "}
                            {paymentData.customer.last_name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* What's Next */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    What's Next?
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>
                      • A confirmation email will be sent to{" "}
                      {paymentData?.customer?.email}
                    </li>
                    <li>• Arrive 15 minutes before your session time</li>
                    <li>• Present your booking reference at check-in</li>
                    <li>
                      • Contact support if you need to modify your booking
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center justify-center space-x-2 bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                  >
                    <Printer size={16} />
                    <span>Print Receipt</span>
                  </button>
                  <button
                    onClick={() => (window.location.href = "/")}
                    className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    <Home size={16} />
                    <span>Back to Home</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Failed state
  if (verificationStatus === "failed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Verification Failed
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              {error ||
                "We couldn't verify your payment. Please contact support."}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default FurnitureConfirmation;
