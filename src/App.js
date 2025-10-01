// Complete Integration Example - src/App.js Enhanced
import React, { useEffect, useState } from "react";
import BookingEngine from "./core/BookingEngine";
import UniversalBookingWidget from "./components/UniversalBookingWidget";
import UniversalBookablesList from "./components/UniversalBookablesList";
import "./App.css";

/**
 * Enhanced App Component with Perfect Three-Column Layout
 * and Paystack Payment Integration
 */
function App({ config = {} }) {
  const [isLoading, setIsLoading] = useState(true);
  const [finalConfig, setFinalConfig] = useState(null);
  const [isDevelopment, setIsDevelopment] = useState(false);

  // Enhanced default configuration
  const defaultConfig = {
    businessType: null, // null = show bookables list by default
    theme: "light",
    apiBaseUrl:
      process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api",
    publicKey: config.paystackPK || "",
    branding: {
      primaryColor: "#f97316", // Orange for Nike Lake Resort
      logoUrl: "",
      companyName: "Nike Lake Resort",
      locationName: "Nike Lake Resort, Enugu",
      locationImage: "",
      description:
        " Experience the serenity of Nike Lake Resort, Enugu's premier getaway nestled by the tranquil Nike Lake. Enjoy luxurious accommodations, exquisite dining, and a variety of recreational activities in a picturesque setting.",
    },
    autoShow: false,
    position: "bottom-right",
    // Enhanced payment configuration
    payment: {
      provider: "paystack",
      currency: "NGN",
      callbackUrl: window.location.origin + "/booking/callback",
      metadata: {
        source: "universal_widget",
      },
    },
    // Enhanced features
    features: {
      enableThreeColumnLayout: true,
      enableTicketCounter: true,
      enablePaystackIntegration: true,
      enableRealTimeValidation: true,
      enableBookingTracking: true,
    },
  };

  useEffect(() => {
    // Check if we're in development mode
    setIsDevelopment(process.env.NODE_ENV === "development");

    // Function to process configuration and sessionStorage
    const processConfig = () => {
      console.log("🔍 Processing Enhanced App configuration...", config);

      // Merge provided config with defaults
      const mergedConfig = {
        ...defaultConfig,
        ...config,
        branding: {
          ...defaultConfig.branding,
          ...(config.branding || {}),
        },
        payment: {
          ...defaultConfig.payment,
          ...(config.payment || {}),
        },
        features: {
          ...defaultConfig.features,
          ...(config.features || {}),
        },
      };

      // Check for selected business type from sessionStorage
      const selectedFromBookables = sessionStorage.getItem(
        "selectedBusinessType"
      );

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

      // Log enhanced features

      setFinalConfig(mergedConfig);
      setIsLoading(false);
    };

    // Add small delay for smoother loading
    const timer = setTimeout(processConfig, 100);
    return () => clearTimeout(timer);
  }, [config]);

  // Loading state
  if (isLoading || !finalConfig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Loading Universal Booking Widget
          </h2>
          <p className="text-gray-600">Initializing enhanced features...</p>
        </div>
      </div>
    );
  }

  // Show Universal Bookables List if no specific business type
  if (!finalConfig.businessType) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UniversalBookablesList config={finalConfig} />
      </div>
    );
  }

  // Render specific business type with BookingEngine
  return (
    <div className="min-h-screen bg-gray-50">
      <BookingEngine
        businessType={finalConfig.businessType}
        config={finalConfig}
      >
        <UniversalBookingWidget />
      </BookingEngine>
    </div>
  );
}

/**
 * Development Debug Panel Component
 */

export default App;
