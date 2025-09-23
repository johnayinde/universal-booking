// src/components/UniversalBookablesList.jsx - FIXED with proper modal styling
import React, { useState, useMemo } from "react";
import { Ticket, Utensils, Hotel, Camera, Users, Ship, X } from "lucide-react";

const UniversalBookablesList = ({ config = {} }) => {
  const [selectedBookable, setSelectedBookable] = useState(null);

  console.log("🎨 UniversalBookablesList rendering with config:", config);

  // Define all bookables with proper structure
  const ALL_BOOKABLES = [
    {
      id: "entry",
      type: "entry",
      name: "Entry Ticket",
      icon: Ticket,
      description: "Access to facilities and grounds",
      available: true,
      implemented: true,
    },
    {
      id: "hotel",
      type: "hotel",
      name: "Hotel",
      icon: Hotel,
      description: "Accommodation and room bookings",
      available: true,
      implemented: false,
    },
    {
      id: "udh",
      type: "udh",
      name: "Upside Down House",
      icon: Camera,
      description: "Unique upside-down house experience",
      available: true,
      implemented: false,
    },
    {
      id: "food",
      type: "restaurant",
      name: "Food and Beverages",
      icon: Utensils,
      description: "Restaurant dining and beverage services",
      available: false,
      implemented: false,
    },
    {
      id: "club",
      type: "club",
      name: "Kids Club",
      icon: Users,
      description: "Kids activities and entertainment",
      available: false,
      implemented: false,
    },
    {
      id: "activities",
      type: "activities",
      name: "Activities",
      icon: Ship,
      description: "Water sports and recreational activities",
      available: false,
      implemented: false,
    },
  ];

  // Filter bookables based on config
  const filteredBookables = useMemo(() => {
    console.log("🔍 Filtering bookables with config:", config);

    // If no specific bookables requested, show all available ones
    if (!config.bookables || !Array.isArray(config.bookables)) {
      console.log("📋 No bookables filter specified, showing all available");
      return ALL_BOOKABLES.filter((b) => b.available);
    }

    // Convert config bookables to lowercase for comparison
    const requested = config.bookables.map((b) => String(b).toLowerCase());
    console.log("📋 Requested bookables:", requested);

    const filtered = ALL_BOOKABLES.filter((bookable) => {
      const matchesId = requested.includes(bookable.id.toLowerCase());
      const matchesType = requested.includes(bookable.type.toLowerCase());
      const isAvailable = bookable.available;

      const shouldInclude = (matchesId || matchesType) && isAvailable;

      if (shouldInclude) {
        console.log(`✅ Including bookable: ${bookable.name} (${bookable.id})`);
      }

      return shouldInclude;
    });

    console.log("📊 Filtered bookables result:", filtered);
    return filtered;
  }, [config.bookables]);

  const handleBookableSelect = (bookable) => {
    console.log("🎯 Selected bookable:", bookable);
    setSelectedBookable(bookable);
  };

  const handleNext = () => {
    if (!selectedBookable) {
      console.log("❌ No bookable selected");
      return;
    }

    console.log("➡️ Proceeding with bookable:", selectedBookable);

    // Check if bookable is implemented
    if (!selectedBookable.implemented) {
      alert(`${selectedBookable.name} booking is not implemented yet.`);
      return;
    }

    // Store selection for page reload
    sessionStorage.setItem("selectedBusinessType", selectedBookable.type);

    // Close current modal frame
    if (window.parent) {
      window.parent.postMessage({ type: "close-widget" }, "*");
    }

    // Open next widget for the chosen businessType
    setTimeout(() => {
      if (window.UniversalBookingWidget) {
        try {
          console.log("🔄 Destroying existing widgets...");
          window.UniversalBookingWidget.destroyAll();

          const widgetConfig = {
            businessType: selectedBookable.type,
            locationId: config.locationId || config.location || 1,
            location: config.locationId || config.location || 1, // Backward compatibility
            apiBaseUrl: config.apiBaseUrl || "http://127.0.0.1:8000/api",
            branding: { ...config.branding },
            autoShow: true,
          };

          console.log("🚀 Initializing new widget with config:", widgetConfig);

          const widget = window.UniversalBookingWidget.init(widgetConfig);
          widget.open();
          console.log("✅ Widget opened successfully");
        } catch (error) {
          console.error("❌ Error opening widget:", error);
          alert(
            `${selectedBookable.name} booking encountered an error: ${error.message}`
          );
        }
      } else {
        console.error("❌ UniversalBookingWidget not found on window");
        alert("Booking system not loaded properly.");
      }
    }, 200);
  };

  const handleClose = () => {
    if (window.parent) {
      window.parent.postMessage({ type: "close-widget" }, "*");
    }
  };

  // Get location information
  const locationId = config.locationId || config.location || 1;
  const locationNames = { 1: "Lagos", 2: "Enugu" };
  const locationName = locationNames[locationId] || `Location ${locationId}`;

  // Branding
  const primaryColor = config.branding?.primaryColor || "#f97316";
  const locationImage =
    config.branding?.locationImage || "/api/placeholder/80/60";
  const displayName =
    config.branding?.locationName || `Nike Lake Resort, ${locationName}`;

  // CSS custom properties for theming
  const customStyles = {
    "--primary-color": primaryColor,
    "--primary-50": `${primaryColor}08`,
    "--primary-100": `${primaryColor}1A`,
    "--primary-500": primaryColor,
    "--primary-600": primaryColor,
    "--primary-700": primaryColor,
  };

  console.log("🎨 Rendering UniversalBookablesList with:", {
    locationId,
    locationName,
    filteredBookablesCount: filteredBookables.length,
    selectedBookable: selectedBookable?.name,
  });

  // Show error if no bookables available
  if (filteredBookables.length === 0) {
    return (
      <div
        className="fixed inset-0 z-50 overflow-y-auto widget-overlay"
        style={customStyles}
      >
        <div className="flex min-h-screen items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full widget-modal">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                No Booking Options
              </h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close booking widget"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📅</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Booking Options Available
                </h3>
                <p className="text-gray-600 mb-4">
                  No booking options are currently available for {displayName}.
                </p>
                <div className="text-xs text-gray-500 space-y-1 mb-6">
                  <p>Location ID: {locationId}</p>
                  <p>Config bookables: {JSON.stringify(config.bookables)}</p>
                </div>
                <button
                  onClick={handleClose}
                  className="w-full py-3 px-4 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main modal UI
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto widget-overlay"
      style={customStyles}
    >
      <div className="flex min-h-screen items-center justify-center p-4 bg-black bg-opacity-50">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden widget-modal">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Select Booking Type
              </h2>
              {config.branding?.companyName && (
                <p className="text-sm text-gray-600 mt-1">
                  {config.branding.companyName}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {displayName} (Location ID: {locationId})
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close booking widget"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)] custom-scrollbar">
            <div className="flex">
              {/* Sidebar */}
              <div className="w-80 bg-gray-50 rounded-lg p-6 mr-8">
                <div className="mb-8">
                  <img
                    src={locationImage}
                    alt={displayName}
                    className="w-20 h-16 rounded-lg object-cover mb-4"
                    onError={(e) => {
                      e.target.src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA4MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iNjAiIGZpbGw9IiNGM0Y0RjYiLz48cmVjdCB4PSIyMCIgeT0iMTUiIHdpZHRoPSI0MCIgaGVpZ2h0PSIzMCIgZmlsbD0iIjlDQTNBRiIvPjwvc3ZnPg==";
                    }}
                  />
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    {displayName}
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Welcome to Nike Lake Resort
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    Select your booking type to continue
                  </p>
                </div>

                {/* Progress Indicator */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-orange-100">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: primaryColor }}
                    >
                      1
                    </div>
                    <span className="font-medium text-orange-800">
                      Booking Type
                    </span>
                  </div>
                </div>

                {/* Debug Info for Development */}
                {process.env.NODE_ENV === "development" && (
                  <div className="mt-6 p-3 bg-gray-100 rounded text-xs text-gray-600">
                    <p>Debug Info:</p>
                    <p>Available: {filteredBookables.length}</p>
                    <p>Selected: {selectedBookable?.name || "None"}</p>
                  </div>
                )}
              </div>

              {/* Main Content */}
              <div className="flex-1">
                <div className="max-w-2xl">
                  <div className="mb-8">
                    <div className="flex items-center space-x-2 text-orange-600 mb-2">
                      <div
                        className="w-6 h-6 rounded-full text-white flex items-center justify-center text-sm font-bold"
                        style={{ backgroundColor: primaryColor }}
                      >
                        1
                      </div>
                      <span className="text-sm font-medium">Booking Type</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      Select a booking type for {locationName}
                    </h1>
                    <p className="text-gray-600">
                      {filteredBookables.length} booking option
                      {filteredBookables.length !== 1 ? "s" : ""} available
                    </p>
                  </div>

                  {/* Bookables Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {filteredBookables.map((bookable) => {
                      const Icon = bookable.icon;
                      const isSelected = selectedBookable?.id === bookable.id;

                      return (
                        <button
                          key={bookable.id}
                          onClick={() => handleBookableSelect(bookable)}
                          className={`p-4 rounded-lg border-2 text-left transition-all relative ${
                            isSelected
                              ? "border-orange-500 bg-orange-50"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          {/* Implementation Status Badge */}
                          {!bookable.implemented && (
                            <div className="absolute top-2 right-2">
                              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                Coming Soon
                              </span>
                            </div>
                          )}

                          <div className="flex items-start space-x-3">
                            <div
                              className={`p-2 rounded-lg ${
                                isSelected
                                  ? "bg-orange-100 text-orange-600"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              <Icon size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3
                                className={`font-medium text-sm ${
                                  isSelected
                                    ? "text-orange-900"
                                    : "text-gray-900"
                                }`}
                              >
                                {bookable.name}
                              </h3>
                              <p className="text-xs text-gray-500 mt-1">
                                {bookable.description}
                              </p>
                              {bookable.implemented && (
                                <div className="flex items-center mt-2">
                                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                    Available Now
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleClose}
                      className="px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={!selectedBookable}
                      className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                        selectedBookable
                          ? "text-white hover:opacity-90"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                      style={{
                        backgroundColor: selectedBookable
                          ? primaryColor
                          : undefined,
                      }}
                    >
                      {selectedBookable?.implemented === false
                        ? "Coming Soon"
                        : "Next"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversalBookablesList;
