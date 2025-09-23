//src/App.js - FIXED VERSION
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
    businessType: null, // null = show bookables list by default
    theme: "light",
    apiBaseUrl:
      process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api",
    branding: {
      primaryColor: "#f97316", // Orange for Nike Lake Resort
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

  // Check for selected business type from sessionStorage (from bookables list navigation)
  const selectedFromBookables = sessionStorage.getItem("selectedBusinessType");
  if (selectedFromBookables && !mergedConfig.businessType) {
    mergedConfig.businessType = selectedFromBookables;
    // Clear it so it doesn't persist
    sessionStorage.removeItem("selectedBusinessType");
    console.log(
      `📋 Loading business type from bookables selection: ${selectedFromBookables}`
    );
  }

  // If no business type is specified, show the universal bookables list
  if (!mergedConfig.businessType) {
    console.log("📋 No business type - showing Universal Bookables List");
    return (
      <div className="universal-booking-app">
        <UniversalBookablesList config={mergedConfig} />
      </div>
    );
  }

  // Otherwise, show the specific business type booking flow
  console.log(`🎯 Loading business type: ${mergedConfig.businessType}`);
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
