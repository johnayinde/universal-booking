// src/business-types/furniture/components/FurniturePersonalInfo.jsx
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  CreditCard,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader,
  MessageSquare,
} from "lucide-react";
import { useUniversalBooking } from "../../../core/UniversalStateManager";
import { ActionTypes } from "../../../core/UniversalStateManager";

const FurniturePersonalInfo = ({ apiService, adapter }) => {
  console.log("🪑 FurniturePersonalInfo component rendered", {
    adapter,
    apiService,
  });

  const { state, dispatch, locationId } = useUniversalBooking();
  const {
    selectedFurniture,
    selectedSession,
    bookingData,
    customerInfo,
    totalAmount,
    loading,
    error,
  } = state;

  const [formData, setFormData] = useState({
    firstName: customerInfo.firstName || "",
    lastName: customerInfo.lastName || "",
    email: customerInfo.email || "",
    phone: customerInfo.phone || "",
    specialRequests: customerInfo.specialRequests || "",
    guests: 1,
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStep, setPaymentStep] = useState("form"); // "form", "processing", "success", "error"

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

  console.log("🪑 Furniture Personal Info State:", {
    state,
    locationId,
    selectedFurniture,
    selectedSession,
    bookingData,
  });

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }

    // Update customer info in global state
    dispatch({
      type: ActionTypes.UPDATE_CUSTOMER_INFO,
      payload: { [field]: value },
    });
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^[+]?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      errors.phone = "Please enter a valid phone number";
    }

    if (!formData.guests || formData.guests < 1) {
      errors.guests = "At least 1 guest is required";
    } else if (
      selectedFurniture?.max_capacity &&
      formData.guests > selectedFurniture.max_capacity
    ) {
      errors.guests = `Maximum ${selectedFurniture.max_capacity} guests allowed`;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Verify payment and show success
  const verifyPaymentAndShowSuccess = async (paymentReference) => {
    try {
      console.log("🔍 Verifying payment:", paymentReference);
      setPaymentStep("verifying");

      // Add verification logic here if needed
      // For now, we'll assume payment is verified and show success
      setTimeout(() => {
        setPaymentStep("success");
        dispatch({
          type: ActionTypes.SET_CURRENT_STEP,
          payload: "confirmation",
        });
      }, 2000);
    } catch (error) {
      console.error("❌ Payment verification failed:", error);
      setPaymentStep("error");
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: "Payment verification failed. Please contact support.",
      });
    }
  };

  // Handle form submission and payment processing
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!selectedFurniture || !selectedSession) {
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: "Missing furniture or session selection",
      });
      return;
    }

    setIsSubmitting(true);
    setPaymentStep("processing");
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    dispatch({ type: ActionTypes.CLEAR_ERROR });

    try {
      // Prepare booking data - Updated to match new API format
      const furnitureBookingData = {
        date: bookingData.date,
        furniture_id: selectedFurniture.id,
        furniture_name: selectedFurniture.name,
        session_id: selectedSession.id,
        session_name: selectedSession.name,
        session_price: selectedSession.price,
        customer_info: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          specialRequests: formData.specialRequests,
        },
        total_amount:
          totalAmount ||
          (selectedFurniture.price || 0) + (selectedSession.price || 0),
        guests: formData.guests,
      };

      console.log(
        "🪑 Submitting furniture booking data:",
        furnitureBookingData
      );

      // Submit booking
      const result = await adapter.createFurnitureBooking(furnitureBookingData);

      // Handle response
      if (result.success && result.data) {
        const { booking, payment, customer } = result.data;

        // Store booking reference
        dispatch({
          type: ActionTypes.SET_BOOKING_REFERENCE,
          payload: booking.booking_ref || booking.reference || booking.id,
        });

        console.log("✅ Furniture booking created successfully:", {
          booking_reference: booking.booking_ref || booking.reference,
          payment_url: payment?.payment_url,
          booking_id: booking.id,
          payment_reference: payment?.reference,
          customer,
        });

        // Store payment reference for verification later
        if (payment?.reference) {
          localStorage.setItem("payment_reference", payment.reference);
          localStorage.setItem(
            "booking_reference",
            booking.booking_ref || booking.reference
          );
        }

        // Handle payment
        if (payment?.payment_url) {
          console.log("🔄 Opening Paystack payment popup...");
          setPaymentStep("redirecting");

          setTimeout(() => {
            // Initialize Paystack popup
            const handler = window.PaystackPop.setup({
              key:
                process.env.REACT_APP_PAYSTACK_PUBLIC ||
                "pk_test_your_paystack_public_key",
              email: customer.email,
              amount: booking.total_amount * 100, // NGN * 100
              ref: payment.reference,
              callback: (transaction) => {
                console.log("✅ Payment successful:", transaction);
                setPaymentStep("verifying");
                localStorage.setItem(
                  "payment_reference",
                  transaction.reference
                );
                verifyPaymentAndShowSuccess(transaction.reference);
              },
              onCancel: () => {
                console.log("❌ Payment cancelled");
                setPaymentStep("form");
              },
              onClose: () => {
                console.log("❌ Payment cancelled");
                setPaymentStep("form");
              },
            });

            handler.openIframe();
          }, 1000);
        } else {
          // No payment required or payment handled differently
          setPaymentStep("success");
          setTimeout(() => {
            dispatch({
              type: ActionTypes.SET_CURRENT_STEP,
              payload: "confirmation",
            });
          }, 1000);
        }
      } else {
        throw new Error(result.message || "Failed to create furniture booking");
      }
    } catch (error) {
      console.error("❌ Furniture booking submission failed:", error);
      setPaymentStep("error");
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload:
          error.message ||
          "Failed to process furniture booking. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  // Handle back button
  const handleBack = () => {
    dispatch({
      type: ActionTypes.SET_CURRENT_STEP,
      payload: "sessionSelection",
    });
  };

  // Payment processing overlay
  if (
    paymentStep === "processing" ||
    paymentStep === "redirecting" ||
    paymentStep === "verifying"
  ) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
            <Loader className="w-10 h-10 text-orange-600 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {paymentStep === "processing"
              ? "Processing Booking..."
              : paymentStep === "redirecting"
              ? "Opening Payment..."
              : "Verifying Payment..."}
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            {paymentStep === "processing"
              ? "Please wait while we process your furniture booking."
              : paymentStep === "redirecting"
              ? "Redirecting you to complete payment..."
              : "Please wait while we verify your payment..."}
          </p>
          {paymentStep === "redirecting" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-blue-800">
                A payment window will open shortly. Please complete your payment
                to confirm your booking.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Success state
  if (paymentStep === "success") {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Your furniture booking has been confirmed and payment processed
            successfully.
          </p>
          <button
            onClick={() =>
              dispatch({
                type: ActionTypes.SET_CURRENT_STEP,
                payload: "confirmation",
              })
            }
            className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors"
          >
            View Booking Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          <span>Back to Sessions</span>
        </button>

        <div className="mb-4">
          <div className="flex items-center space-x-2 text-orange-600 mb-2">
            <User size={20} />
            <span className="text-sm font-medium">Personal Information</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Enter your personal information
          </h1>
          <p className="text-gray-600">
            Please provide your details to complete the furniture booking
          </p>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-3xl space-y-8">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle
                  className="text-red-400 mr-2 flex-shrink-0"
                  size={20}
                />
                <div>
                  <h3 className="text-sm font-medium text-red-800">
                    Booking Error
                  </h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Booking Summary */}
          {selectedFurniture && selectedSession && bookingData?.date && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-medium text-blue-900 mb-4">
                Booking Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Date:</span>
                  <span className="font-medium text-blue-900">
                    {new Date(bookingData.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Furniture:</span>
                  <span className="font-medium text-blue-900">
                    {selectedFurniture.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Session:</span>
                  <span className="font-medium text-blue-900">
                    {selectedSession.name} (
                    {formatTime(selectedSession.start_time)} -{" "}
                    {formatTime(selectedSession.end_time)})
                  </span>
                </div>
                <div className="flex justify-between border-t border-blue-200 pt-3 mt-3">
                  <span className="text-blue-700 font-medium">
                    Total Amount:
                  </span>
                  <span className="font-bold text-blue-900">
                    {formatCurrency(
                      totalAmount ||
                        (selectedFurniture.price || 0) +
                          (selectedSession.price || 0)
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="mr-2" size={20} />
                Personal Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                      formErrors.firstName
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter your first name"
                  />
                  {formErrors.firstName && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.firstName}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                      formErrors.lastName
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter your last name"
                  />
                  {formErrors.lastName && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                      formErrors.email
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter your email address"
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                      formErrors.phone
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter your phone number"
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Number of Guests */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Guests *
                </label>
                <select
                  value={formData.guests}
                  onChange={(e) =>
                    handleInputChange("guests", parseInt(e.target.value))
                  }
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    formErrors.guests
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                >
                  {Array.from(
                    { length: selectedFurniture?.max_capacity || 8 },
                    (_, i) => i + 1
                  ).map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? "Guest" : "Guests"}
                    </option>
                  ))}
                </select>
                {formErrors.guests && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.guests}
                  </p>
                )}
                {selectedFurniture?.max_capacity && (
                  <p className="mt-1 text-sm text-gray-500">
                    Maximum {selectedFurniture.max_capacity} guests allowed for{" "}
                    {selectedFurniture.name}
                  </p>
                )}
              </div>

              {/* Special Requests */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests (Optional)
                </label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) =>
                    handleInputChange("specialRequests", e.target.value)
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Any special requests or notes for your booking..."
                />
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="mr-2" size={20} />
                Payment Information
              </h3>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <Shield
                    className="text-orange-500 mr-2 flex-shrink-0 mt-0.5"
                    size={16}
                  />
                  <div className="text-sm">
                    <p className="text-orange-800 font-medium mb-1">
                      Secure Payment with Paystack
                    </p>
                    <p className="text-orange-700">
                      Your payment is processed securely through Paystack. We
                      accept all major cards and bank transfers.
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  Payment Summary
                </h4>
                <div className="space-y-2 text-sm">
                  {selectedFurniture && selectedFurniture.price > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Furniture ({selectedFurniture.name}):
                      </span>
                      <span className="text-gray-900">
                        {formatCurrency(selectedFurniture.price)}
                      </span>
                    </div>
                  )}
                  {selectedSession && selectedSession.price > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Session ({selectedSession.name}):
                      </span>
                      <span className="text-gray-900">
                        {formatCurrency(selectedSession.price)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-900">Total Amount:</span>
                      <span className="text-orange-600 text-lg">
                        {formatCurrency(
                          totalAmount ||
                            (selectedFurniture?.price || 0) +
                              (selectedSession?.price || 0)
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
                  isSubmitting || loading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-orange-600 text-white hover:bg-orange-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                }`}
              >
                {isSubmitting || loading ? (
                  <div className="flex items-center justify-center">
                    <Loader className="animate-spin mr-2" size={20} />
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <CreditCard className="mr-2" size={20} />
                    Proceed to Payment
                  </div>
                )}
              </button>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  By proceeding, you agree to our terms and conditions. Your
                  booking will be confirmed after successful payment.
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={isSubmitting || loading}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
        </div>
      </div>
    </div>
  );
};

export default FurniturePersonalInfo;
