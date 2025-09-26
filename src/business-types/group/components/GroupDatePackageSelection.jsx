// src/business-types/group/components/GroupDatePackageSelection.jsx
import React, { useState, useEffect, useContext } from "react";
import {
  Calendar,
  Users,
  Loader,
  ArrowRight,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
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

      console.log("📦 Fetching package sizes...");
      const result = await adapter.fetchPackageSizes();

      if (result.success) {
        setPackageSizes(result.data);
        console.log("✅ Package sizes loaded:", result.data);
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
    console.log("📅 Date selected:", newDate);
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
    console.log("👥 Package size selected:", packageSize);
    setSelectedPackageSize(packageSize);
    dispatch({
      type: ActionTypes.UPDATE_SELECTION,
      payload: { packageSize },
    });
  };

  // Handle next step
  const handleNext = () => {
    if (!selectedDate) {
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: "Please select a booking date",
      });
      return;
    }

    if (!selectedPackageSize) {
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: "Please select a package size",
      });
      return;
    }

    // Navigate to package options selection
    dispatch({
      type: ActionTypes.SET_CURRENT_STEP,
      payload: "details",
    });
  };

  const renderPackageSizeCard = (packageSize) => {
    const isSelected = selectedPackageSize?.id === packageSize.id;
    const isAvailable = packageSize.is_active;

    return (
      <div
        key={packageSize.id}
        onClick={() => isAvailable && handlePackageSizeSelect(packageSize)}
        className={`cursor-pointer rounded-xl p-6 transition-all duration-200 border-2 ${
          !isAvailable
            ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
            : isSelected
            ? "border-emerald-500 bg-emerald-50 shadow-lg"
            : "border-gray-200 hover:border-gray-300 hover:shadow-md"
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Users className="text-emerald-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">
                {packageSize.name}
              </h3>
              <p className="text-sm text-gray-600">{packageSize.description}</p>
            </div>
          </div>
          {isSelected && (
            <div className="p-1 bg-emerald-500 rounded-full">
              <ChevronRight className="text-white" size={16} />
            </div>
          )}
        </div>

        {/* Package Size Details */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Group Size:</span>
            <span className="font-medium text-gray-900">
              {packageSize.min_people === packageSize.max_people
                ? `${packageSize.size} people`
                : `${packageSize.min_people}-${packageSize.max_people} people`}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Starting from:</span>
            <span className="font-bold text-emerald-600 text-lg">
              ₦{parseFloat(packageSize.base_price || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Status:</span>
            <span
              className={`font-medium ${
                isAvailable ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {isAvailable ? "Available" : "Not Available"}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="mb-4">
          <div className="flex items-center space-x-2 text-emerald-600 mb-2">
            <Calendar size={20} />
            <span className="text-sm font-medium">
              Date & Package Selection
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Select Date & Package Size
          </h1>
          <p className="text-gray-600">
            Choose your preferred date and group package size
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="mr-2" size={20} />
              Booking Date
            </h3>
            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date *
              </label>
              <input
                type="date"
                value={selectedDate || ""}
                onChange={handleDateChange}
                min={getMinDate()}
                max={getMaxDate()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
              />
              <p className="mt-2 text-sm text-gray-500">
                Select a date between today and{" "}
                {new Date(getMaxDate()).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Package Size Selection */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="mr-2" size={20} />
              Select Package Size
            </h3>

            {/* Loading Package Sizes */}
            {isLoading && loadingStep === "packages" && (
              <div className="text-center py-8">
                <Loader className="animate-spin mx-auto mb-4" size={24} />
                <p className="text-gray-600">Loading available packages...</p>
              </div>
            )}

            {/* Package Size List */}
            {!isLoading && packageSizes.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {packageSizes.map(renderPackageSizeCard)}
              </div>
            )}

            {/* No Package Sizes Available */}
            {!isLoading && packageSizes.length === 0 && (
              <div className="text-center py-8">
                <Users className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No packages available
                </h3>
                <p className="text-gray-600 mb-4">
                  No group packages are currently available for this location.
                </p>
                <button
                  onClick={fetchPackageSizes}
                  className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                >
                  Refresh Packages
                </button>
              </div>
            )}
          </div>

          {/* Selection Summary */}
          {selectedDate && selectedPackageSize && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-emerald-900 mb-4">
                Selection Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-emerald-700">Date:</span>
                  <span className="ml-2 font-medium text-emerald-900">
                    {new Date(selectedDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-emerald-700">Package:</span>
                  <span className="ml-2 font-medium text-emerald-900">
                    {selectedPackageSize.name}
                  </span>
                </div>
                <div>
                  <span className="text-emerald-700">Group Size:</span>
                  <span className="ml-2 font-medium text-emerald-900">
                    {selectedPackageSize.size} people
                  </span>
                </div>
                <div>
                  <span className="text-emerald-700">Starting Price:</span>
                  <span className="ml-2 font-medium text-emerald-900">
                    ₦
                    {parseFloat(
                      selectedPackageSize.base_price || 0
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-end max-w-4xl">
          <button
            onClick={handleNext}
            disabled={!selectedDate || !selectedPackageSize}
            className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
              !selectedDate || !selectedPackageSize
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg hover:shadow-xl"
            }`}
          >
            <span>Continue to Package Options</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupDatePackageSelection;
