// src/components/UniversalBookingWidget.jsx - FIXED Modal Rendering
import React, { useEffect } from "react";
import { X } from "lucide-react";
import { useUniversalBooking } from "../core/UniversalStateManager";
import { ActionTypes } from "../core/UniversalStateManager";

/**
 * Fixed Universal Booking Widget - No Nested Modals
 */
const UniversalBookingWidget = () => {
  const {
    state,
    dispatch,
    adapter,
    apiService,
    currentStep,
    closeWidget,
    getLabels,
  } = useUniversalBooking();

  const { isWidgetOpen, config } = state;

  // Listen for external widget control events
  useEffect(() => {
    const handleOpenWidget = () => {
      if (!state.isWidgetOpen) {
        dispatch({ type: ActionTypes.SET_WIDGET_OPEN, payload: true });
      }
    };

    const handleCloseWidget = () => {
      if (state.isWidgetOpen) {
        dispatch({ type: ActionTypes.SET_WIDGET_OPEN, payload: false });
      }
    };

    // Listen for custom events from the widget API
    document.addEventListener("ubw:open-widget", handleOpenWidget);
    document.addEventListener("ubw:close-widget", handleCloseWidget);

    return () => {
      document.removeEventListener("ubw:open-widget", handleOpenWidget);
      document.removeEventListener("ubw:close-widget", handleCloseWidget);
    };
  }, [state.isWidgetOpen]);

  // Auto-open widget if autoShow is enabled
  useEffect(() => {
    if (config.autoShow && !isWidgetOpen) {
      setTimeout(() => {
        dispatch({ type: ActionTypes.SET_WIDGET_OPEN, payload: true });
      }, 500);
    }
  }, [config.autoShow]);

  // Don't render if widget is not open
  if (!isWidgetOpen) {
    return null;
  }

  // Get components from adapter
  const components = adapter.getComponents();
  const bookingSteps = adapter.getBookingSteps();
  const labels = adapter.getLabels();

  // Get current step component
  const CurrentStepComponent = components[currentStep];

  if (!CurrentStepComponent) {
    console.error(`No component found for step: ${currentStep}`);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">Unable to load this step.</p>
          <button
            onClick={closeWidget}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Apply custom branding
  const primaryColor = config.branding?.primaryColor || "#f97316";

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      {/* Single Modal Container - No Nesting */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {config.branding?.companyName || "Nike Lake Resort"}
              </h1>
              <p className="text-sm text-gray-600">Secure booking portal</p>
            </div>
          </div>
          <button
            onClick={closeWidget}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close booking widget"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Three-Column Layout Container */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Navigation & Progress */}
          <LeftSidebar
            currentStep={currentStep}
            bookingSteps={bookingSteps}
            config={config}
            state={state}
          />

          {/* Center Content - Main Component */}
          <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
            <CurrentStepComponent apiService={apiService} adapter={adapter} />
          </div>

          {/* Right Sidebar - Ticket Details & Summary */}
          <RightSidebar
            state={state}
            currentStep={currentStep}
            config={config}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Left Sidebar Component - Navigation & Progress
 */
const LeftSidebar = ({ currentStep, bookingSteps, config, state }) => {
  const getStepIcon = (step, index, isActive, isCompleted) => {
    if (isCompleted) {
      return (
        <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">
          ✓
        </div>
      );
    }

    if (isActive) {
      return (
        <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">
          {index + 1}
        </div>
      );
    }

    return (
      <div className="w-8 h-8 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center text-sm font-medium text-gray-500">
        {index + 1}
      </div>
    );
  };

  const currentStepIndex = bookingSteps.findIndex(
    (step) => step.key === currentStep
  );

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto">
      {/* Location Header */}
      <div className="mb-8">
        <div className="w-20 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg mb-4 flex items-center justify-center">
          <span className="text-white font-bold text-xl">🏨</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {config.branding?.companyName || "Nike Lake Resort, Enugu"}
        </h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Enjoy the perfect business getaway with breath-taking views in a very
          secure and tranquil setting
        </p>
      </div>

      {/* Progress Steps */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          Booking Progress
        </h3>

        <div className="space-y-3">
          {bookingSteps.map((step, index) => {
            const isActive = currentStep === step.key;
            const isCompleted = index < currentStepIndex;

            return (
              <div
                key={step.key}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-orange-100 border-l-4 border-orange-500"
                    : isCompleted
                    ? "bg-green-50"
                    : "bg-white border border-gray-200"
                }`}
              >
                {getStepIcon(step, index, isActive, isCompleted)}
                <div className="flex-1">
                  <span
                    className={`font-medium ${
                      isActive
                        ? "text-orange-800"
                        : isCompleted
                        ? "text-green-700"
                        : "text-gray-600"
                    }`}
                  >
                    {step.label || step.name}
                  </span>
                  {step.description && (
                    <p className="text-xs text-gray-500 mt-1">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security Badge */}
      <div className="mt-8 p-4 bg-white border border-gray-200 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
          <span className="text-sm font-medium text-gray-900">
            Secure Booking
          </span>
        </div>
        <p className="text-xs text-gray-600">
          Your payment information is encrypted and secure
        </p>
      </div>
    </div>
  );
};

/**
 * Right Sidebar Component - Ticket Details & Summary
 */
const RightSidebar = ({ state, currentStep, config }) => {
  const { selections, totalAmount, selectedItem, customerInfo } = state;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalTickets = () => {
    if (!selections) return 0;
    return Object.values(selections).reduce((total, selection) => {
      return total + (selection.quantity || 0);
    }, 0);
  };

  const getSelectedTickets = () => {
    if (!selections || typeof selections !== "object") return [];
    return Object.values(selections).filter(
      (selection) =>
        selection && typeof selection === "object" && selection.quantity > 0
    );
  };

  const selectedTickets = getSelectedTickets();
  const totalTickets = getTotalTickets();

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Booking Details
        </h3>
        <p className="text-sm text-gray-600">Review your selection</p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Selected Service */}
        {selectedItem && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Selected Service</h4>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-900">{selectedItem.name}</h5>
              {selectedItem.description && (
                <p className="text-sm text-blue-700 mt-1">
                  {selectedItem.description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Selected Tickets */}
        {selectedTickets.length > 0 ? (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">
              Selected Tickets ({totalTickets})
            </h4>
            <div className="space-y-3">
              {selectedTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 text-sm">
                        {ticket.name}
                      </h5>
                      {ticket.type && (
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded mt-1 inline-block">
                          {ticket.type}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(ticket.price)}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">
                      Quantity: {ticket.quantity}
                    </span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(ticket.price * ticket.quantity)}
                    </span>
                  </div>

                  {ticket.description && (
                    <p className="text-xs text-gray-500 mt-2">
                      {ticket.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Ticket Details</h4>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <div className="text-gray-400 mb-2">
                <svg
                  className="w-8 h-8 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a1 1 0 001 1h1a1 1 0 001-1V7a2 2 0 00-2-2H5zM5 14a2 2 0 00-2 2v3a1 1 0 001 1h1a1 1 0 001-1v-3a2 2 0 00-2-2H5z"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-600">No tickets selected</p>
              <p className="text-xs text-gray-500 mt-1">
                Select tickets to see details here
              </p>
            </div>
          </div>
        )}

        {/* Customer Information */}
        {currentStep === "booking" &&
          customerInfo &&
          Object.keys(customerInfo).length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">
                Customer Information
              </h4>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  {customerInfo.firstName && customerInfo.lastName && (
                    <div>
                      <span className="text-gray-600">Name: </span>
                      <span className="text-gray-900 font-medium">
                        {customerInfo.firstName} {customerInfo.lastName}
                      </span>
                    </div>
                  )}
                  {customerInfo.email && (
                    <div>
                      <span className="text-gray-600">Email: </span>
                      <span className="text-gray-900">
                        {customerInfo.email}
                      </span>
                    </div>
                  )}
                  {customerInfo.phone && (
                    <div>
                      <span className="text-gray-600">Phone: </span>
                      <span className="text-gray-900">
                        {customerInfo.phone}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
      </div>

      {/* Footer - Total & Actions */}
      <div className="border-t border-gray-200 p-6 bg-gray-50">
        {totalAmount > 0 ? (
          <div className="space-y-4">
            {/* Subtotal Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Service Fee</span>
                <span className="text-gray-900">₦0</span>
              </div>
              <div className="border-t border-gray-300 pt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-xl text-orange-600">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Note */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Complete your booking to proceed to secure payment
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Total amount will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversalBookingWidget;
