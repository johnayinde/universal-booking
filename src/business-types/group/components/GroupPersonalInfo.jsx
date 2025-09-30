// src/business-types/group/components/GroupPersonalInfo.jsx
import React, { useState, useContext } from "react";
import { ArrowLeft, AlertCircle, CheckCircle, Loader } from "lucide-react";
import UniversalBookingContext, {
  ActionTypes,
} from "../../../core/UniversalStateManager";

/**
 * Group Personal Info Component
 * Fourth step: Personal information form with payment summary
 * Reuses design patterns from entry and furniture booking
 */
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
      ? parseFloat(packageDetails.price || 0)
      : 0;

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

  // Handle payment verification and success
  const verifyPaymentAndShowSuccess = async (reference) => {
    try {
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
        // Payment verified successfully, show success
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

    if (!packageDetails || !selectedPackageSize) {
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: "Missing booking information. Please start over.",
      });
      return;
    }

    setIsSubmitting(true);
    setPaymentStep("processing");
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    dispatch({ type: ActionTypes.CLEAR_ERROR });

    try {
      // Prepare booking data
      const bookingData = {
        date: selectedDate,
        package_option_id: selectedPackageOption.id,
        package_name: packageDetails.name,
        // group_size: selectedPackageSize.size,
        total_amount: totalAmount,
        customer_info: {
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
        },
      };

      // Submit booking
      const result = await adapter.createBooking(bookingData);

      // Handle response
      if (result.success && result.data) {
        const { booking, payment, customer } = result.data;

        // Store booking reference
        dispatch({
          type: ActionTypes.SET_BOOKING_REFERENCE,
          payload: booking.booking_ref,
        });

        // Store payment reference for verification
        localStorage.setItem("payment_reference", payment.reference);
        localStorage.setItem("booking_reference", booking.booking_ref);

        // Handle payment
        if (payment.payment_url) {
          setPaymentStep("redirecting");

          setTimeout(() => {
            // Initialize Paystack popup
            const handler = window.PaystackPop.setup({
              key: process.env.REACT_APP_PAYSTACK_PUBLIC, // Replace with your actual Paystack public key
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
                setIsSubmitting(false);
                dispatch({ type: ActionTypes.SET_LOADING, payload: false });
              },
              onClose: () => {
                console.log("❌ Payment popup closed");
                setPaymentStep("form");
                setIsSubmitting(false);
                dispatch({ type: ActionTypes.SET_LOADING, payload: false });
              },
            });

            handler.openIframe();
          }, 1000);
        } else {
          throw new Error("No payment URL received from server");
        }
      } else {
        throw new Error(result.error || "Failed to create booking");
      }
    } catch (error) {
      console.error("❌ Group booking submission failed:", error);
      setPaymentStep("error");
      setIsSubmitting(false);
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload:
          error.message || "Failed to process booking. Please try again.",
      });
    }
  };

  // Handle back navigation
  const handleBack = () => {
    dispatch({
      type: ActionTypes.SET_CURRENT_STEP,
      payload: "list",
    });
  };

  // Payment processing states
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

  if (paymentStep === "success") {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md mx-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Your booking has been confirmed and payment processed successfully.
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
      <div className="p-6">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          <span>Back to Package Details</span>
        </button>
      </div>

      {/* Form Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-3xl">
          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
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

      {/* Footer Actions */}
      <div className="p-6">
        <div className="flex items-center justify-end">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !packageDetails}
              className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                isSubmitting || !packageDetails
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-orange-600 text-white hover:bg-orange-700 shadow-lg hover:shadow-xl"
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <Loader className="animate-spin mr-2" size={20} />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  Make Payment
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupPersonalInfo;
