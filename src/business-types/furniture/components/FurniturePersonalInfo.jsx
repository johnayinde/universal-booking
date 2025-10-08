// src/business-types/furniture/components/FurniturePersonalInfo.jsx
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react";
import { useUniversalBooking } from "../../../core/UniversalStateManager";
import { ActionTypes } from "../../../core/UniversalStateManager";

const FurniturePersonalInfo = ({ apiService, adapter }) => {
  const { state, dispatch, locationId } = useUniversalBooking();
  const {
    selectedFurniture,
    selectedSession,
    bookingData,
    customerInfo,
    totalAmount,
    loading,
    config,
    error,
  } = state;

  const [formData, setFormData] = useState({
    firstName: customerInfo.firstName || "",
    lastName: customerInfo.lastName || "",
    email: customerInfo.email || "",
    phone: customerInfo.phone || "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStep, setPaymentStep] = useState("form");

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

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Verify payment and show success
  const verifyPaymentAndShowSuccess = async (reference) => {
    try {
      const apiBaseUrl = config.apiBaseUrl;

      // process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";
      const response = await fetch(
        `${apiBaseUrl}/payment/verify?reference=${reference}`,
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
        // Payment verified successfully
        dispatch({
          type: ActionTypes.SET_CURRENT_STEP,
          payload: "confirmation",
        });
        setPaymentStep("success");
      } else {
        throw new Error(result.message || "Payment verification failed");
      }
    } catch (error) {
      console.error("❌ Payment verification failed:", error);
      setPaymentStep("error");
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload:
          error.message ||
          "Payment verification failed. Please contact support.",
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
      // UPDATED: Prepare booking data for new API format matching expected response
      const furnitureBookingData = {
        date: bookingData.date,
        furniture_id: selectedFurniture.id,
        furniture_name: selectedFurniture.name,
        session_id: selectedSession.id,
        session_name: selectedSession.session_name || selectedSession.name,
        quantity: 1,
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
      };

      // Submit booking using adapter
      const result = await adapter.createFurnitureBooking(furnitureBookingData);

      // UPDATED: Handle new API response format {status, data: {booking, payment, customer}, msg, code}
      if (result.success && result.data) {
        const { booking, payment, customer } = result.data;

        // Store booking reference using booking_ref
        dispatch({
          type: ActionTypes.SET_BOOKING_REFERENCE,
          payload: booking.booking_ref,
        });

        // Store payment references for verification
        localStorage.setItem("payment_reference", payment.reference);
        localStorage.setItem("booking_reference", booking.booking_ref);

        // Handle Paystack payment
        if (payment.payment_url) {
          setPaymentStep("redirecting");

          setTimeout(() => {
            // Initialize Paystack popup
            const handler = window.PaystackPop.setup({
              key: config.paystackPK,
              email: customer.email,
              amount: booking.total_amount * 100, // Convert to kobo
              ref: payment.reference,
              callback: (transaction) => {
                console.log("✅ Payment successful:", transaction);
                setPaymentStep("verifying");
                // Trigger verification
                verifyPaymentAndShowSuccess(payment.reference);
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
          throw new Error("No payment URL received from server");
        }
      } else {
        throw new Error(
          result.error || result.msg || "Failed to create booking"
        );
      }
    } catch (error) {
      console.error("❌ Furniture booking submission failed:", error);
      setPaymentStep("error");
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload:
          error.message || "Failed to process booking. Please try again.",
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
      payload: "list",
    });
  };

  // Payment processing overlay
  if (paymentStep === "processing") {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Processing Your Booking
          </h3>
          <p className="text-gray-600">
            Please wait while we prepare your payment...
          </p>
        </div>
      </div>
    );
  }

  if (paymentStep === "redirecting") {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Booking Created Successfully!
          </h3>
          <p className="text-gray-600 mb-4">
            Redirecting you to secure payment page...
          </p>
          <div className="flex items-center justify-center space-x-2 text-orange-600">
            <Loader className="animate-spin" size={20} />
            <span>Redirecting to Paystack...</span>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStep === "error") {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-600" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Booking Failed
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => setPaymentStep("form")}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (paymentStep === "verifying") {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Verifying Payment
          </h3>
          <p className="text-gray-600">
            Please wait while we confirm your payment...
          </p>
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
          <span>Back to List</span>
        </button>
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div className="bg-white rounded-xl p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* First Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    placeholder="Enter First name"
                    className={`w-full rounded-lg border ${
                      formErrors.firstName
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300"
                    } px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900/10 focus:border-gray-400`}
                  />
                  {formErrors.firstName && (
                    <p className="mt-1 text-xs text-red-600">
                      {formErrors.firstName}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    placeholder="Enter last name"
                    className={`w-full rounded-lg border ${
                      formErrors.lastName
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300"
                    } px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900/10 focus:border-gray-400`}
                  />
                  {formErrors.lastName && (
                    <p className="mt-1 text-xs text-red-600">
                      {formErrors.lastName}
                    </p>
                  )}
                </div>

                {/* Email Address (full width) */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter Email address"
                    className={`w-full rounded-lg border ${
                      formErrors.email
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300"
                    } px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900/10 focus:border-gray-400`}
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-xs text-red-600">
                      {formErrors.email}
                    </p>
                  )}
                </div>

                {/* Phone Number (full width) */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Enter Phone Number"
                    className={`w-full rounded-lg border ${
                      formErrors.phone
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300"
                    } px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900/10 focus:border-gray-400`}
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-xs text-red-600">
                      {formErrors.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6">
        <div className="flex items-center justify-end">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || loading}
              className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                isSubmitting || loading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-orange-600 text-white hover:bg-orange-700 shadow-lg hover:shadow-xl"
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default FurniturePersonalInfo;
