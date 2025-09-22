// src/App.js
import React from "react";
import BookingEngine from "./core/BookingEngine";
import UniversalBookingWidget from "./components/UniversalBookingWidget";
import UniversalBookablesList from "./components/UniversalBookablesList";
import "./App.css";

/**
 * Main App Component
 * Entry point for the Universal Booking Widget
 */
function App({ config = {} }) {
  // Default configuration
  const defaultConfig = {
    businessType: null, // Changed from "events" to null to show bookables list by default
    theme: "light",
    apiBaseUrl:
      process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api",
    branding: {
      primaryColor: "#f97316", // Changed to orange for Nike Lake Resort
      logoUrl: "",
      companyName: "Nike Lake Resort",
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

  // If no business type is specified, show the universal bookables list
  if (!mergedConfig.businessType) {
    return (
      <div className="universal-booking-app">
        <UniversalBookablesList />
      </div>
    );
  }

  // Otherwise, show the specific business type booking flow
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
