// src/business-types/group/components/GroupPersonalInfo.jsx - Enhanced with Payment Verification
import React, { useState, useEffect, useContext } from "react";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Loader,
  Users,
  Calendar,
  Package,
  Shield,
} from "lucide-react";
import UniversalBookingContext, {
  ActionTypes,
} from "../../../core/UniversalStateManager";

const GroupPersonalInfo = ({ apiService, adapter }) => {
  const { state, dispatch } = useContext(UniversalBookingContext);
  const { selectedDate, error, isLoading, selection, customerInfo } = state;

  // Local state for form
  const [formData, setFormData] = useState({
    firstName: customerInfo?.firstName || "",
    lastName: customerInfo?.lastName || "",
    email: customerInfo?.email || "",
    phone: customerInfo?.phone || "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStep, setPaymentStep] = useState("form"); // form, processing, redirecting, verifying, success, error

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

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "Not selected";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
    }

    return errors;
  };

  // Verify payment and show success
  const verifyPaymentAndShowSuccess = async (reference) => {
    try {
      console.log("🔍 Verifying group booking payment:", reference);

      const apiBaseUrl =
        process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";
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
      console.error("❌ Group booking payment verification failed:", error);
      setPaymentStep("error");
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload:
          error.message ||
          "Payment verification failed. Please contact support.",
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setPaymentStep("processing");
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    dispatch({ type: ActionTypes.CLEAR_ERROR });

    try {
      // Prepare booking data for group/package booking
      const groupBookingData = {
        platform: "web",
        booking_type: "group_package",
        package_id: packageDetails.id,
        package_name: packageDetails.name,
        selected_date: selectedDate,
        group_size: selectedPackageSize.size,
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        total_amount: totalAmount,
        location_id: state.locationId,
      };

      console.log("🏕️ Submitting group booking data:", groupBookingData);

      // Submit booking using adapter
      const result = await adapter.createGroupBooking(groupBookingData);

      // Handle response format {status, data: {booking, payment, customer}, msg}
      if (result.status && result.data) {
        const { booking, payment, customer } = result.data;

        // Store booking reference
        dispatch({
          type: ActionTypes.SET_BOOKING_REFERENCE,
          payload: booking.booking_ref,
        });

        console.log("✅ Group booking created successfully:", {
          booking_reference: booking.booking_ref,
          payment_url: payment.payment_url,
          booking_id: booking.id,
          payment_reference: payment.reference,
          customer,
        });

        // Store payment references for verification
        localStorage.setItem("payment_reference", payment.reference);
        localStorage.setItem("booking_reference", booking.booking_ref);

        // Handle Paystack payment
        if (payment.payment_url) {
          console.log("🔄 Opening Paystack payment popup for group booking...");
          setPaymentStep("redirecting");

          setTimeout(() => {
            // Initialize Paystack popup
            const handler = window.PaystackPop.setup({
              key: process.env.REACT_APP_PAYSTACK_PUBLIC,
              email: customer.email,
              amount: booking.total_amount * 100, // Convert to kobo
              ref: payment.reference,
              callback: (transaction) => {
                console.log(
                  "✅ Group booking payment successful:",
                  transaction
                );
                setPaymentStep("verifying");
                localStorage.setItem(
                  "payment_reference",
                  transaction.reference
                );
                // Trigger verification
                verifyPaymentAndShowSuccess(transaction.reference);
              },
              onCancel: () => {
                console.log("❌ Group booking payment cancelled");
                setPaymentStep("form");
              },
              onClose: () => {
                console.log("❌ Group booking payment cancelled");
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
          result.error || result.msg || "Failed to create group booking"
        );
      }
    } catch (error) {
      console.error("❌ Group booking submission failed:", error);
      setPaymentStep("error");
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload:
          error.message || "Failed to process group booking. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  // Handle back navigation
  const handleBack = () => {
    dispatch({
      type: ActionTypes.SET_CURRENT_STEP,
      payload: "details",
    });
  };

  // Processing state
  if (paymentStep === "processing") {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Processing Your Booking
          </h3>
          <p className="text-gray-600">
            Please wait while we prepare your payment...
          </p>
        </div>
      </div>
    );
  }

  // Redirecting state
  if (paymentStep === "redirecting") {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-pulse">
            <CreditCard className="mx-auto mb-4 text-emerald-600" size={48} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Redirecting to Payment
          </h3>
          <p className="text-gray-600 mb-4">
            Redirecting you to secure payment page...
          </p>
          <div className="flex items-center justify-center space-x-2 text-emerald-600">
            <Loader className="animate-spin" size={20} />
            <span>Redirecting to Paystack...</span>
          </div>
        </div>
      </div>
    );
  }

  // Verifying payment state
  if (paymentStep === "verifying") {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="relative">
            {/* Outer rotating circle */}
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-emerald-600 mx-auto mb-6"></div>
            {/* Inner pulsing circle */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
              <div className="animate-pulse w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <Shield className="text-emerald-600" size={24} />
              </div>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Verifying Payment
          </h3>
          <p className="text-gray-600">
            Please wait while we confirm your payment...
          </p>
          <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-3 max-w-md mx-auto">
            <p className="text-sm text-emerald-700">
              🔒 Your payment is being securely verified
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
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
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Try Again
          </button>
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
            Your group booking has been confirmed and payment processed
            successfully.
          </p>
          <button
            onClick={() =>
              dispatch({
                type: ActionTypes.SET_CURRENT_STEP,
                payload: "confirmation",
              })
            }
            className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            View Booking Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          <span>Back to Package Details</span>
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Enter your details to proceed with payment
          </h1>
          <p className="text-gray-600">
            Complete your group booking for {packageDetails?.name}
          </p>
        </div>
      </div>

      {/* Main Content - THREE COLUMN LAYOUT */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN - Personal Information Form */}
          <div className="lg:col-span-2 space-y-6">
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

            {/* Personal Information Form */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <User className="mr-2 text-emerald-600" size={20} />
                Personal Information
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
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
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${
                        formErrors.firstName
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter your first name"
                      disabled={isSubmitting}
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
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${
                        formErrors.lastName
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter your last name"
                      disabled={isSubmitting}
                    />
                    {formErrors.lastName && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${
                          formErrors.email
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter your email address"
                        disabled={isSubmitting}
                      />
                    </div>
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
                    <div className="relative">
                      <Phone
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${
                          formErrors.phone
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter your phone number"
                        disabled={isSubmitting}
                      />
                    </div>
                    {formErrors.phone && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || paymentStep === "processing"}
                    className="w-full bg-emerald-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="animate-spin mr-2" size={18} />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2" size={18} />
                        Complete Payment
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Secure Payment Notice */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center">
                <div className="bg-emerald-100 p-2 rounded-full mr-4">
                  <CheckCircle className="text-emerald-600" size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Secure Payment</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    We accept cards and bank transfers through our secure
                    payment gateway.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Booking Summary
              </h3>

              {/* Selected Package */}
              {packageDetails && (
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Package className="mr-2 text-emerald-600" size={16} />
                      <span className="text-sm font-medium text-gray-700">
                        Package
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {packageDetails.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {packageDetails.description?.substring(0, 80)}...
                    </p>
                    <div className="text-emerald-600 font-semibold">
                      {formatCurrency(packageDetails.price)}
                    </div>
                  </div>
                </div>
              )}

              {/* Date */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center">
                  <Calendar className="mr-2 text-emerald-600" size={16} />
                  <div>
                    <div className="text-sm font-medium text-gray-700">
                      Date
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatDate(selectedDate)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Group Size */}
              {selectedPackageSize && (
                <div className="space-y-4 mb-6">
                  <div className="flex items-center">
                    <Users className="mr-2 text-emerald-600" size={16} />
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        Group Size
                      </div>
                      <div className="text-sm text-gray-600">
                        {selectedPackageSize.size} people
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Package Cost</span>
                  <span className="text-gray-900">
                    {formatCurrency(packageDetails?.price || 0)}
                  </span>
                </div>

                {selectedPackageSize &&
                  parseInt(selectedPackageSize.size) > 1 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        × {selectedPackageSize.size} people
                      </span>
                      <span className="text-gray-900">
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>
                  )}

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-emerald-600 text-lg">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">
                    Secure Payment Methods
                  </div>
                  <div className="flex justify-center items-center space-x-2 text-xs text-gray-500">
                    <span>💳 Cards</span>
                    <span>•</span>
                    <span>🏦 Bank Transfer</span>
                    <span>•</span>
                    <span>📱 Mobile Money</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupPersonalInfo;
