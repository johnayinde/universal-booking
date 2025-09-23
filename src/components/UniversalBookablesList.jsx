// src/components/UniversalBookablesList.jsx - EXACT UI MATCH
import React, { useState } from "react";
import {
  Ticket,
  Hotel,
  UtensilsCrossed,
  Camera,
  Ship,
  Users,
  ArrowRight,
} from "lucide-react";

const UniversalBookablesList = ({ config = {} }) => {
  const [selectedBookable, setSelectedBookable] = useState(null);

  // Sample bookable data - matches your UI design
  const bookables = [
    {
      id: "entry",
      type: "entry",
      name: "Entry Ticket",
      icon: Ticket,
      description: "Access to Nike Lake Resort facilities and grounds",
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

  const handleBookableSelect = (bookable) => {
    setSelectedBookable(bookable);
  };

  const handleNext = () => {
    if (selectedBookable) {
      console.log(`🚀 Opening ${selectedBookable.type} booking...`);

      // For entry tickets, we need to create a proper widget instance
      if (selectedBookable.type === "entry") {
        // Store the selection in sessionStorage for the widget to pick up
        sessionStorage.setItem("selectedBusinessType", "entry");

        // Reload the page to trigger the widget with entry type
        window.location.reload();
        return;
      }

      // For other types, try the widget API if available
      // if (window.UniversalBookingWidget) {
      //   window.UniversalBookingWidget.destroyAll();

      //   setTimeout(() => {
      //     try {
      //       const widget = window.UniversalBookingWidget.init({
      //         businessType: selectedBookable.type,
      //         apiBaseUrl: config.apiBaseUrl || "http://127.0.0.1:8000/api",
      //         branding: {
      //           ...config.branding,
      //         },
      //       });
      //       widget.open();
      //     } catch (error) {
      //       console.error(
      //         `Error creating ${selectedBookable.type} widget:`,
      //         error
      //       );
      //       alert(`${selectedBookable.name} booking is not implemented yet.`);
      //     }
      //   }, 100);
      // } else {
      //   alert(`${selectedBookable.name} booking is not implemented yet.`);
      // }
    }
  };

  const handlePrevious = () => {
    // Close the widget or go back
    if (window.parent) {
      window.parent.postMessage({ type: "close-widget" }, "*");
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 p-6">
        <div className="mb-8">
          <img
            src="/api/placeholder/80/60"
            alt="Nike Lake Resort"
            className="w-20 h-16 rounded-lg object-cover mb-4"
            onError={(e) => {
              e.target.src =
                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA4MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjIwIiB5PSIxNSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=";
            }}
          />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Nike Lake
            <br />
            Resort,
            <br />
            Enugu
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Welcome to Nike Lake Resort
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Enjoy the perfect blend of business and leisure with breath-taking
            views in a very secure and tranquil setting.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-orange-100 text-orange-700 border-l-4 border-orange-500">
            <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">
              1
            </div>
            <span className="font-medium text-orange-800">Booking Type</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Center Content */}
        <div className="flex-1 p-8">
          <div className="max-w-2xl">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-2 text-orange-600 mb-2">
                <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <span className="text-sm font-medium">Booking Type</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Select a booking type and time to visit the landmark upside down
                house
              </h1>
            </div>

            {/* Bookables Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {bookables.map((bookable) => {
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
                            isSelected ? "text-orange-900" : "text-gray-900"
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
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Ticket Details
          </h3>

          <div className="space-y-4 mb-8">
            <div className="text-center py-16 text-gray-500">
              <div className="text-sm">No Data</div>
              <div className="text-xs mt-2">No item has been added to cart</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button
            onClick={handlePrevious}
            className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Previous
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
  );
};

export default UniversalBookablesList;
