// src/business-types/entry/components/EntryPersonalInfo.jsx
import React, { useState, useEffect } from "react";
import { useUniversalBooking } from "../../../core/UniversalStateManager";
import { ActionTypes } from "../../../core/UniversalStateManager";
import {
  User,
  Mail,
  Phone,
  Ticket,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";

const EntryPersonalInfo = () => {
  const {
    state,
    dispatch,
    adapter,
    apiService,
    setCurrentStep,
    setError,
    setLoading,
  } = useUniversalBooking();

  const [customerInfo, setCustomerInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Load existing customer info if available
  useEffect(() => {
    if (state.customerInfo) {
      setCustomerInfo(state.customerInfo);
    }
  }, [state.customerInfo]);

  const updateField = (field, value) => {
    setCustomerInfo((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }

    // Update state
    dispatch({
      type: ActionTypes.UPDATE_CUSTOMER_INFO,
      payload: { ...customerInfo, [field]: value },
    });
  };

  const validateAndProceed = async () => {
    // Validate form data
    const validation = adapter.validateBookingData({
      selections: state.selections,
      customerInfo,
      selectedTickets: state.selectedItem?.selectedTickets || [],
      totalAmount: state.totalAmount,
    });

    setErrors(validation.errors || {});

    if (!validation.isValid) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Transform booking data for API
      const bookingData = adapter.transformBookingData({
        selections: state.selections,
        customerInfo,
        selectedTickets: state.selectedItem?.selectedTickets || [],
        totalAmount: state.totalAmount,
      });

      console.log("Submitting booking data:", bookingData);

      // Submit booking to API
      const response = await apiService.post(
        "/api/entry/booking/create",
        bookingData
      );

      if (response.success) {
        // Store booking reference
        const bookingRef =
          response.data.booking_ref || response.data.id || `ENT${Date.now()}`;

        dispatch({
          type: ActionTypes.SET_BOOKING_REFERENCE,
          payload: bookingRef,
        });

        // Check if payment URL is provided
        if (response.data.payment_url) {
          // Redirect to Paystack payment
          window.location.href = response.data.payment_url;
        } else {
          // Move to confirmation step
          setCurrentStep("confirmation");
        }
      } else {
        setError(
          response.message || "Failed to create booking. Please try again."
        );
      }
    } catch (error) {
      console.error("Booking submission error:", error);
      setError(
        "Failed to create booking. Please check your connection and try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    setCurrentStep("list");
  };

  const getStepIcon = (stepKey, isActive, isCompleted) => {
    const icons = {
      list: Ticket,
      booking: User,
      confirmation: CheckCircle,
    };

    const Icon = icons[stepKey];
    return Icon ? (
      <Icon size={20} />
    ) : (
      <div className="w-5 h-5 bg-current rounded-full" />
    );
  };

  const bookingSteps = adapter.getBookingSteps();
  const currentStepIndex = bookingSteps.findIndex(
    (step) => step.key === state.currentStep
  );
  const selectedTickets = state.selectedItem?.selectedTickets || [];

  return (
    <div className="h-full flex bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-72 bg-white border-r border-gray-200 p-6">
        <div className="mb-8">
          <img
            src="/api/placeholder/80/60"
            alt="Nike Lake Resort"
            className="w-20 h-15 rounded-lg object-cover mb-4"
          />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Nike Lake Resort, Enugu
          </h2>
          <p className="text-gray-600 text-sm">
            Enjoy the perfect blend of business and leisure with peaceful
            waterfront setting.
          </p>
        </div>

        {/* Booking Steps */}
        <div className="space-y-1">
          {bookingSteps.map((step, index) => {
            const isActive = state.currentStep === step.key;
            const isCompleted = index < currentStepIndex;
            const isEnabled = index <= currentStepIndex || isCompleted;

            return (
              <div
                key={step.key}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-orange-100 text-orange-700 border-l-4 border-orange-500"
                    : isCompleted
                    ? "bg-green-50 text-green-700"
                    : isEnabled
                    ? "text-gray-600 hover:bg-gray-50"
                    : "text-gray-400"
                }`}
              >
                <div
                  className={`flex-shrink-0 ${
                    isActive
                      ? "text-orange-600"
                      : isCompleted
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  {getStepIcon(step.key, isActive, isCompleted)}
                </div>
                <span
                  className={`font-medium ${isActive ? "text-orange-800" : ""}`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        <div className="flex-1 p-8">
          <div className="max-w-2xl">
            <div className="mb-8">
              <div className="flex items-center space-x-2 text-orange-600 mb-2">
                <User size={20} />
                <span className="text-sm font-medium">
                  Personal Information
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Enter your personal information
              </h1>
            </div>

            {/* Personal Information Form */}
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <User
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type="text"
                        value={customerInfo.firstName}
                        onChange={(e) =>
                          updateField("firstName", e.target.value)
                        }
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                          errors.firstName
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter first name"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <div className="relative">
                      <User
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type="text"
                        value={customerInfo.lastName}
                        onChange={(e) =>
                          updateField("lastName", e.target.value)
                        }
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                          errors.lastName ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Enter last name"
                      />
                    </div>
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter phone number"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
              </form>

              {/* Error Display */}
              {state.error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Booking Error
                      </h3>
                      <p className="mt-1 text-sm text-red-700">{state.error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Booking Summary */}
        <div className="w-80 bg-white border-l border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Ticket Details
          </h3>

          <div className="space-y-4 mb-8">
            {selectedTickets.map((ticket) => (
              <div key={ticket.id} className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {ticket.name} x{ticket.quantity}
                  </div>
                  <div className="text-sm text-gray-500">
                    {adapter.formatCurrency(ticket.price, state.config)} each
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {adapter.formatCurrency(ticket.totalPrice, state.config)}
                </div>
              </div>
            ))}

            {selectedTickets.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Ticket size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No tickets selected</p>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 pt-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-xl font-bold text-gray-900">
                {adapter.formatCurrency(state.totalAmount, state.config)}
              </span>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="space-y-3">
            <button
              onClick={validateAndProceed}
              disabled={isProcessing}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                isProcessing
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-orange-600 text-white hover:bg-orange-700"
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                "Make Payment"
              )}
            </button>

            <button
              onClick={handleBack}
              disabled={isProcessing}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                isProcessing
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "text-gray-700 bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <ArrowLeft size={16} />
                <span>Back</span>
              </div>
            </button>
          </div>

          {/* Payment Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-900">
                  Secure Payment
                </h4>
                <p className="mt-1 text-sm text-blue-800">
                  Your payment will be processed securely through Paystack.
                  You'll be redirected to complete your payment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntryPersonalInfo;
