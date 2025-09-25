// src/business-types/furniture/components/FurnitureDateSelection.jsx
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Armchair,
  Loader,
  ChevronRight,
  Users,
  AlertCircle,
} from "lucide-react";
import { useUniversalBooking } from "../../../core/UniversalStateManager";
import { ActionTypes } from "../../../core/UniversalStateManager";

const FurnitureDateSelection = ({ apiService, adapter }) => {
  const { state, dispatch, locationId } = useUniversalBooking();
  const { loading, error } = state;

  const [selectedDate, setSelectedDate] = useState("");
  const [furnitureList, setFurnitureList] = useState([]);
  const [selectedFurniture, setSelectedFurniture] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Load furniture list on component mount
  useEffect(() => {
    loadFurnitureList();
  }, []);

  const loadFurnitureList = async () => {
    try {
      setIsLoading(true);
      setLoadingStep("furniture");
      dispatch({ type: ActionTypes.CLEAR_ERROR });

      console.log("🪑 Loading furniture list...");
      const furniture = await adapter.getFurnitureList();

      setFurnitureList(furniture);
      console.log("✅ Furniture list loaded:", furniture);
    } catch (error) {
      console.error("❌ Failed to load furniture list:", error);
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: error.message || "Failed to load furniture list",
      });
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  // Handle date change
  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);

    // Update global state
    dispatch({
      type: ActionTypes.UPDATE_BOOKING_DATA,
      payload: { date },
    });
  };

  // Handle furniture selection
  const handleFurnitureSelect = (furniture) => {
    setSelectedFurniture(furniture);

    // Update global state
    dispatch({
      type: ActionTypes.SET_SELECTED_FURNITURE,
      payload: furniture,
    });

    console.log("🪑 Selected furniture:", furniture);
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

    if (!selectedFurniture) {
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: "Please select furniture type",
      });
      return;
    }

    // Navigate to session selection - FIXED to use correct step key
    dispatch({
      type: ActionTypes.SET_CURRENT_STEP,
      payload: "details", // Changed from "sessionSelection" to "details"
    });
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Get maximum date (3 months from now)
  const getMaxDate = () => {
    const future = new Date();
    future.setMonth(future.getMonth() + 3);
    return future.toISOString().split("T")[0];
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="mb-4">
          <div className="flex items-center space-x-2 text-orange-600 mb-2">
            <Calendar size={20} />
            <span className="text-sm font-medium">
              Date & Furniture Selection
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Select Booking Date and Furniture
          </h1>
          <p className="text-gray-600">
            Choose your preferred date and furniture type for booking
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl space-y-8">
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
              Select Date
            </h3>

            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Booking Date *
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                min={getMinDate()}
                max={getMaxDate()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
              />
              <p className="mt-2 text-sm text-gray-500">
                Select a date between today and{" "}
                {new Date(getMaxDate()).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Furniture Selection */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Armchair className="mr-2" size={20} />
              Select Furniture Type
            </h3>

            {/* Loading Furniture */}
            {isLoading && loadingStep === "furniture" && (
              <div className="text-center py-8">
                <Loader className="animate-spin mx-auto mb-4" size={24} />
                <p className="text-gray-600">Loading available furniture...</p>
              </div>
            )}

            {/* Furniture List */}
            {!isLoading && furnitureList.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {furnitureList.map((furniture) => (
                  <div
                    key={furniture.id}
                    onClick={() => handleFurnitureSelect(furniture)}
                    className={`cursor-pointer rounded-xl p-6 transition-all duration-200 border-2 ${
                      selectedFurniture?.id === furniture.id
                        ? "border-orange-500 bg-orange-50 shadow-lg"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                    }`}
                  >
                    {/* Furniture Image */}
                    {furniture.image_url && (
                      <div className="w-full h-32 mb-4 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={furniture.image_url}
                          alt={furniture.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Furniture Info */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-gray-900">
                          {furniture.name}
                        </h4>
                        {selectedFurniture?.id === furniture.id && (
                          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                            <ChevronRight className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>

                      {furniture.description && (
                        <p className="text-sm text-gray-600">
                          {furniture.description}
                        </p>
                      )}

                      {/* Capacity & Price */}
                      <div className="flex items-center justify-between">
                        {furniture.max_capacity && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Users size={14} className="mr-1" />
                            <span>Max {furniture.max_capacity} people</span>
                          </div>
                        )}

                        {furniture.price > 0 && (
                          <div className="text-lg font-semibold text-orange-600">
                            {formatCurrency(furniture.price)}
                          </div>
                        )}
                      </div>

                      {!furniture.available && (
                        <div className="text-sm text-red-600 font-medium">
                          Currently unavailable
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Furniture Available */}
            {!isLoading && furnitureList.length === 0 && (
              <div className="text-center py-8">
                <Armchair className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No furniture available
                </h3>
                <p className="text-gray-600 mb-4">
                  No furniture types are currently available for booking.
                </p>
                <button
                  onClick={loadFurnitureList}
                  className="inline-flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Loader size={16} />
                  <span>Retry</span>
                </button>
              </div>
            )}
          </div>

          {/* Selected Summary */}
          {(selectedDate || selectedFurniture) && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h4 className="font-medium text-blue-900 mb-3">Your Selection</h4>
              <div className="space-y-2 text-sm">
                {selectedDate && (
                  <div className="flex justify-between">
                    <span className="text-blue-700">Date:</span>
                    <span className="font-medium text-blue-900">
                      {new Date(selectedDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}
                {selectedFurniture && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Furniture:</span>
                      <span className="font-medium text-blue-900">
                        {selectedFurniture.name}
                      </span>
                    </div>
                    {selectedFurniture.price > 0 && (
                      <div className="flex justify-between">
                        <span className="text-blue-700">Base Price:</span>
                        <span className="font-medium text-blue-900">
                          {formatCurrency(selectedFurniture.price)}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            disabled={!selectedDate || !selectedFurniture || isLoading}
            className={`px-8 py-3 rounded-lg font-medium transition-colors ${
              selectedDate && selectedFurniture && !isLoading
                ? "bg-orange-600 text-white hover:bg-orange-700 shadow-lg hover:shadow-xl"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isLoading ? "Loading..." : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FurnitureDateSelection;
