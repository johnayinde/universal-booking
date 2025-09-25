// src/components/PaymentVerification.jsx - Payment verification after Paystack redirect
import React, { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, Loader } from "lucide-react";

const PaymentVerification = () => {
  const [verificationStatus, setVerificationStatus] = useState("verifying");
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      // Get payment reference from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const paymentRef = urlParams.get("reference") || urlParams.get("trxref");

      if (!paymentRef) {
        throw new Error("No payment reference found in URL");
      }

      console.log("🔍 Verifying payment:", paymentRef);

      // Call verification endpoint using your API base URL
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

        // Clear any stored payment reference
        localStorage.removeItem("payment_reference");

        console.log("✅ Payment verified successfully:", result.data);
      } else {
        throw new Error(result.message || "Payment verification failed");
      }
    } catch (error) {
      console.error("❌ Payment verification failed:", error);
      setError(error.message);
      setVerificationStatus("failed");
    }
  };

  // Verifying state
  if (verificationStatus === "verifying") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="animate-spin w-12 h-12 text-orange-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Verifying Your Payment
          </h2>
          <p className="text-gray-600">
            Please wait while we confirm your payment...
          </p>
        </div>
      </div>
    );
  }

  // Success state
  if (verificationStatus === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            {/* Success Message */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Your booking has been confirmed and payment processed
              successfully.
            </p>

            {/* Payment Details */}
            {paymentData && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Payment Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">
                      ₦{paymentData.amount?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Currency:</span>
                    <span className="font-medium">{paymentData.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paid At:</span>
                    <span className="font-medium">
                      {new Date(paymentData.paid_at).toLocaleString()}
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

            {/* Booking Reference */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-orange-900 mb-2">
                Booking Reference
              </h3>
              <p className="text-orange-800 font-mono text-lg">
                {localStorage.getItem("booking_reference") || "ET-XXXXXXX"}
              </p>
              <p className="text-orange-700 text-sm mt-1">
                Please save this reference for your records
              </p>
            </div>

            {/* What's Next */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">What's Next?</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>
                  • A confirmation email will be sent to{" "}
                  {paymentData?.customer?.email}
                </li>
                <li>• Your tickets will be available for download shortly</li>
                <li>• Present your booking reference at the entry point</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => window.print()}
                className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors"
              >
                Print Receipt
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

  // Failed state
  if (verificationStatus === "failed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Error Icon */}
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>

            {/* Error Message */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Verification Failed
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              We couldn't verify your payment. Please contact support.
            </p>

            {/* Error Details */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm">{error}</p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  setVerificationStatus("verifying");
                  verifyPayment();
                }}
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

export default PaymentVerification;
