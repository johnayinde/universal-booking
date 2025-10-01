// src/business-types/entry/components/EntryPersonalInfo.jsx - FIXED for Three-Column Layout
import React, { useState } from "react";
import { ArrowLeft, CheckCircle, AlertCircle, Loader } from "lucide-react";
import { useUniversalBooking } from "../../../core/UniversalStateManager";
import { ActionTypes } from "../../../core/UniversalStateManager";

const EntryPersonalInfo = ({ apiService, adapter }) => {
  const { state, dispatch, locationId } = useUniversalBooking();
  const { selectedItem, selections, customerInfo, totalAmount, config, error } =
    state;

  const [formData, setFormData] = useState({
    firstName: customerInfo.firstName || "",
    lastName: customerInfo.lastName || "",
    email: customerInfo.email || "",
    phone: customerInfo.phone || "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStep, setPaymentStep] = useState("form"); // "form", "processing", "success", "error"

  // Get selected tickets
  const selectedTickets = React.useMemo(() => {
    if (!state.selections) return [];
    return Object.values(state.selections).filter(
      (selection) => selection && selection.quantity > 0
    );
  }, [state.selections]);

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
  console.log({ PK: config.paystackPK });

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
      // Prepare booking data - Updated to match new API structure
      const bookingData = {
        date: state.bookingData?.date,
        platform: "web",
        ticket_type_id: selectedItem?.id,
        ticket_type: selectedItem?.name,
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        items: selectedTickets.map((ticket) => ({
          item_id: ticket.id,
          item_name: ticket.name,
          quantity: ticket.quantity,
          price: ticket.price,
        })),
      };

      // Submit booking - Updated to use the new endpoint format
      const result = await adapter.createBooking(bookingData);

      // Handle new response structure
      if (result.status && result.data) {
        const { booking, payment, customer } = result.data;

        // Store booking reference - Updated to use booking_ref
        dispatch({
          type: ActionTypes.SET_BOOKING_REFERENCE,
          payload: booking.booking_ref,
        });

        // Store payment reference for verification later
        localStorage.setItem("payment_reference", payment.reference);
        localStorage.setItem("booking_reference", booking.booking_ref);

        // Redirect to Paystack payment page
        // Replace the redirect section in handleSubmit with:
        if (payment.payment_url) {
          setPaymentStep("redirecting");

          setTimeout(() => {
            // Initialize Paystack popup
            const handler = window.PaystackPop.setup({
              key: config.paystackPK || process.env.REACT_APP_PAYSTACK_PUBLIC,
              email: customer.email, // REQUIRED
              amount: booking.total_amount * 100, // REQUIRED (NGN * 100)
              ref: payment.reference,
              callback: (transaction) => {
                // Set verification state and reference
                setPaymentStep("verifying");
                localStorage.setItem(
                  "payment_reference",
                  transaction.reference
                );
                // Trigger verification
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
          throw new Error("No payment URL received from server");
        }
      } else {
        throw new Error(result.msg || "Failed to create booking");
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

  const handleBack = () => {
    dispatch({ type: ActionTypes.SET_CURRENT_STEP, payload: "list" });
  };

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
      <div className="p-6 ">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          <span>Back to Tickets</span>
        </button>

        <div className="mb-4">
          <p className="text-gray-600">Enter your personal information</p>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1  overflow-y-auto">
        <div className="max-w-3xl">
          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 rounded-lg p-4">
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
