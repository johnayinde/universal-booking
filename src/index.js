import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// For development mode - render directly in the DOM
if (process.env.NODE_ENV === "development") {
  const root = ReactDOM.createRoot(document.getElementById("root"));

  // Development configuration
  const devConfig = {
    businessType: "",
    apiBaseUrl: "http://127.0.0.1:8000/api",
    branding: {
      primaryColor: "#3b82f6",
      companyName: "Universal Booking Demo",
    },
    autoShow: false, // Auto-open for development
  };

  root.render(
    <React.StrictMode>
      <App config={devConfig} />
    </React.StrictMode>
  );
}

// Export the widget API for production builds
export { default as UniversalBookingWidget } from "./widget";
export { default as BookingEngine } from "./core/BookingEngine";
export { default as AdapterFactory } from "./core/AdapterFactory";
export { default as BusinessAdapter } from "./core/BusinessAdapter";

// Also initialize the widget API if we're in a browser environment
if (typeof window !== "undefined") {
  // Import and initialize the widget
  import("./widget").then((module) => {
    // Widget is automatically initialized via the widget.js file
    console.log("Universal Booking Widget loaded successfully");
  });
}
