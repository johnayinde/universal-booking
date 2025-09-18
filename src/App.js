import React from "react";
import BookingEngine from "./core/BookingEngine";
import UniversalBookingWidget from "./components/UniversalBookingWidget";
import "./App.css";

/**
 * Main App Component
 * Entry point for the Universal Booking Widget
 */
function App({ config = {} }) {
  // Default configuration
  const defaultConfig = {
    businessType: "events",
    theme: "light",
    apiBaseUrl:
      process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api",
    branding: {
      primaryColor: "#3b82f6",
      logoUrl: "",
      companyName: "Universal Booking",
    },
    autoShow: false,
    position: "bottom-right",
  };

  // Merge provided config with defaults
  const mergedConfig = {
    ...defaultConfig,
    ...config,
    branding: {
      ...defaultConfig.branding,
      ...(config.branding || {}),
    },
  };

  return (
    <BookingEngine
      businessType={mergedConfig.businessType}
      config={mergedConfig}
    >
      <UniversalBookingWidget />
    </BookingEngine>
  );
}

export default App;
