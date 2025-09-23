import React, { useEffect, useState } from "react";
import BookingEngine from "./core/BookingEngine";
import UniversalBookingWidget from "./components/UniversalBookingWidget";
import UniversalBookablesList from "./components/UniversalBookablesList";
import "./App.css";

/**
 * Main App Component - Enhanced Version
 * Entry point for the Universal Booking Widget
 */
function App({ config = {} }) {
  const [isLoading, setIsLoading] = useState(true);
  const [finalConfig, setFinalConfig] = useState(null);

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

  useEffect(() => {
    // Function to process configuration and sessionStorage
    const processConfig = () => {
      console.log("🔍 Processing App configuration...");

      // Merge provided config with defaults
      const mergedConfig = {
        ...defaultConfig,
        ...config,
        branding: {
          ...defaultConfig.branding,
          ...(config.branding || {}),
        },
      };

      // Check for selected business type from sessionStorage
      const selectedFromBookables = sessionStorage.getItem(
        "selectedBusinessType"
      );
      const isReloading = sessionStorage.getItem("isReloading");

      console.log("📋 SessionStorage check:", {
        selectedFromBookables,
        isReloading,
        currentBusinessType: mergedConfig.businessType,
      });

      if (selectedFromBookables && !mergedConfig.businessType) {
        mergedConfig.businessType = selectedFromBookables;

        // Clear sessionStorage
        sessionStorage.removeItem("selectedBusinessType");
        sessionStorage.removeItem("isReloading");

        console.log(
          `✅ Loaded business type from sessionStorage: ${selectedFromBookables}`
        );
      }

      // Log final decision
      if (!mergedConfig.businessType) {
        console.log("📋 No business type - will show Universal Bookables List");
      } else {
        console.log(`🎯 Will load business type: ${mergedConfig.businessType}`);
      }

      setFinalConfig(mergedConfig);
      setIsLoading(false);
    };

    // Small delay to ensure sessionStorage is accessible
    const timer = setTimeout(processConfig, 50);

    return () => clearTimeout(timer);
  }, [config]);

  // Show loading state briefly
  if (isLoading || !finalConfig) {
    return (
      <div className="universal-booking-app">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  // If no business type is specified, show the universal bookables list
  if (!finalConfig.businessType) {
    console.log("🎨 Rendering Universal Bookables List");
    return (
      <div className="universal-booking-app">
        <UniversalBookablesList config={finalConfig} />
      </div>
    );
  }

  // Otherwise, show the specific business type booking flow
  console.log(`🎨 Rendering BookingEngine for: ${finalConfig.businessType}`);
  return (
    <div className="universal-booking-app">
      <BookingEngine
        businessType={finalConfig.businessType}
        config={finalConfig}
      >
        <UniversalBookingWidget />
      </BookingEngine>
    </div>
  );
}

export default App;
