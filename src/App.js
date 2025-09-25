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
    branding: {
      primaryColor: "#f97316", // Orange for Nike Lake Resort
      logoUrl: "",
      companyName: "Nike Lake Resort",
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

    // Check if current URL is the payment callback
    // const currentUrl = window.location.href;
    // const urlParams = new URLSearchParams(window.location.search);

    // if (
    //   currentUrl.includes("/booking/payment/callback") ||
    //   urlParams.get("reference") ||
    //   urlParams.get("trxref")
    // ) {
    //   console.log("🔄 Payment callback detected in widget");
    //   setFinalConfig({
    //     ...defaultConfig,
    //     showPaymentVerification: true,
    //     paymentReference: urlParams.get("reference") || urlParams.get("trxref"),
    //   });
    //   setIsLoading(false);
    //   return;
    // }
    // Function to process configuration and sessionStorage
    const processConfig = () => {
      console.log("🔍 Processing Enhanced App configuration...");

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

      const isReloading = sessionStorage.getItem("isReloading");

      console.log("📋 Enhanced SessionStorage check:", {
        selectedFromBookables,
        isReloading,
        currentBusinessType: mergedConfig.businessType,
        features: mergedConfig.features,
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

      // Log enhanced features
      console.log("🎨 Enhanced Features Enabled:", mergedConfig.features);

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
  // if (finalConfig?.showPaymentVerification) {
  //   return (
  //     <PaymentVerification paymentReference={finalConfig.paymentReference} />
  //   );
  // }

  // Render specific business type with BookingEngine
  return (
    <div className="min-h-screen bg-gray-50">
      <BookingEngine
        businessType={finalConfig.businessType}
        config={finalConfig}
      >
        <UniversalBookingWidget />
      </BookingEngine>

      {/* Development Debug Panel */}
      {/* {isDevelopment && <DevelopmentDebugPanel config={finalConfig} />} */}
    </div>
  );
}

/**
 * Development Debug Panel Component
 */

export default App;

/*
===========================================
USAGE EXAMPLES FOR PAYSTACK INTEGRATION
===========================================

1. BACKEND API ENDPOINT REQUIREMENTS:

POST /api/bookings
{
  "event_id": 1,
  "customer_info": {
    "first_name": "John",
    "last_name": "Doe", 
    "email": "john@example.com",
    "phone": "+2348012345678"
  },
  "tickets": [
    {
      "ticket_id": 1,
      "quantity": 2,
      "price": 5000
    }
  ],
  "total_amount": 10000,
  "currency": "NGN",
  "payment_method": "paystack"
}

EXPECTED RESPONSE:
{
  "success": true,
  "data": {
    "booking_reference": "NLR-2024-001",
    "booking_id": 123,
    "payment_url": "https://checkout.paystack.com/abc123",
    "amount": 10000,
    "currency": "NGN"
  }
}

2. PAYSTACK CALLBACK HANDLING:

The widget expects your backend to:
- Initialize Paystack payment
- Return payment URL for redirect
- Handle Paystack webhooks
- Update booking status
- Send confirmation emails

3. WIDGET INTEGRATION OPTIONS:

<!-- Basic Integration -->
<script src="universal-booking-widget.min.js"></script>
<button data-universal-booking="entry">Book Now</button>

<!-- With Custom Config -->
<button 
  data-universal-booking="entry"
  data-config='{"branding": {"primaryColor": "#f97316"}}'
>
  Book Entry Tickets
</button>

<!-- Programmatic Usage -->
<script>
const widget = UniversalBookingWidget.init({
  businessType: 'entry',
  apiBaseUrl: 'https://your-api.com/api',
  branding: {
    primaryColor: '#f97316',
    companyName: 'Nike Lake Resort'
  },
  payment: {
    provider: 'paystack',
    currency: 'NGN'
  }
});

widget.open();
</script>

4. PAYMENT FLOW:

1. User selects tickets → Counter updates
2. User fills booking form → Validation
3. User clicks "Pay" → Backend creates booking
4. Backend returns Paystack URL → Redirect
5. User completes payment → Paystack callback
6. Backend updates booking → Confirmation sent

===========================================
*/
