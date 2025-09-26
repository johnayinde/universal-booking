// src/components/UniversalBookablesList.jsx - RESPONSIVE
import React, { useState, useMemo } from "react";
import {
  Ticket,
  Utensils,
  Hotel,
  Camera,
  RockingChairIcon,
  Users,
  Ship,
  X,
} from "lucide-react";

const UniversalBookablesList = ({ config = {} }) => {
  const [selectedBookable, setSelectedBookable] = useState(null);

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
      id: "furniture",
      type: "furniture",
      name: "Furniture Rental",
      icon: RockingChairIcon,
      description: "Furniture rental and reservations",
      available: true,
      implemented: true,
    },
    {
      id: "group",
      type: "group",
      name: "Group Booking",
      icon: Users,
      description: "Book group packages and experiences",
      available: true,
      implemented: true, // Set to true since we just implemented it
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
      available: true,
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
    if (!config.bookables || !Array.isArray(config.bookables)) {
      return ALL_BOOKABLES.filter((b) => b.available);
    }
    const requested = config.bookables.map((b) => String(b).toLowerCase());
    return ALL_BOOKABLES.filter((bookable) => {
      const matchesId = requested.includes(bookable.id.toLowerCase());
      const matchesType = requested.includes(bookable.type.toLowerCase());
      return (matchesId || matchesType) && bookable.available;
    });
  }, [config.bookables]);

  const handleBookableSelect = (bookable) => setSelectedBookable(bookable);

  const handleNext = () => {
    if (!selectedBookable) return;
    if (!selectedBookable.implemented) {
      alert(`${selectedBookable.name} booking is not implemented yet.`);
      return;
    }

    sessionStorage.setItem("selectedBusinessType", selectedBookable.type);

    if (window.parent) {
      window.parent.postMessage({ type: "close-widget" }, "*");
    }

    setTimeout(() => {
      if (window.UniversalBookingWidget) {
        try {
          window.UniversalBookingWidget.destroyAll?.();
          const widgetConfig = {
            businessType: selectedBookable.type,
            locationId: config.locationId || config.location || 1,
            location: config.locationId || config.location || 1,
            apiBaseUrl: config.apiBaseUrl || "http://127.0.0.1:8000/api",
            branding: { ...config.branding },
            autoShow: true,
          };
          const widget = window.UniversalBookingWidget.init(widgetConfig);
          widget.open();
        } catch (error) {
          console.error("Error opening widget:", error);
          alert(
            `${selectedBookable.name} booking encountered an error: ${error.message}`
          );
        }
      } else {
        console.error("UniversalBookingWidget not found on window");
        alert("Booking system not loaded properly.");
      }
    }, 200);
  };

  const handleClose = () => {
    // Clear sessionStorage
    sessionStorage.removeItem("selectedBusinessType");
    sessionStorage.removeItem("isReloading");

    // Reset the widget config to remove businessType
    if (window.UniversalBookingWidget) {
      // Destroy current instance
      window.UniversalBookingWidget.destroyAll?.();

      // Reinitialize without businessType
      setTimeout(() => {
        const newConfig = {
          ...config,
          businessType: null, // or undefined
        };
        window.UniversalBookingWidget.init(newConfig).open();
      }, 100);
    }

    if (window.parent) {
      window.parent.postMessage({ type: "close-widget" }, "*");
    }
  };

  // Location & branding
  const locationId = config.locationId || config.location || 1;
  const locationNames = { 1: "Lagos", 2: "Enugu" };
  const locationName = locationNames[locationId] || `Location ${locationId}`;
  const primaryColor = config.branding?.primaryColor || "#f97316";
  const locationImage =
    config.branding?.locationImage || "/api/placeholder/80/60";
  const displayName =
    config.branding?.locationName || `Nike Lake Resort, ${locationName}`;

  const customStyles = {
    "--primary-color": primaryColor,
    "--primary-50": `${primaryColor}08`,
    "--primary-100": `${primaryColor}1A`,
    "--primary-500": primaryColor,
    "--primary-600": primaryColor,
    "--primary-700": primaryColor,
  };

  // Empty state
  if (filteredBookables.length === 0) {
    return (
      <div
        className="fixed inset-0 z-50 bg-black/50 flex items-stretch sm:items-center justify-center px-0 sm:px-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
        style={customStyles}
      >
        <div className="bg-white w-full h-dvh sm:h-auto sm:max-w-md sm:rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-base sm:text-xl font-semibold text-gray-900">
              No Booking Options
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Close booking widget"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          <div className="p-4 sm:p-6">
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl sm:text-2xl">📅</span>
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                No Booking Options Available
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
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
    );
  }

  // Main UI
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-stretch sm:items-center justify-center px-0 sm:px-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
      style={customStyles}
    >
      <div className="bg-white w-full h-dvh sm:h-[90vh] sm:max-w-5xl sm:rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="min-w-0">
            <h2 className="text-base sm:text-xl font-semibold text-gray-900">
              Select Booking Type
            </h2>
            {config.branding?.companyName && (
              <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
                {config.branding.companyName}
              </p>
            )}
            <p className="text-[11px] sm:text-xs text-gray-500 mt-1 truncate">
              {displayName} (Location ID: {locationId})
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
            aria-label="Close booking widget"
          >
            <X size={22} className="text-gray-500" />
          </button>
        </div>

        {/* Content: stacked on mobile, two-pane on lg */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col lg:flex-row">
            {/* Sidebar (collapses to top section on small) */}
            <aside className="border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50">
              <div className="p-4 sm:p-6 lg:w-80">
                <div className="flex lg:block items-center gap-4 lg:gap-0">
                  <img
                    src={locationImage}
                    alt={displayName}
                    className="w-16 h-12 lg:w-20 lg:h-16 rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA4MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iNjAiIGZpbGw9IiNGM0Y0RjYiLz48cmVjdCB4PSIyMCIgeT0iMTUiIHdpZHRoPSI0MCIgaGVpZ2h0PSIzMCIgZmlsbD0iIjlDQTNBRiIvPjwvc3ZnPg==";
                    }}
                  />
                  <div className="lg:mt-4 min-w-0">
                    <h2 className="text-sm lg:text-lg font-semibold text-gray-900 truncate">
                      {displayName}
                    </h2>
                    <p className="text-gray-600 text-xs lg:text-sm leading-relaxed hidden lg:block">
                      Welcome to Nike Lake Resort
                    </p>
                    <p className="text-gray-500 text-[11px] lg:text-xs mt-1 hidden lg:block">
                      Select your booking type to continue
                    </p>
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="mt-4 lg:mt-8 hidden sm:block">
                  <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-orange-100">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: primaryColor }}
                    >
                      1
                    </div>
                    <span className="font-medium text-orange-800 text-sm">
                      Booking Type
                    </span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main */}
            <main className="flex-1 overflow-y-auto">
              <div className="p-4 sm:p-6 max-w-2xl">
                <div className="mb-6 sm:mb-8">
                  <div className="flex items-center space-x-2 text-orange-600 mb-2">
                    <div
                      className="w-6 h-6 rounded-full text-white flex items-center justify-center text-sm font-bold"
                      style={{ backgroundColor: primaryColor }}
                    >
                      1
                    </div>
                    <span className="text-xs sm:text-sm font-medium">
                      Booking Type
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                    Select a booking type for {locationName}
                  </h1>
                  <p className="text-gray-600 text-sm">
                    {filteredBookables.length} booking option
                    {filteredBookables.length !== 1 ? "s" : ""} available
                  </p>
                </div>

                {/* Bookables Grid: 1 col on mobile, 2 on md+ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
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
                        {!bookable.implemented && (
                          <span className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-[11px] px-2 py-1 rounded-full">
                            Coming Soon
                          </span>
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
                                isSelected ? "text-orange-900" : "text-gray-900"
                              } truncate`}
                            >
                              {bookable.name}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {bookable.description}
                            </p>
                            {bookable.implemented && (
                              <span className="bg-green-100 text-green-800 text-[11px] px-2 py-1 rounded-full inline-block mt-2">
                                Available Now
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Actions: full-width on mobile, spaced on larger */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 sm:justify-between">
                  <button
                    onClick={handleClose}
                    className="px-5 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!selectedBookable}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors w-full sm:w-auto ${
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
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversalBookablesList;
