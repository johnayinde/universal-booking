// src/components/BookingLayoutWrapper.jsx
import React from "react";
import { X, Check } from "lucide-react";

const BookingLayoutWrapper = ({
  config,
  currentStep,
  bookingSteps,
  state,
  onClose,
  children,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-stretch sm:items-center justify-center px-0 sm:px-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="bg-white w-full h-dvh sm:h-[90vh] sm:max-w-[95rem] sm:rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header with Close Button */}
        <Header
          config={config}
          onClose={onClose}
          currentStep={currentStep}
          bookingSteps={bookingSteps}
        />

        {/* Main 3-Column Layout */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Sidebar - Location info & Progress */}
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

          {/* Center Content - This is where children render */}
          <div className="flex-1 order-1 lg:order-none bg-white overflow-y-auto">
            <div className="p-4 sm:p-6">{children}</div>
          </div>

          {/* Right Sidebar - Ticket Details & Summary */}
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

/**
 * Header Component - Shows title and close button
 * Also includes mobile progress bar
 */
const Header = ({ config, onClose, currentStep, bookingSteps }) => {
  const currentStepData = bookingSteps?.find(
    (step) => step.key === currentStep
  );

  return (
    <>
      <div className="border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between p-4 sm:p-6">
          <div className="min-w-0">
            <h2 className="text-base sm:text-xl font-semibold text-gray-900">
              {currentStepData?.name || "Select Booking Type"}
            </h2>
            {config.branding?.companyName && (
              <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
                {config.branding.companyName}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close booking widget"
          >
            <X size={22} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Mobile Progress Bar */}
      <MobileProgress currentStep={currentStep} bookingSteps={bookingSteps} />
    </>
  );
};

/**
 * Mobile Progress Bar (shows only on small screens)
 */
const MobileProgress = ({ currentStep, bookingSteps }) => {
  if (!bookingSteps || bookingSteps.length === 0) return null;

  return (
    <div className="lg:hidden border-b border-gray-200 bg-white">
      <div className="px-4 py-2 overflow-x-auto no-scrollbar">
        <ol className="flex items-center gap-3 min-w-max">
          {bookingSteps.map((step, idx) => {
            const isActive = currentStep === step.key;
            return (
              <li key={step.key} className="flex items-center gap-2">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isActive
                      ? "bg-orange-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {idx + 1}
                </span>
                <span
                  className={`text-xs font-medium whitespace-nowrap ${
                    isActive ? "text-gray-900" : "text-gray-600"
                  }`}
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
 * Left Sidebar - Location info & Progress steps
 */
const LeftSidebar = ({ currentStep, bookingSteps, config, state }) => {
  const currentStepIndex =
    bookingSteps?.findIndex((s) => s.key === currentStep) ?? -1;
  const primaryColor = config?.branding?.primaryColor || "#f97316";

  return (
    <div>
      {/* Location Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          {config?.branding?.locationImage && (
            <img
              src={config.branding.locationImage}
              alt={config.branding?.companyName || "Location"}
              className="w-20 h-16 rounded-lg object-cover shrink-0"
            />
          )}
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 leading-tight break-words">
            {config?.branding?.locationName || config?.branding?.companyName}
          </h1>
        </div>

        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
          Welcome to{" "}
          {config?.branding?.companyName || config?.branding?.locationName}
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          {config?.branding?.description ||
            "Select your booking preferences to get started"}
        </p>
      </div>

      {/* Progress Steps - MATCHING FIGMA DESIGN */}
      {/* Progress Steps – unified with UniversalBookablesList */}
      {bookingSteps && bookingSteps.length > 0 && (
        <div className="space-y-0 -mx-6">
          {bookingSteps.map((step, idx) => {
            const isActive = currentStep === step.key; // replicate ListLabel behavior
            const IconEl = step.icon; // optional icon per step

            return (
              <div
                key={step.key}
                className={`relative flex items-center gap-3 py-4 px-6 ${
                  isActive ? "bg-white" : ""
                }`}
              >
                {/* Orange left bar on every row (same as ListLabel) */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ backgroundColor: primaryColor }}
                />

                {/* Left icon (gray-700 when active, gray-400 when inactive) */}
                <div className="flex items-center justify-center w-10 h-10 shrink-0">
                  {IconEl ? (
                    <IconEl
                      className={`w-6 h-6 ${
                        isActive ? "text-gray-700" : "text-gray-400"
                      }`}
                    />
                  ) : (
                    <svg
                      className={`w-6 h-6 ${
                        isActive ? "text-gray-700" : "text-gray-400"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </div>

                {/* Label (exact ListLabel classes; active=gray-900, else gray-500) */}
                <div
                  className={`flex-1 text-sm font-medium ${
                    isActive ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {step.label || step.name}
                </div>

                {/* Right indicator: active = filled orange check, inactive = empty circle */}
                {isActive ? (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <svg
                      className="w-3.5 h-3.5 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border border-gray-300 bg-white shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      )}

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
 * Right Sidebar - Ticket Details & Summary
 */
const RightSidebar = ({ state, currentStep, config }) => {
  const { selections, totalAmount, selectedItem } = state || {};

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
    <div className="p-3 sm:p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-6">
        Ticket Details
      </h3>

      {/* Show selections if any */}
      {selectedTickets.length > 0 ? (
        <div className="space-y-4">
          {/* Selected items list */}
          <div className="space-y-3">
            {selectedTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex justify-between items-start pb-3 border-b border-gray-100 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {ticket.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Qty: {ticket.quantity}
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-900 ml-4">
                  {formatCurrency(ticket.price * ticket.quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* Total summary */}
          <div className="pt-4 border-t-2 border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">
                Total Tickets: {totalTickets}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-base font-semibold text-gray-900">
                Total Amount
              </span>
              <span className="text-xl font-bold text-orange-600">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        // Empty state
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-400 mb-1">No Data</p>
          <p className="text-xs text-gray-500">
            No item has been added to cart
          </p>
        </div>
      )}

      {/* Info box */}
      {selectedTickets.length === 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-white text-xs">i</span>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">
                Getting Started
              </p>
              <p className="text-xs text-blue-700 leading-relaxed">
                Select your booking options. Your selections will appear here as
                you proceed.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingLayoutWrapper;
export { LeftSidebar, RightSidebar, MobileProgress };
