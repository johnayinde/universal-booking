// src/components/UniversalBookablesList.jsx
import React, { useState, useMemo, useRef } from "react";
import {
  Ticket,
  RockingChairIcon,
  Users,
  Ship,
  X,
  Calendar,
} from "lucide-react";
import { SidebarInfo } from "./UniversalBookingWidget";

const UniversalBookablesList = ({ config = {} }) => {
  const [selectedBookable, setSelectedBookable] = useState(null);

  // --- Bookables (trimmed to three, as in your latest code) ---
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
      name: "Furniture",
      icon: RockingChairIcon,
      description: "Reserve chairs, tables and decor",
      available: true,
      implemented: true,
    },
    {
      id: "group",
      type: "group",
      name: "Group Booking",
      icon: Users,
      description: "Packages and experiences for groups",
      available: true,
      implemented: true,
    },
  ];

  // --- Filters ---
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

  const isAdvancingRef = useRef(false);

  const handleNext = (bookableOverride) => {
    const bookable = bookableOverride || selectedBookable;
    if (!bookable || isAdvancingRef.current) return;
    if (!bookable.implemented) {
      alert(`${bookable.name} booking is not implemented yet.`);
      return;
    }

    sessionStorage.setItem("selectedBusinessType", bookable.type);
    isAdvancingRef.current = true;
    sessionStorage.setItem("selectedBusinessType", bookable.type);

    if (window.parent) {
      window.parent.postMessage({ type: "close-widget" }, "*");
    }

    setTimeout(() => {
      if (window.UniversalBookingWidget) {
        try {
          window.UniversalBookingWidget.destroyAll?.();
          const locId = config.locationId || config.location || 1;
          const widgetConfig = {
            businessType: bookable.type,
            businessType: bookable.type,
            locationId: locId,
            location: locId,
            apiBaseUrl: config.apiBaseUrl || "http://127.0.0.1:8000/api",
            branding: {
              ...config.branding,
              locationName:
                config.branding?.locationName || config.locationName,
              companyName: config.branding?.companyName || config.companyName,
              locationImage:
                config.branding?.locationImage || config.locationImage,
              description: config.branding?.description || config.description,
            },
            autoShow: true,
          };
          const widget = window.UniversalBookingWidget.init(widgetConfig);
          widget.open();
        } catch (error) {
          console.error("Error opening widget:", error);
          alert(
            `${bookable.name} booking encountered an error: ${error.message}``${bookable.name} booking encountered an error: ${error.message}`
          );
          isAdvancingRef.current = false; // allow retry on error
        }
      } else {
        console.error("UniversalBookingWidget not found on window");
        alert("Booking system not loaded properly.");
        isAdvancingRef.current = false;
      }
    }, 200);
  };

  const handleClose = () => {
    sessionStorage.removeItem("selectedBusinessType");
    sessionStorage.removeItem("isReloading");

    if (window.UniversalBookingWidget) {
      window.UniversalBookingWidget.destroyAll?.();
      setTimeout(() => {
        const newConfig = { ...config, businessType: null };
        window.UniversalBookingWidget.init(newConfig).open();
      }, 100);
    }

    if (window.parent) window.parent.postMessage({ type: "close-widget" }, "*");
  };

  // --- Location & branding ---
  const locationId = config.locationId || config.location || 1;
  const locationNames = { 1: "Lagos", 2: "Enugu" };
  const locationName = locationNames[locationId] || `Location ${locationId}`;

  const primaryColor = config.branding?.primaryColor || "#f97316";
  const locationImage = config.branding?.locationImage;
  const displayName =
    config.branding?.locationName || `Nike Lake Resort, ${locationName}`;

  const customStyles = {
    "--primary-color": primaryColor,
    "--primary-50": `${primaryColor}0D`,
    "--primary-100": `${primaryColor}1A`,
  };

  // --- Empty state (unchanged) ---
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

  // --- Main UI ---
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-stretch sm:items-center justify-center px-0 sm:px-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
      style={customStyles}
    >
      {/* Outer shell = light grey, padded */}
      <div className="w-full h-dvh sm:h-[92vh] sm:max-w-[95rem] sm:rounded-2xl bg-gray-100 p-2 sm:p-4 shadow-2xl overflow-hidden">
        {/* Inner card = white with thin border (like the UI) */}
        <div className="bg-white border border-gray-200 rounded-xl h-full overflow-hidden flex flex-col">
          <div className="flex-1 overflow-hidden">
            <div className="h-full flex flex-col lg:flex-row">
              {/* LEFT: Intro panel (white) */}
              <aside className="border-b lg:border-b-0 lg:border-r border-gray-200 bg-white">
                <div className="p-4 sm:p-6 lg:w-80">
                  <SidebarInfo
                    locationImage={config.branding.locationImage}
                    companyName={config.branding.companyName}
                    locationName={config.branding.locationName}
                    description={config.description}
                  />

                  {/* Progress Indicator */}
                  <div className="hidden sm:block space-y-0 -mx-6">
                    <div className="relative">
                      {/* left orange bar */}
                      <span
                        className="absolute left-0 top-[0.1rem] bottom-3 w-1 rounded"
                        style={{ backgroundColor: "orange" }}
                      />
                      {/* row */}
                      <div className="flex items-center justify-between px-4 py-5 rounded-lg bg-white border border-gray-200">
                        <div className="flex items-center gap-3">
                          <Calendar size={20} className="text-gray-800" />
                          <span className="font-medium text-gray-900">
                            Booking Type
                          </span>
                        </div>
                        <span
                          className="inline-flex items-center justify-center w-6 h-6 rounded-full"
                          style={{ backgroundColor: "orange" }}
                        >
                          <span className="block w-2.5 h-2.5 rounded-full bg-white" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>

              {/* CENTER: Bookables list (very light grey like the UI) */}
              <main className="flex-1 overflow-y-auto bg-gray-50">
                <div className="p-4 sm:p-6">
                  <div className="mb-6 sm:mb-8">
                    <div className="flex items-center space-x-3 mb-2">
                      <div
                        className="w-7 h-7 rounded-full text-white flex items-center justify-center text-sm font-bold"
                        style={{ backgroundColor: "#F5CBA7" }}
                      >
                        1
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Booking Type
                        </p>
                        <p className="text-gray-500 text-xs">
                          Select a booking type and time to visit the venue
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    {filteredBookables.map((bookable) => {
                      const Icon = bookable.icon;
                      const isSelected = selectedBookable?.id === bookable.id;

                      return (
                        <button
                          key={bookable.id}
                          onClick={() => {
                            handleBookableSelect(bookable);
                            handleNext(bookable); // auto-advance
                          }}
                          aria-pressed={isSelected}
                          className={`group p-4 rounded-xl border text-left transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            isSelected
                              ? "border-orange-500 bg-orange-50 focus:ring-orange-400"
                              : "border-gray-200 bg-white hover:border-gray-300 focus:ring-gray-300"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ring-1 ring-black/5 ${
                                isSelected
                                  ? "bg-orange-100 text-orange-600"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              <Icon size={20} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3
                                className={`font-medium text-sm truncate ${
                                  isSelected
                                    ? "text-orange-900"
                                    : "text-gray-900"
                                }`}
                              >
                                {bookable.name}
                              </h3>
                            </div>

                            {/* Radio circle on the right */}
                            <span
                              className={`ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full border transition-colors ${
                                isSelected
                                  ? "border-orange-500"
                                  : "border-gray-300"
                              }`}
                            >
                              <span
                                className={`block w-2.5 h-2.5 rounded-full transition-opacity ${
                                  isSelected
                                    ? "opacity-100 bg-orange-500"
                                    : "opacity-0"
                                }`}
                              />
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  {/* <div className="flex items-center justify-between gap-4">
                    <button
                      type="button"
                      disabled
                      className="px-6 py-3 rounded-lg border bg-white text-gray-400 border-gray-200 cursor-not-allowed"
                    >
                      Previous
                    </button>

                    <button
                      onClick={handleNext}
                      disabled={!selectedBookable}
                      className={`px-6 py-3 rounded-lg font-semibold transition-opacity ${
                        selectedBookable
                          ? "text-white"
                          : "opacity-60 text-white cursor-not-allowed"
                      }`}
                      style={{ backgroundColor: primaryColor }}
                    >
                      Next
                    </button>
                  </div> */}
                </div>
              </main>

              {/* RIGHT: Ticket details (white) */}
              <aside className="hidden lg:block lg:w-80 border-l border-gray-200 bg-white">
                <div className="p-6">
                  <h3 className="text-base font-semibold text-gray-900">
                    Ticket Details
                  </h3>
                  <div className="mt-6 text-sm text-gray-500 space-y-1">
                    <p className="font-medium text-gray-400">No Data</p>
                    <p>No item has been added to cart</p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversalBookablesList;
