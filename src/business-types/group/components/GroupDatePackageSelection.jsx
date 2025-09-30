// src/business-types/group/components/GroupDatePackageSelection.jsx
import React, { useState, useEffect, useContext } from "react";
import { Calendar, Users, Loader, AlertCircle, ArrowLeft } from "lucide-react";
import { ActionTypes } from "../../../core/UniversalStateManager";

import { useUniversalBooking } from "../../../core/UniversalStateManager";

/**
 * Group Date & Package Size Selection Component
 * First step: Date picker and package size selection
 */
const GroupDatePackageSelection = ({ apiService, adapter }) => {
  const { state, dispatch } = useUniversalBooking();
  const { error, isLoading } = state;
  const selectedDate = state.selectedDate;

  // Local state
  const [packageSizes, setPackageSizes] = useState([]);
  const [selectedPackageSize, setSelectedPackageSize] = useState(null);
  const [loadingStep, setLoadingStep] = useState("");

  const [packageOptions, setPackageOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState("");

  // Initialize date to today if not set
  useEffect(() => {
    if (!selectedDate) {
      const today = new Date().toISOString().split("T")[0];
      dispatch({
        type: ActionTypes.SET_SELECTED_DATE,
        payload: today,
      });
    }
  }, [selectedDate, dispatch]);

  // Fetch package sizes when component loads
  useEffect(() => {
    if (adapter && adapter.fetchPackageSizes) {
      fetchPackageSizes();
    }
  }, [adapter]);

  // Fetch available package sizes
  const fetchPackageSizes = async () => {
    try {
      setLoadingStep("packages");
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_ERROR });

      const result = await adapter.fetchPackageSizes();

      if (result.success) {
        setPackageSizes(result.data);
      } else {
        throw new Error(result.error || "Failed to fetch package sizes");
      }
    } catch (error) {
      console.error("❌ Error fetching package sizes:", error);
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: error.message || "Failed to load package sizes",
      });
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      setLoadingStep("");
    }
  };

  // Get date constraints
  const getMinDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 365); // 1 year in advance
    return maxDate.toISOString().split("T")[0];
  };

  // Handle date change
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    dispatch({
      type: ActionTypes.SET_SELECTED_DATE,
      payload: newDate,
    });

    // Clear package size selection when date changes
    setSelectedPackageSize(null);
    dispatch({
      type: ActionTypes.UPDATE_SELECTION,
      payload: { packageSize: null },
    });
  };

  // Handle package size selection
  const handlePackageSizeSelect = (packageSize) => {
    setSelectedPackageSize(packageSize);
    dispatch({
      type: ActionTypes.UPDATE_SELECTION,
      payload: { packageSize },
    });

    // clear previously loaded options
    setPackageOptions([]);
    setOptionsError("");
  };

  // NEW: fetch options whenever size AND date are chosen
  useEffect(() => {
    const loadOptions = async () => {
      if (
        !adapter?.fetchPackageOptions ||
        !selectedPackageSize?.id ||
        !selectedDate
      )
        return;
      try {
        setOptionsLoading(true);
        setOptionsError("");
        const res = await adapter.fetchPackageOptions(
          selectedPackageSize.id,
          selectedDate
        );
        console.log("✅ Inline package options loaded:", res.data);
        if (res?.success) {
          const mapped = res.data.map((o) => ({
            id: o.id,
            name: o.name,
            description: o.description,
            price: o.price,
            image: o.image,
            benefits: o.benefits || [],
          }));
          setPackageOptions(mapped);
        } else {
          throw new Error(res?.error || "Failed to fetch package options");
        }
      } catch (err) {
        console.error("❌ Inline options error:", err);
        setOptionsError(err.message || "Failed to fetch package options");
      } finally {
        setOptionsLoading(false);
      }
    };
    loadOptions();
  }, [adapter, selectedPackageSize?.id, selectedDate]);

  // NEW: click option → save + go to details page
  const handleOptionClick = (option) => {
    dispatch({
      type: ActionTypes.UPDATE_SELECTION,
      payload: { packageOption: option },
    });
    dispatch({
      type: ActionTypes.SET_CURRENT_STEP,
      payload: "selection", // this is the GroupPackageDetails page
    });
  };

  const handleBack = () => {
    // Clear the selected business type
    sessionStorage.removeItem("selectedBusinessType");

    // Destroy current widget
    if (window.UniversalBookingWidget) {
      window.UniversalBookingWidget.destroyAll?.();
    }

    // Reinitialize widget without business type (shows bookables list)
    setTimeout(() => {
      const widget = window.UniversalBookingWidget.init({
        businessType: null, // This shows the bookables list
        locationId: state.config?.locationId || 1,
        apiBaseUrl: state.config?.apiBaseUrl,
        branding: state.config?.branding,
        autoShow: true,
      });
      widget.open();
    }, 100);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          <span>Back to Bookables</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50  rounded-lg ">
              <div className="flex items-center">
                <AlertCircle
                  className="text-red-400 mr-2 flex-shrink-0"
                  size={20}
                />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Date Selection */}
          <div className="bg-white rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Booking Date
            </h3>
            <div className="mb-4">
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="date"
                  value={selectedDate || ""}
                  onChange={handleDateChange}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Package Size Selection */}
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-6">
            <div className="flex items-center  mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center mr-3">
                Package Size
              </h3>
              <span className="text-sm text-orange-600 font-medium">
                Pick only one option
              </span>
            </div>
            {/* Package Size Cards */}
            {!isLoading && packageSizes.length > 0 && (
              <div className="space-y-3">
                {packageSizes.map((packageSize) => {
                  const isSelected = selectedPackageSize?.id === packageSize.id;
                  const isAvailable = packageSize.is_active;

                  return (
                    <div
                      key={packageSize.id}
                      onClick={() =>
                        isAvailable && handlePackageSizeSelect(packageSize)
                      }
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        !isAvailable
                          ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                          : isSelected
                          ? "border-emerald-500 bg-white shadow-md"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Users className="text-emerald-600" size={20} />
                          <span className="font-medium text-gray-900">
                            {packageSize.name}
                          </span>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? "border-emerald-500 bg-emerald-500"
                              : "border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {/* NEW: Package Options inline (shows after a size is picked) */}
          {selectedDate && selectedPackageSize && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  Package Options
                </h3>
                {optionsLoading && (
                  <span className="inline-flex items-center text-sm text-gray-600">
                    <Loader className="animate-spin mr-2" size={16} />
                    Loading…
                  </span>
                )}
              </div>

              {optionsError && (
                <div className="flex items-center gap-2 text-red-600 text-sm mb-3">
                  <AlertCircle size={16} /> {optionsError}
                </div>
              )}

              {!optionsLoading &&
                packageOptions.length === 0 &&
                !optionsError && (
                  <div className="text-sm text-gray-600">
                    No options available.
                  </div>
                )}

              {packageOptions.length > 0 && (
                <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
                  <div className="flex gap-4 pb-1">
                    {packageOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleOptionClick(opt)}
                        className="min-w-[240px] max-w-[260px] text-left bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="h-28 w-full rounded-t-xl overflow-hidden bg-gray-100">
                          {opt.image ? (
                            <img
                              src={opt.image}
                              alt={opt.name}
                              className="w-full h-full object-cover"
                              onError={(e) =>
                                (e.currentTarget.style.display = "none")
                              }
                            />
                          ) : null}
                        </div>
                        <div className="p-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {opt.name}
                            </h4>
                            <span className="text-sm font-bold text-gray-900">
                              {new Intl.NumberFormat("en-NG", {
                                style: "currency",
                                currency: "NGN",
                                maximumFractionDigits: 0,
                              }).format(opt.price || 0)}
                            </span>
                          </div>
                          {opt.description && (
                            <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                              {opt.description}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupDatePackageSelection;
