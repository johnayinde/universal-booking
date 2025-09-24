// src/business-types/entry/components/EntryPersonalInfo.jsx - FIXED for Three-Column Layout
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
} from "lucide-react";
import { useUniversalBooking } from "../../../core/UniversalStateManager";
import { ActionTypes } from "../../../core/UniversalStateManager";

const EntryPersonalInfo = ({ apiService, adapter }) => {
  const { state, dispatch } = useUniversalBooking();
  const {
    selectedItem,
    selections,
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
    agreeToTerms: false,
    agreeToMarketing: false,
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
  console.log({ state });

  // Get selected tickets
  const selectedTickets = React.useMemo(() => {
    if (!state.selections) return [];
    return Object.values(state.selections).filter(
      (selection) => selection && selection.quantity > 0
    );
  }, [state.selections]);

  // FIX: Calculate total from global state
  const totalTickets = React.useMemo(() => {
    return selectedTickets.reduce(
      (total, ticket) => total + ticket.quantity,
      0
    );
  }, [selectedTickets]);

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

    if (!formData.agreeToTerms) {
      errors.agreeToTerms = "You must agree to the terms and conditions";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission and payment processing
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (selectedTickets.length === 0) {
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: "No tickets selected",
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
        landmark_location_id: 2, // Enugu location
        customer_info: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          special_requests: formData.specialRequests,
          marketing_consent: formData.agreeToMarketing,
        },
        tickets: selectedTickets.map((ticket) => ({
          ticket_id: ticket.id,
          quantity: ticket.quantity,
          price: ticket.price,
        })),
        total_amount: totalAmount,
        currency: "NGN",
        payment_method: "paystack",
      };

      console.log("🎫 Submitting entry booking data:", bookingData);

      // Submit booking and get payment URL
      let result;
      if (adapter && typeof adapter.createBooking === "function") {
        result = await adapter.createBooking(bookingData);
      } else if (apiService && typeof apiService.createBooking === "function") {
        result = await apiService.createBooking(bookingData);
      } else {
        throw new Error("No booking service available");
      }

      if (result.success) {
        const { booking_reference, payment_url, booking_id } = result.data;

        // Store booking reference
        dispatch({
          type: ActionTypes.SET_BOOKING_REFERENCE,
          payload: booking_reference,
        });

        console.log("✅ Entry booking created successfully:", {
          booking_reference,
          payment_url,
          booking_id,
        });

        // Redirect to Paystack payment page
        if (payment_url) {
          console.log("🔄 Redirecting to Paystack payment page...");
          setPaymentStep("redirecting");

          // Add a small delay for user feedback
          setTimeout(() => {
            window.location.href = payment_url;
          }, 1500);
        } else {
          throw new Error("No payment URL received from server");
        }
      } else {
        throw new Error(result.error || "Failed to create booking");
      }
    } catch (error) {
      console.error("❌ Entry booking submission failed:", error);
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

  const handleBack = () => {
    dispatch({ type: ActionTypes.SET_CURRENT_STEP, payload: "list" });
  };
  console.log(
    "🚀 Form data validated, proceeding to booking submission...",
    selectedTickets
  );
  // Don't render if no tickets selected
  if (!selectedTickets || selectedTickets.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <AlertCircle size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Tickets Selected
          </h3>
          <p className="text-gray-600 mb-4">
            Please go back and select tickets to continue.
          </p>
          <button
            onClick={handleBack}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Select Tickets
          </button>
        </div>
      </div>
    );
  }

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

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          <span>Back to Tickets</span>
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
            Please provide your details to complete the booking
          </p>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl">
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
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                        formErrors.email
                          ? "border-red-500 bg-red-50"
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
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                        formErrors.phone
                          ? "border-red-500 bg-red-50"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  placeholder="Any special requirements or requests..."
                />
              </div>
            </div>

            {/* Payment Information Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="mr-2" size={20} />
                Payment Information
              </h3>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="text-blue-600" size={16} />
                  <span className="text-sm font-medium text-blue-900">
                    Secure Payment with Paystack
                  </span>
                </div>
                <p className="text-sm text-blue-700">
                  You will be redirected to Paystack's secure payment page to
                  complete your transaction. We accept Visa, Mastercard, Verve,
                  and bank transfers.
                </p>
              </div>

              {/* Order Summary */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Order Summary</h4>
                {selectedTickets.map((ticket) => (
                  <div key={ticket.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {ticket.name} × {ticket.quantity}
                    </span>
                    <span className="text-gray-900 font-medium">
                      {formatCurrency(ticket.price * ticket.quantity)}
                    </span>
                  </div>
                ))}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-xl text-orange-600">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={(e) =>
                      handleInputChange("agreeToTerms", e.target.checked)
                    }
                    className="mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label
                    htmlFor="agreeToTerms"
                    className="text-sm text-gray-700"
                  >
                    I agree to the{" "}
                    <a href="#" className="text-orange-600 hover:underline">
                      Terms and Conditions
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-orange-600 hover:underline">
                      Privacy Policy
                    </a>{" "}
                    *
                  </label>
                </div>
                {formErrors.agreeToTerms && (
                  <p className="text-sm text-red-600">
                    {formErrors.agreeToTerms}
                  </p>
                )}

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="agreeToMarketing"
                    checked={formData.agreeToMarketing}
                    onChange={(e) =>
                      handleInputChange("agreeToMarketing", e.target.checked)
                    }
                    className="mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label
                    htmlFor="agreeToMarketing"
                    className="text-sm text-gray-700"
                  >
                    I would like to receive updates and promotional offers via
                    email
                  </label>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between max-w-2xl">
          <button
            onClick={handleBack}
            disabled={isSubmitting}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Back
          </button>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">
                {totalTickets} ticket{totalTickets !== 1 ? "s" : ""}
              </p>
              <p className="text-lg font-bold text-orange-600">
                {formatCurrency(totalAmount)}
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || selectedTickets.length === 0}
              className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                isSubmitting || selectedTickets.length === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-orange-600 text-white hover:bg-orange-700 shadow-lg hover:shadow-xl"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard size={18} />
                  <span>Make Payment</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntryPersonalInfo;
