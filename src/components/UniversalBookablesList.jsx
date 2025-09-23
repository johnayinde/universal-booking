// src/components/UniversalBookablesList.jsx
import React, { useState, useMemo } from "react";
import { Ticket, Utensils, Hotel, Camera, Users, Ship } from "lucide-react";
import ConfigManager from "../core/ConfigManager";

const UniversalBookablesList = ({ config = {} }) => {
  const [selectedBookable, setSelectedBookable] = useState(null);

  // Get location information
  const locationId = config.locationId || config.location || 1; // Default to Lagos
  const locationInfo = ConfigManager.getLocation(locationId);

  // Get available bookables for this location
  const availableBookables = useMemo(() => {
    if (!locationInfo) return [];

    // Define all possible bookables with their icons
    const allBookables = [
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
        available: false, // Not in API endpoints yet
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

    // Filter bookables based on what's available in endpoints and config
    const availableTypes = Object.keys(locationInfo.endpoints);
    const configBookables = config.bookables || availableTypes;

    return allBookables.filter((bookable) => {
      // Check if it's in the location's endpoints
      const hasEndpoint = availableTypes.includes(bookable.type);

      // Check if it's in the config
      const inConfig = configBookables.some(
        (configType) =>
          configType.toLowerCase() === bookable.id.toLowerCase() ||
          configType.toLowerCase() === bookable.type.toLowerCase()
      );

      return hasEndpoint && inConfig;
    });
  }, [config.bookables, locationInfo]);

  const handleBookableSelect = (bookable) => {
    setSelectedBookable(bookable);
  };

  const handleNext = () => {
    if (!selectedBookable) return;

    // Check if bookable is implemented
    if (!selectedBookable.implemented) {
      alert(`${selectedBookable.name} booking is not implemented yet.`);
      return;
    }

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
            locationId: locationId,
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
          alert(`${selectedBookable.name} booking encountered an error.`);
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
  const locationName =
    locationInfo?.displayName ||
    config.branding?.locationName ||
    "Your Location";
  const locationTagline =
    config.branding?.locationTagline ||
    `Welcome to ${locationInfo?.name || "Nike Lake Resort"}`;
  const locationDescription =
    config.branding?.locationDescription ||
    "Enjoy the perfect blend of business and leisure.";

  // Show error if no location found
  if (!locationInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Location Not Found
            </h2>
            <p className="text-gray-600">
              Location ID {locationId} is not configured. Please check your
              configuration.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-full py-3 px-4 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Show message if no bookables available
  if (availableBookables.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📅</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Bookables Available
            </h2>
            <p className="text-gray-600">
              No booking options are currently available for {locationName}.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-full py-3 px-4 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Location Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <img
              src={locationImage}
              alt={locationName}
              className="w-12 h-12 rounded-lg object-cover"
              onError={(e) => {
                e.target.src = "/api/placeholder/48/48";
              }}
            />
            <div>
              <h2 className="font-semibold text-gray-900">{locationName}</h2>
              <p className="text-sm text-gray-600">{locationInfo.name}</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">{locationTagline}</p>
          <p className="text-gray-500 text-xs">{locationDescription}</p>
        </div>

        {/* Progress Indicator */}
        <div className="p-6 bg-orange-50 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: primaryColor }}
            >
              1
            </div>
            <span className="font-medium text-orange-800">Booking Type</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-orange-600 mb-2">
              <div
                className="w-6 h-6 rounded-full text-white flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: primaryColor }}
              >
                1
              </div>
              <span className="text-sm font-medium">Booking Type</span>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ×
            </button>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Select a booking type for {locationInfo.name}
          </h1>
          <p className="text-gray-600">
            Available booking options at this location
          </p>
        </div>

        {/* Main */}
        <div className="flex-1 px-8 py-6">
          <div className="max-w-2xl">
            {/* Bookables Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {availableBookables.map((bookable) => {
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
                            isSelected ? "text-orange-900" : "text-gray-900"
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
                              Available
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Location Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">ℹ️</span>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">
                    Location Information
                  </h4>
                  <p className="text-blue-700 text-sm">
                    You are booking for <strong>{locationName}</strong>{" "}
                    (Location ID: {locationId}).
                    {availableBookables.length === 1
                      ? ` Only ${availableBookables[0].name.toLowerCase()} booking is available at this location.`
                      : ` ${availableBookables.length} booking types are available at this location.`}
                  </p>
                </div>
              </div>
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
                  backgroundColor: selectedBookable ? primaryColor : undefined,
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
  );
};

export default UniversalBookablesList;
