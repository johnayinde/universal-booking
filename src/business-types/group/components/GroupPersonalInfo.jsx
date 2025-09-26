// src/business-types/group/components/GroupPersonalInfo.jsx
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
} from "lucide-react";
import UniversalBookingContext, {
  ActionTypes,
} from "../../../core/UniversalStateManager";

/**
 * Group Personal Info Component
 * Fourth step: Personal information form with payment summary
 * Reuses design patterns from entry and furniture booking
 */
const GroupPersonalInfo = () => {
  const { state, dispatch } = useContext(UniversalBookingContext);
  const { adapter, selectedDate, error, isLoading, selection, customerInfo } =
    state;

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
  const verifyPaymentAndShowSuccess = async (paymentReference) => {
    try {
      // Here you would typically verify payment with your backend
      console.log("✅ Payment verified:", paymentReference);

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
        package_option_id: packageDetails.id,
        package_name: packageDetails.name,
        group_size: selectedPackageSize.size,
        total_amount: totalAmount,
        customer_info: {
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
        },
      };

      console.log("👥 Submitting group booking data:", bookingData);

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

        console.log("✅ Group booking created successfully:", {
          booking_reference: booking.booking_ref,
          payment_url: payment.payment_url,
          booking_id: booking.id,
          payment_reference: payment.reference,
          customer,
        });

        // Store payment reference for verification
        localStorage.setItem("payment_reference", payment.reference);
        localStorage.setItem("booking_reference", booking.booking_ref);

        // Handle payment
        if (payment.payment_url) {
          console.log("🔄 Opening Paystack payment popup...");
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
      payload: "selection",
    });
  };

  // Show payment success screen
  if (paymentStep === "success") {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md mx-4">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          <span>Back to Package Details</span>
        </button>

        <div className="mb-4">
          <div className="flex items-center space-x-2 text-emerald-600 mb-2">
            <User size={20} />
            <span className="text-sm font-medium">Personal Information</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Complete Your Group Booking
          </h1>
          <p className="text-gray-600">
            Enter your details to proceed with payment
          </p>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
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
              {/* Personal Information */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="mr-2" size={20} />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    />
                    {formErrors.lastName && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.lastName}
                      </p>
                    )}
                  </div>

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
                      />
                    </div>
                    {formErrors.phone && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column - Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="mr-2" size={20} />
                Booking Summary
              </h3>

              {/* Booking Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm">
                  <Calendar className="mr-2 text-emerald-600" size={16} />
                  <div>
                    <div className="font-medium">
                      {new Date(selectedDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-sm">
                  <Package className="mr-2 text-emerald-600" size={16} />
                  <div>
                    <div className="font-medium">{packageDetails?.name}</div>
                  </div>
                </div>

                <div className="flex items-center text-sm">
                  <Users className="mr-2 text-emerald-600" size={16} />
                  <div>
                    <div className="font-medium">
                      {selectedPackageSize?.size} people
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {packageDetails?.name} × {selectedPackageSize?.size}
                  </span>
                  <span className="text-gray-900 font-medium">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-xl text-emerald-600">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="mb-6 p-4 bg-emerald-50 rounded-lg">
                <h4 className="font-medium text-emerald-900 mb-2">
                  Secure Payment
                </h4>
                <p className="text-sm text-emerald-700">
                  We accept cards and bank transfers through our secure payment
                  gateway.
                </p>
              </div>

              {/* Payment Button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !packageDetails}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                  isSubmitting || !packageDetails
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg hover:shadow-xl"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="animate-spin" size={18} />
                    <span>
                      {paymentStep === "processing" && "Processing..."}
                      {paymentStep === "redirecting" && "Opening Payment..."}
                      {paymentStep === "verifying" && "Verifying Payment..."}
                    </span>
                  </>
                ) : (
                  <>
                    <CreditCard size={18} />
                    <span>Complete Payment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupPersonalInfo;
