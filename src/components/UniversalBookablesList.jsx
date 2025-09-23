import React, { useMemo, useState } from "react";
import {
  Ticket,
  Hotel,
  UtensilsCrossed,
  Camera,
  Ship,
  Users,
  X,
} from "lucide-react";

const UniversalBookablesList = ({ config = {} }) => {
  // Expected config example:
  // {
  //   location: 1,
  //   bookables: ['udh','hotel'], // matches by id or type (case-insensitive)
  //   apiBaseUrl: 'http://127.0.0.1:8000/api',
  //   branding: {
  //     primaryColor: '#f97316',
  //     companyName: 'Landmark',
  //     locationName: 'Landmark, Lagos',
  //     locationTagline: 'Welcome to Landmark Lagos',
  //     locationDescription: 'Business + leisure on the Atlantic shoreline.',
  //     locationImage: 'https://your.cdn/location.jpg'
  //   }
  // }

  const [selectedBookable, setSelectedBookable] = useState(null);

  // Master list (global catalog). Keep ids stable.
  const CATALOG = [
    {
      id: "entry",
      type: "entry",
      name: "Entry Ticket",
      icon: Ticket,
      description: "Access to facilities and grounds",
      available: true,
    },
    {
      id: "food",
      type: "restaurant",
      name: "Food and Beverages",
      icon: UtensilsCrossed,
      description: "Restaurant dining and beverage services",
      available: true,
    },
    {
      id: "hotel",
      type: "hotel",
      name: "Hotel",
      icon: Hotel,
      description: "Accommodation and room bookings",
      available: true,
    },
    {
      id: "udh",
      type: "udh",
      name: "Landmark Upside Down House",
      icon: Camera,
      description: "Unique upside-down house experience",
      available: true,
    },
    {
      id: "club",
      type: "club",
      name: "Landmark Kids Club",
      icon: Users,
      description: "Kids activities and entertainment",
      available: true,
    },
    {
      id: "activities1",
      type: "activities",
      name: "Activities",
      icon: Ship,
      description: "Water sports and recreational activities",
      available: true,
    },
    {
      id: "activities2",
      type: "activities",
      name: "Activities",
      icon: Ship,
      description: "Additional recreational offerings",
      available: true,
    },
  ];

  // ————— Filtering logic —————
  // If config.bookables is provided, show ONLY those (match by id OR type).
  // Matching is case-insensitive and tolerant (e.g., 'restaurant' will match the item with id 'food' and type 'restaurant').
  const filteredBookables = useMemo(() => {
    const requested = (config.bookables || []).map((b) =>
      String(b).toLowerCase()
    );
    if (!requested.length) return CATALOG;

    const set = new Set(requested);
    return CATALOG.filter(
      (b) => set.has(b.id.toLowerCase()) || set.has(b.type.toLowerCase())
    );
  }, [config.bookables]);

  const handleBookableSelect = (bookable) => setSelectedBookable(bookable);

  const handleNext = () => {
    if (!selectedBookable) return;

    // Close current modal frame
    if (window.parent) {
      window.parent.postMessage({ type: "close-widget" }, "*");
    }

    // Open next widget for the chosen businessType, carrying location through
    setTimeout(() => {
      if (window.UniversalBookingWidget) {
        try {
          window.UniversalBookingWidget.destroyAll();

          const widget = window.UniversalBookingWidget.init({
            businessType: selectedBookable.type,
            locationId: config.location ?? null, // ← pass location along
            apiBaseUrl: config.apiBaseUrl || "http://127.0.0.1:8000/api",
            branding: { ...config.branding },
            autoShow: true,
          });

          widget.open();
        } catch (error) {
          console.error(
            `Error opening ${selectedBookable.type} widget:`,
            error
          );
          alert(`${selectedBookable.name} booking is not implemented yet.`);
        }
      }
    }, 200);
  };

  const handleClose = () => {
    if (window.parent) {
      window.parent.postMessage({ type: "close-widget" }, "*");
    }
  };

  // Branding / location theming
  const primaryColor = config.branding?.primaryColor || "#f97316";
  const locationImage =
    config.branding?.locationImage || "/api/placeholder/80/60";
  const locationName = config.branding?.locationName || "Your Location";
  const locationTagline =
    config.branding?.locationTagline || `Welcome to ${locationName}`;
  const locationDescription =
    config.branding?.locationDescription ||
    "Enjoy the perfect blend of business and leisure.";

  const customStyles = {
    "--primary-color": primaryColor,
    "--primary-50": `${primaryColor}08`,
    "--primary-100": `${primaryColor}1A`,
    "--primary-500": primaryColor,
    "--primary-600": primaryColor,
    "--primary-700": primaryColor,
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto widget-overlay"
      style={customStyles}
    >
      <div className="flex min-h-screen items-center justify-center p-4 bg-black bg-opacity-50">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden widget-modal">
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
              {config.location != null && (
                <p className="text-xs text-gray-500 mt-1">
                  Location ID: {String(config.location)}
                </p>
              )}
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
              {/* Left Sidebar */}
              <div className="w-80 bg-gray-50 rounded-lg p-6 mr-8">
                <div className="mb-8">
                  <img
                    src={locationImage}
                    alt={locationName}
                    className="w-20 h-16 rounded-lg object-cover mb-4"
                    onError={(e) => {
                      e.currentTarget.src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA4MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iNjAiIGZpbGw9IiNGM0Y0RjYiLz48cmVjdCB4PSIyMCIgeT0iMTUiIHdpZHRoPSI0MCIgaGVpZ2h0PSIzMCIgZmlsbD0iIjlDQTNBRiIvPjwvc3ZnPg==";
                    }}
                  />
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    {locationName}
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {locationTagline}
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    {locationDescription}
                  </p>
                </div>

                {/* Progress */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-orange-100 text-orange-700 border-l-4 border-orange-500">
                    <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <span className="font-medium text-orange-800">
                      Booking Type
                    </span>
                  </div>
                </div>
              </div>

              {/* Main */}
              <div className="flex-1">
                <div className="max-w-2xl">
                  <div className="mb-8">
                    <div className="flex items-center space-x-2 text-orange-600 mb-2">
                      <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                      <span className="text-sm font-medium">Booking Type</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      Select a booking type for {locationName}
                    </h1>
                  </div>

                  {/* Bookables Grid (filtered) */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {filteredBookables.map((bookable) => {
                      const Icon = bookable.icon;
                      const isSelected = selectedBookable?.id === bookable.id;

                      return (
                        <button
                          key={bookable.id}
                          onClick={() => handleBookableSelect(bookable)}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            isSelected
                              ? "border-orange-500 bg-orange-50"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
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
                            </div>
                            {bookable.available && (
                              <div
                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                  isSelected
                                    ? "border-orange-500 bg-orange-500"
                                    : "border-gray-300"
                                }`}
                              >
                                {isSelected && (
                                  <div className="w-2 h-2 rounded-full bg-white"></div>
                                )}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Sidebar */}
                  <div className="w-80 bg-gray-50 rounded-lg p-6 ml-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      Ticket Details
                    </h3>
                    <div className="space-y-4 mb-8">
                      <div className="text-center py-16 text-gray-500">
                        <div className="text-sm">No Data</div>
                        <div className="text-xs mt-2">
                          No item has been added to cart
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6">
            <div className="flex justify-between items-center">
              <button
                onClick={handleClose}
                className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNext}
                disabled={!selectedBookable}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  selectedBookable
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversalBookablesList;
