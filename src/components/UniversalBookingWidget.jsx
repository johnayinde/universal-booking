import React, { useEffect } from "react";
import { X } from "lucide-react";
import { useUniversalBooking } from "../core/UniversalStateManager";
import { ActionTypes } from "../core/UniversalStateManager";

/**
 * Universal Booking Widget Component
 * Renders the appropriate business type component based on current step
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
  const labels = getLabels();

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
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Apply custom branding
  const primaryColor = config.branding?.primaryColor || "#3b82f6";

  // Create custom CSS variables for theming
  const customStyles = {
    "--primary-color": primaryColor,
    "--primary-50": `${primaryColor}08`,
    "--primary-100": `${primaryColor}1A`,
    "--primary-500": primaryColor,
    "--primary-600": primaryColor,
    "--primary-700": adjustColorBrightness(primaryColor, -20),
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto widget-overlay"
      style={customStyles}
    >
      <div className="flex min-h-screen items-center justify-center p-4 bg-black bg-opacity-50">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden widget-modal">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {labels.title}
              </h2>
              {config.branding?.companyName && (
                <p className="text-sm text-gray-600 mt-1">
                  {config.branding.companyName}
                </p>
              )}
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center space-x-2">
              {bookingSteps.map((step, index) => {
                const isActive = step.key === currentStep;
                const isCompleted =
                  bookingSteps.findIndex((s) => s.key === currentStep) > index;

                return (
                  <div
                    key={step.key}
                    className={`w-3 h-3 rounded-full transition-colors progress-dot ${
                      isActive
                        ? "bg-primary-600 active"
                        : isCompleted
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                    title={step.label}
                  />
                );
              })}
            </div>

            {/* Close Button */}
            <button
              onClick={closeWidget}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close booking widget"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Content Area */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)] custom-scrollbar">
            <CurrentStepComponent adapter={adapter} apiService={apiService} />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Helper function to adjust color brightness
 * @param {string} hex - Hex color code
 * @param {number} percent - Percentage to adjust (-100 to 100)
 * @returns {string}
 */
function adjustColorBrightness(hex, percent) {
  // Remove # if present
  hex = hex.replace("#", "");

  // Parse r, g, b values
  const num = parseInt(hex, 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;

  return (
    "#" +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

export default UniversalBookingWidget;
