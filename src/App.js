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

        {/* Development Test Button */}
        {/* {isDevelopment && (
          <div className="fixed top-4 right-4 z-50">
            <button
              onClick={() => {
                console.log(
                  "🧪 Test button clicked - Loading entry business type"
                );
                sessionStorage.setItem("selectedBusinessType", "entry");
                window.location.reload();
              }}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-orange-700 transition-colors text-sm font-medium"
            >
              🧪 Test Entry Widget
            </button>
          </div>
        )} */}
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

      {/* Development Debug Panel */}
      {/* {isDevelopment && <DevelopmentDebugPanel config={finalConfig} />} */}
    </div>
  );
}

/**
 * Development Debug Panel Component
 */
const DevelopmentDebugPanel = ({ config }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    // Update debug info periodically
    const interval = setInterval(() => {
      setDebugInfo({
        timestamp: new Date().toLocaleTimeString(),
        config: {
          businessType: config.businessType,
          apiBaseUrl: config.apiBaseUrl,
          features: config.features,
        },
        sessionStorage: {
          selectedBusinessType: sessionStorage.getItem("selectedBusinessType"),
          isReloading: sessionStorage.getItem("isReloading"),
        },
        browser: {
          userAgent: navigator.userAgent.split(" ")[0],
          url: window.location.href,
        },
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [config]);

  const testPaystackIntegration = () => {
    console.log("🧪 Testing Paystack Integration...");

    // Simulate booking data
    const testBookingData = {
      event_id: 1,
      customer_info: {
        first_name: "Test",
        last_name: "User",
        email: "test@example.com",
        phone: "+2348012345678",
      },
      tickets: [
        {
          ticket_id: 1,
          quantity: 2,
          price: 5000,
        },
      ],
      total_amount: 10000,
      currency: "NGN",
    };

    console.log("📝 Test booking data:", testBookingData);
    alert("Check console for test booking data structure");
  };

  const resetWidget = () => {
    sessionStorage.clear();
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`bg-white border border-gray-300 rounded-lg shadow-lg transition-all duration-300 ${
          isExpanded ? "w-96 h-80" : "w-12 h-12"
        }`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute top-2 right-2 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold hover:bg-orange-700 transition-colors"
        >
          {isExpanded ? "×" : "🛠"}
        </button>

        {/* Debug Content */}
        {isExpanded && (
          <div className="p-4 pr-12 h-full overflow-y-auto">
            <h3 className="font-bold text-gray-900 mb-3">Debug Panel</h3>

            {/* Quick Actions */}
            <div className="space-y-2 mb-4">
              <button
                onClick={testPaystackIntegration}
                className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
              >
                🧪 Test Paystack
              </button>

              <button
                onClick={resetWidget}
                className="w-full bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700 transition-colors"
              >
                🔄 Reset Widget
              </button>
            </div>

            {/* Debug Info */}
            <div className="text-xs space-y-2">
              <div>
                <strong>Time:</strong> {debugInfo.timestamp}
              </div>

              <div>
                <strong>Business Type:</strong>{" "}
                {debugInfo.config?.businessType || "None"}
              </div>

              <div>
                <strong>API:</strong> {debugInfo.config?.apiBaseUrl}
              </div>

              <div>
                <strong>Features:</strong>
                <ul className="ml-2 mt-1">
                  {Object.entries(debugInfo.config?.features || {}).map(
                    ([key, value]) => (
                      <li
                        key={key}
                        className={value ? "text-green-600" : "text-red-600"}
                      >
                        {key}: {value ? "✓" : "✗"}
                      </li>
                    )
                  )}
                </ul>
              </div>

              <div>
                <strong>Session:</strong>
                <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-hidden">
                  {JSON.stringify(debugInfo.sessionStorage, null, 1)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

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
