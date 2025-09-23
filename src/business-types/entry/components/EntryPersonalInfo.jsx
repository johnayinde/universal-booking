// src/business-types/entry/components/EntryPersonalInfo.jsx - COMPLETE UI MATCH
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

    // Update global state
    dispatch({
      type: ActionTypes.UPDATE_CUSTOMER_INFO,
      payload: { ...customerInfo, [field]: value },
    });
  };

  const validateAndProceed = async () => {
    console.log("🔄 Starting booking process...");

    // Validate form data
    const validation = adapter.validateBookingData({
      selections: state.selections,
      customerInfo,
      selectedTickets: state.selectedItem?.selectedTickets || [],
      totalAmount: state.totalAmount,
    });

    setErrors(validation.errors || {});

    if (!validation.isValid) {
      console.log("❌ Validation failed:", validation.errors);
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

      console.log("📦 Submitting booking data:", bookingData);

      // Try API submission first
      try {
        const response = await apiService.post(
          "/api/entry/booking/create",
          bookingData
        );

        if (response.success) {
          const bookingRef =
            response.data.booking_ref || response.data.id || `ENT${Date.now()}`;

          dispatch({
            type: ActionTypes.SET_BOOKING_REFERENCE,
            payload: bookingRef,
          });

          // Check if payment URL is provided
          if (response.data.payment_url) {
            console.log("💳 Redirecting to Paystack payment...");
            window.location.href = response.data.payment_url;
            return;
          } else {
            // Move to confirmation step
            setCurrentStep("confirmation");
          }
        } else {
          setError(
            response.message || "Failed to create booking. Please try again."
          );
        }
      } catch (apiError) {
        console.warn(
          "⚠️ API not available, simulating booking...",
          apiError.message
        );

        // Simulate successful booking for demo
        const bookingRef = `ENT${Date.now()}`;
        dispatch({
          type: ActionTypes.SET_BOOKING_REFERENCE,
          payload: bookingRef,
        });

        console.log("✅ Demo booking created:", bookingRef);

        // Simulate payment redirect or go to confirmation
        setTimeout(() => {
          alert(
            `🎉 Demo Booking Created!\n\nReference: ${bookingRef}\n\nIn production, you would be redirected to Paystack for payment.`
          );
          setCurrentStep("confirmation");
        }, 1000);
      }
    } catch (error) {
      console.error("💥 Booking submission error:", error);
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

  const formatCurrency = (amount) => {
    return `₦${parseFloat(amount).toLocaleString()}`;
  };

  const selectedTickets = state.selectedItem?.selectedTickets || [];

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 p-6">
        <div className="mb-8">
          {/* <img
            src="/api/placeholder/80/60"
            alt="Nike Lake Resort"
            className="w-20 h-16 rounded-lg object-cover mb-4"
            onError={(e) => {
              e.target.src =
                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA4MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjIwIiB5PSIxNSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=";
            }}
          /> */}
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Nike Lake
            <br />
            Resort,
            <br />
            Enugu
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Welcome to Nike Lake Resort
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Enjoy the perfect blend of business and leisure with breath-taking
            views in a very secure and tranquil setting.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-2">
          <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-green-50 text-green-700">
            <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">
              ✓
            </div>
            <span className="font-medium">Booking Type</span>
          </div>

          <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-green-50 text-green-700">
            <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">
              ✓
            </div>
            <span className="font-medium">Tickets</span>
          </div>

          <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-orange-100 text-orange-700 border-l-4 border-orange-500">
            <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">
              3
            </div>
            <span className="font-medium text-orange-800">
              Personal Details
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Center Content */}
        <div className="flex-1 p-8">
          <div className="max-w-2xl">
            {/* Header */}
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
                      <input
                        type="text"
                        value={customerInfo.firstName}
                        onChange={(e) =>
                          updateField("firstName", e.target.value)
                        }
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                          errors.firstName
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter your first name"
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
                      <input
                        type="text"
                        value={customerInfo.lastName}
                        onChange={(e) =>
                          updateField("lastName", e.target.value)
                        }
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                          errors.lastName ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Enter your last name"
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
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your email address"
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
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your phone number"
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

        {/* Right Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Ticket Details
          </h3>

          <div className="space-y-4 mb-8">
            {selectedTickets.map((ticket) => (
              <div key={ticket.id} className="space-y-1">
                <div className="flex justify-between items-start">
                  <div className="text-sm font-medium text-gray-900">
                    {ticket.name}
                  </div>
                  <div className="text-sm font-bold text-gray-900">
                    {formatCurrency(ticket.price)}
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div className="text-sm text-gray-500">
                    {ticket.name?.includes("VIP")
                      ? "XMAS30 VIFID"
                      : `Quantity: ${ticket.quantity}`}
                  </div>
                  <div className="text-sm text-red-600">
                    {ticket.name?.includes("VIP") ? "₦1,000" : ""}
                  </div>
                </div>
              </div>
            ))}

            {selectedTickets.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-sm">No Data</div>
                <div className="text-xs mt-1">
                  No item has been added to cart
                </div>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 pt-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-xl font-bold text-gray-900">
                {formatCurrency(state.totalAmount || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={isProcessing}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isProcessing
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "text-gray-600 bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Back
          </button>

          <button
            onClick={validateAndProceed}
            disabled={isProcessing}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isProcessing
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-orange-500 text-white hover:bg-orange-600"
            }`}
          >
            {isProcessing ? "Processing..." : "Make Payment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EntryPersonalInfo;
