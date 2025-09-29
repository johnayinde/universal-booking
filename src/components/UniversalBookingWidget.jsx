// src/components/UniversalBookingWidget.jsx - MOBILE RESPONSIVE
import React, { useEffect } from "react";
import { Calendar, Check, X } from "lucide-react";
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
        {/* Mobile progress (hidden on lg+) */}
        <MobileProgress currentStep={currentStep} bookingSteps={bookingSteps} />

        {/* Body: columns on lg+, stacked on smaller */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Sidebar: hidden on small; shows from lg */}
          <div className=" rounded-xl border border-gray-200 bg-gray-100 shadow-sm h-full p-4 hidden lg:block lg:w-96 overflow-y-auto">
            {/* <div className="p-6"> */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm h-full p-4">
              <LeftSidebar
                currentStep={currentStep}
                bookingSteps={bookingSteps}
                config={config}
                state={state}
              />
            </div>
          </div>

          {/* Center Content */}
          <div className="flex-1 order-1 lg:order-none bg-white overflow-y-auto">
            <div className="p-4 sm:p-6">
              <CurrentStepComponent apiService={apiService} adapter={adapter} />
            </div>
          </div>

          {/* Right Sidebar: becomes bottom section on small screens */}
          <div className="order-2 lg:order-none w-full lg:w-96 bg-gray-100 border-t lg:border-t-0 lg:border-l border-gray-200 overflow-y-auto">
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
    <div className="">
      {/* Location Header */}
      <SidebarInfo
        locationImage={config.branding.locationImage}
        companyName={config.branding.companyName}
        locationName={config.branding.locationName}
        description={config.description}
      />

      {/* Progress Steps */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          Booking Progress
        </h3>

        <div className="space-y-3">
          {bookingSteps.map((step, index) => {
            const isActive = currentStep === step.key;
            const currentStepIndex = bookingSteps.findIndex(
              (s) => s.key === currentStep
            );
            const isCompleted = index < currentStepIndex;
            const Icon = step.icon || Calendar;

            return (
              <div key={step.key} className="relative ">
                {/* left orange bar */}
                <span
                  className="absolute left-0 top-[0.1rem] bottom-3 w-1 rounded"
                  style={{ backgroundColor: "orange" }}
                />
                {/* row */}
                <div className="flex items-center justify-between px-4 py-5 rounded-lg bg-white border border-gray-200">
                  {/* left: icon + label */}
                  <div className="flex items-center gap-3">
                    <Icon size={20} className="text-gray-800" />
                    <span
                      className={`font-medium ${
                        isActive
                          ? "text-gray-900"
                          : isCompleted
                          ? "text-gray-900"
                          : "text-gray-700"
                      }`}
                    >
                      {step.label || step.name}
                    </span>
                  </div>

                  {/* right: status bubble */}
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                      isCompleted
                        ? "bg-green-500"
                        : isActive
                        ? "bg-orange-500"
                        : "bg-white border border-gray-300"
                    }`}
                    style={isActive ? { backgroundColor: "orange" } : undefined}
                  >
                    {isCompleted ? (
                      <Check size={14} className="text-white" />
                    ) : isActive ? (
                      <span className="block w-2.5 h-2.5 rounded-full bg-white" />
                    ) : null}
                  </span>
                </div>

                {/* divider */}
                <div className="border-b border-gray-200 mt-2" />
              </div>
            );
          })}
        </div>
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
    <div className="flex flex-col bg-gray-100">
      {/* Content */}
      <div className="flex-1 p-3 sm:p-6 overflow-y-auto">
        {/* Ticket Details Card */}
        <div className="mb-4 sm:mb-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-5">
            <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-3">
              Ticket Details
            </h4>

            {selectedTickets.length > 0 ? (
              <>
                <div className="space-y-2.5">
                  {selectedTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex items-start justify-between text-sm"
                    >
                      <div className="text-gray-900">
                        <span className="font-medium">{ticket.name}</span>
                        <span className="ml-2 text-gray-500 italic">
                          x{ticket.quantity}
                        </span>
                      </div>
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(ticket.price * ticket.quantity)}
                      </div>
                    </div>
                  ))}

                  {/* Optional discount row (shown only if present) */}
                  {(state?.pricing?.discountAmount ?? 0) > 0 && (
                    <div className="flex items-start justify-between text-sm">
                      <div className="text-gray-900">
                        {state?.pricing?.discountLabel || "Discount"}
                      </div>
                      <div className="font-semibold text-red-500">
                        -{formatCurrency(state.pricing.discountAmount)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="my-3 border-t border-gray-200" />

                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-extrabold text-gray-900">
                    {formatCurrency(
                      (typeof totalAmount === "number" ? totalAmount : 0) -
                        (state?.pricing?.discountAmount ?? 0)
                    )}
                  </span>
                </div>
              </>
            ) : (
              // Empty state – compact and neutral
              <div className="text-center py-6 text-gray-600 text-sm">
                No tickets selected
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversalBookingWidget;

export const SidebarInfo = ({
  locationImage,
  companyName,
  locationName,
  description,
}) => {
  return (
    <div className="mb-8">
      {/* Card container */}
      <div>
        {/* Row: image + title */}
        <div className="flex items-center gap-3">
          {locationImage && (
            <img
              src={locationImage}
              alt={companyName || "Location image"}
              className="w-44 h-44 rounded-lg object-cover shrink-0"
            />
          )}

          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 leading-snug">
            {locationName || companyName || "Your Location"}
          </h2>
        </div>

        {/* Divider-like spacing */}
        <div className="mt-5" />

        {/* “Welcome to …” block */}
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">
          Welcome to{" "}
          {companyName ||
            (locationName
              ? (locationName.split(",")[0] || "").trim()
              : "Our Resort")}
        </h2>

        <p className="mt-1 text-gray-600 text-sm leading-relaxed">
          {description ||
            "Enjoy the perfect business getaway with breath-taking views in a very secure and tranquil setting"}
        </p>
      </div>
    </div>
  );
};
