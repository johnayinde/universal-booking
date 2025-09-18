import React, { useState } from "react";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  CreditCard,
  Lock,
  AlertCircle,
} from "lucide-react";
import { useUniversalBooking } from "../../../core/UniversalStateManager";
import { ActionTypes } from "../../../core/UniversalStateManager";

const EventBookingForm = ({ apiService, adapter }) => {
  const { state, dispatch } = useUniversalBooking();
  const {
    selectedItem: event,
    selections,
    customerInfo,
    totalAmount,
    loading,
  } = state;

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const validation = adapter.validateBookingData({
      selectedItem: event,
      selections,
      customerInfo,
    });

    setFormErrors(validation.errors || {});
    return validation.isValid;
  };

  const handleInputChange = (field, value) => {
    dispatch({
      type: ActionTypes.UPDATE_CUSTOMER_INFO,
      payload: { [field]: value },
    });

    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    dispatch({ type: ActionTypes.CLEAR_ERROR });

    try {
      const bookingData = {
        selectedItem: event,
        selections,
        customerInfo,
        totalAmount,
      };

      const result = await apiService.createBooking(bookingData);

      if (result.success) {
        const bookingRef =
          result.data.booking_ref ||
          result.data.order_id ||
          result.data.order_ids?.[0] ||
          `BK${Date.now()}`;

        dispatch({
          type: ActionTypes.SET_BOOKING_REFERENCE,
          payload: bookingRef,
        });
        dispatch({
          type: ActionTypes.SET_PAYMENT_STATUS,
          payload: "completed",
        });
        dispatch({
          type: ActionTypes.SET_CURRENT_STEP,
          payload: "confirmation",
        });
      } else {
        dispatch({ type: ActionTypes.SET_ERROR, payload: result.error });
      }
    } catch (error) {
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: "Failed to create booking. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  const handleBack = () => {
    dispatch({ type: ActionTypes.SET_CURRENT_STEP, payload: "selection" });
  };

  if (!event || !Object.keys(selections).length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No tickets selected</p>
        <button
          onClick={() =>
            dispatch({ type: ActionTypes.SET_CURRENT_STEP, payload: "list" })
          }
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Browse Events
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to Tickets</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Form */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Booking Information
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
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
                          handleInputChange("firstName", e.target.value)
                        }
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          formErrors.firstName
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter your first name"
                      />
                    </div>
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
                    <div className="relative">
                      <User
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type="text"
                        value={customerInfo.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          formErrors.lastName
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter your last name"
                      />
                    </div>
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
                        value={customerInfo.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          formErrors.email
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter your email"
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
                        value={customerInfo.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          formErrors.phone
                            ? "border-red-500"
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

              {/* Payment Section */}
              {totalAmount > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <CreditCard className="mr-2" size={20} />
                    Payment Information
                  </h3>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                      <Lock className="text-blue-500 mr-2" size={16} />
                      <span className="text-blue-800 text-sm">
                        Secure payment processing - Your information is
                        protected
                      </span>
                    </div>
                  </div>

                  <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                    <CreditCard
                      className="mx-auto text-gray-400 mb-2"
                      size={32}
                    />
                    <p className="text-gray-600">
                      Payment integration will be implemented here
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      For now, booking will be created as pending payment
                    </p>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {state.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="text-red-400 mr-2" size={20} />
                    <span className="text-red-700">{state.error}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="sm:w-auto bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                    isSubmitting || loading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-primary-600 text-white hover:bg-primary-700"
                  }`}
                >
                  {isSubmitting || loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : totalAmount > 0 ? (
                    `Pay $${totalAmount.toFixed(2)}`
                  ) : (
                    "Complete Booking"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Order Summary
            </h3>

            {/* Event Info */}
            <div className="mb-4 pb-4 border-b border-gray-200">
              <h4 className="font-medium text-gray-900">{event.name}</h4>
              <p className="text-sm text-gray-600">{event.formattedDate}</p>
              {event.formattedTime && (
                <p className="text-sm text-gray-600">{event.formattedTime}</p>
              )}
            </div>

            {/* Selected Tickets */}
            <div className="space-y-3 mb-4">
              {Object.values(selections).map((ticket) => (
                <div key={ticket.id} className="flex justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {ticket.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Qty: {ticket.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      ${(ticket.price * ticket.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">
                  Total
                </span>
                <span className="text-lg font-semibold text-gray-900">
                  {totalAmount === 0 ? "Free" : `$${totalAmount.toFixed(2)}`}
                </span>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center text-sm text-gray-600">
                <Lock className="mr-2" size={14} />
                <span>Secure and encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventBookingForm;
