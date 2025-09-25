// src/components/UniversalBookingWidget.jsx - MOBILE RESPONSIVE
import React, { useEffect } from "react";
import { X } from "lucide-react";
import { useUniversalBooking } from "../core/UniversalStateManager";
import { ActionTypes } from "../core/UniversalStateManager";

/**
 * Universal Booking Widget - Responsive
 */
const UniversalBookingWidget = () => {
  const { state, dispatch, adapter, apiService, currentStep, closeWidget } =
    useUniversalBooking();

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

    document.addEventListener("ubw:open-widget", handleOpenWidget);
    document.addEventListener("ubw:close-widget", handleCloseWidget);

    return () => {
      document.removeEventListener("ubw:open-widget", handleOpenWidget);
      document.removeEventListener("ubw:close-widget", handleCloseWidget);
    };
  }, [state.isWidgetOpen, dispatch]);

  // Auto-open widget if autoShow is enabled
  useEffect(() => {
    if (config.autoShow && !isWidgetOpen) {
      const t = setTimeout(() => {
        dispatch({ type: ActionTypes.SET_WIDGET_OPEN, payload: true });
      }, 500);
      return () => clearTimeout(t);
    }
  }, [config.autoShow, isWidgetOpen, dispatch]);

  // Listen for close widget messages and reset to main list
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === "close-widget") {
        sessionStorage.removeItem("selectedBusinessType");
        closeWidget();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [closeWidget]);

  // Handle proper widget cleanup on close
  useEffect(() => {
    const handleCloseWidget = () => {
      // Clear any stored state
      sessionStorage.removeItem("selectedBusinessType");

      // Destroy widget instances
      if (window.UniversalBookingWidget) {
        window.UniversalBookingWidget.destroyAll();
      }
    };

    // Listen for close events
    document.addEventListener("ubw:close-widget", handleCloseWidget);

    return () => {
      document.removeEventListener("ubw:close-widget", handleCloseWidget);
    };
  }, []);

  if (!isWidgetOpen) return null;

  // Adapter pieces
  const components = adapter.getComponents();
  const bookingSteps = adapter.getBookingSteps();
  const CurrentStepComponent = components[currentStep];

  if (!CurrentStepComponent) {
    console.error(`No component found for step: ${currentStep}`);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">Unable to load this step.</p>
          <button
            // onClick={closeWidget}
            onClick={() => {
              sessionStorage.removeItem("selectedBusinessType");
              setTimeout(() => {
                const newConfig = {
                  ...config,
                  businessType: null, // or undefined
                };
                window.UniversalBookingWidget.init(newConfig).open();
              }, 100);
              closeWidget();
            }}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={[
        "fixed inset-0 z-50 bg-black/50",
        // safe area on mobile
        "pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]",
        "px-0 sm:px-4",
        "flex items-stretch sm:items-center justify-center",
      ].join(" ")}
    >
      {/* Modal container: full-screen on mobile, card on larger screens */}
      <div
        className={[
          "bg-white shadow-2xl w-full",
          "h-dvh sm:h-[90vh]",
          "rounded-none sm:rounded-2xl",
          "flex flex-col overflow-hidden",
          "max-w-none sm:max-w-[100rem]",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-base sm:text-lg">
                N
              </span>
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">
                {config.branding?.companyName || "Nike Lake Resort"}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                Secure booking portal
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sessionStorage.removeItem("selectedBusinessType");
              setTimeout(() => {
                const newConfig = {
                  ...config,
                  businessType: null, // or undefined
                };
                window.UniversalBookingWidget.init(newConfig).open();
              }, 100);
              closeWidget();
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close booking widget"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Mobile progress (hidden on lg+) */}
        <MobileProgress currentStep={currentStep} bookingSteps={bookingSteps} />

        {/* Body: columns on lg+, stacked on smaller */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Sidebar: hidden on small; shows from lg */}
          <div className="hidden lg:block lg:w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto">
            <div className="p-6">
              <LeftSidebar
                currentStep={currentStep}
                bookingSteps={bookingSteps}
                config={config}
                state={state}
              />
            </div>
          </div>

          {/* Center Content */}
          <div className="flex-1 order-1 lg:order-none bg-gray-50 overflow-y-auto">
            <div className="p-4 sm:p-6">
              <CurrentStepComponent apiService={apiService} adapter={adapter} />
            </div>
          </div>

          {/* Right Sidebar: becomes bottom section on small screens */}
          <div className="order-2 lg:order-none w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 overflow-y-auto">
            <RightSidebar
              state={state}
              currentStep={currentStep}
              config={config}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/** Mobile progress bar (horizontal, scrollable) */
const MobileProgress = ({ currentStep, bookingSteps }) => {
  // show only on small/medium
  return (
    <div className="lg:hidden border-b border-gray-200 bg-white">
      <div className="px-4 py-2 overflow-x-auto no-scrollbar">
        <ol className="flex items-center gap-3 min-w-max">
          {bookingSteps.map((step, idx) => {
            const isActive = currentStep === step.key;
            return (
              <li key={step.key} className="flex items-center gap-2">
                <span
                  className={[
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                    isActive
                      ? "bg-orange-500 text-white"
                      : "bg-gray-200 text-gray-700",
                  ].join(" ")}
                >
                  {idx + 1}
                </span>
                <span
                  className={[
                    "text-xs font-medium whitespace-nowrap",
                    isActive ? "text-gray-900" : "text-gray-600",
                  ].join(" ")}
                >
                  {step.label || step.name}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};

/**
 * Left Sidebar Component - Navigation & Progress
 */
const LeftSidebar = ({ currentStep, bookingSteps, config }) => {
  const currentStepIndex = bookingSteps.findIndex((s) => s.key === currentStep);

  const getStepIcon = (index, isActive, isCompleted) => {
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

  return (
    <div>
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
                {getStepIcon(index, isActive, isCompleted)}
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
 * On mobile, this renders beneath the main content.
 */
const RightSidebar = ({ state, currentStep }) => {
  const { selections, totalAmount, selectedItem, customerInfo } = state;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const getSelectedTickets = () => {
    if (!selections || typeof selections !== "object") return [];
    return Object.values(selections).filter(
      (selection) =>
        selection && typeof selection === "object" && selection.quantity > 0
    );
  };

  const selectedTickets = getSelectedTickets();
  const totalTickets = selectedTickets.reduce(
    (acc, t) => acc + (t.quantity || 0),
    0
  );

  return (
    <div className="flex flex-col">
      {/* Content */}
      <div className="flex-1 p-3 sm:p-6 overflow-y-auto">
        {/* Selected Tickets */}
        {selectedTickets.length > 0 ? (
          <div className="mb-4 sm:mb-6">
            <h4 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">
              Selected Tickets ({totalTickets})
            </h4>
            <div className="space-y-2.5 sm:space-y-3">
              {selectedTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4"
                >
                  <div className="flex justify-between items-start mb-1.5 sm:mb-2 gap-2.5 sm:gap-3">
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                        {ticket.name}
                      </h5>
                      {ticket.type && (
                        <span className="text-[10px] sm:text-[11px] text-gray-600 bg-gray-200 px-1.5 py-0.5 rounded mt-1 inline-block">
                          {ticket.type}
                        </span>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">
                        {formatCurrency(ticket.price)}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-gray-600">
                      Qty: {ticket.quantity}
                    </span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(ticket.price * ticket.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-4 sm:mb-6">
            <h4 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">
              Ticket Details
            </h4>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6 text-center">
              <div className="text-gray-400 mb-2">
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a1 1 0 001 1h1a1 1 0 001-1V7a2 2 0 00-2-2H5zM5 14a2 2 0 00-2 2v3a1 1 0 001 1h1a1 1 0 001-1v-3a2 2 0 00-2-2H5z"
                  />
                </svg>
              </div>
              <p className="text-xs sm:text-sm text-gray-600">
                No tickets selected
              </p>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-1">
                Select tickets to see details here
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer - Total & Actions */}
      <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50">
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
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-lg sm:text-xl text-orange-600">
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
