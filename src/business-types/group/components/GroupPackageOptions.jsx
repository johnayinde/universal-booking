// src/business-types/group/components/GroupPackageOptions.jsx
import React, { useState, useEffect, useContext } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Package,
  Loader,
  AlertCircle,
  Clock,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import UniversalBookingContext, {
  ActionTypes,
} from "../../../core/UniversalStateManager";

/**
 * Group Package Options Component
 * Second step: Horizontal scrolling list of package options
 */
const GroupPackageOptions = ({ apiService, adapter }) => {
  const { state, dispatch } = useContext(UniversalBookingContext);
  const { selectedDate, error, isLoading, selection } = state;

  // Local state
  const [packageOptions, setPackageOptions] = useState([]);
  const [selectedPackageOption, setSelectedPackageOption] = useState(null);
  const [loadingStep, setLoadingStep] = useState("");

  // Get selected package size from state
  const selectedPackageSize = selection?.packageSize;

  // Fetch package options when component loads
  useEffect(() => {
    if (
      adapter &&
      adapter.fetchPackageOptions &&
      selectedPackageSize &&
      selectedDate
    ) {
      fetchPackageOptions();
    }
  }, [adapter, selectedPackageSize, selectedDate]);

  // Fetch available package options
  const fetchPackageOptions = async () => {
    try {
      setLoadingStep("options");
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_ERROR });

      console.log("🎁 Fetching package options...");
      const result = await adapter.fetchPackageOptions(
        selectedPackageSize.id,
        selectedDate
      );

      if (result.success) {
        // setPackageOptions(result.data);
        setPackageOptions(
          result.data.map((option) => ({
            id: option.id,
            name: option.title,
            description: option.description,
            price: option.price,
            image_url: option.image,
            features: option.benefits ? option.benefits.map((b) => b.name) : [],
            benefits: option.benefits || [],
            included: option.benefits ? option.benefits.map((b) => b.name) : [],
            duration: "Full day", // Default duration
            is_active: true,
          }))
        );
        console.log("✅ Package options loaded:", result.data);
      } else {
        throw new Error(result.error || "Failed to fetch package options");
      }
    } catch (error) {
      console.error("❌ Error fetching package options:", error);
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: error.message || "Failed to load package options",
      });
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      setLoadingStep("");
    }
  };

  // Handle package option selection
  const handlePackageOptionSelect = (packageOption) => {
    console.log("🎁 Package option selected:", packageOption);
    setSelectedPackageOption(packageOption);
    dispatch({
      type: ActionTypes.UPDATE_SELECTION,
      payload: {
        ...selection,
        packageOption,
      },
    });
  };

  // Handle back navigation
  const handleBack = () => {
    dispatch({
      type: ActionTypes.SET_CURRENT_STEP,
      payload: "list",
    });
  };

  // Handle next step
  const handleNext = () => {
    if (!selectedPackageOption) {
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: "Please select a package option",
      });
      return;
    }

    // Navigate to package details
    dispatch({
      type: ActionTypes.SET_CURRENT_STEP,
      payload: "selection",
    });
  };

  const renderPackageOptionCard = (packageOption) => {
    const isSelected = selectedPackageOption?.id === packageOption.id;
    const isAvailable = packageOption.is_active;

    return (
      <div
        key={packageOption.id}
        onClick={() => isAvailable && handlePackageOptionSelect(packageOption)}
        className={`flex-shrink-0 w-80 cursor-pointer rounded-xl transition-all duration-200 border-2 overflow-hidden ${
          !isAvailable
            ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
            : isSelected
            ? "border-emerald-500 bg-emerald-50 shadow-lg transform scale-105"
            : "border-gray-200 hover:border-gray-300 hover:shadow-md hover:transform hover:scale-102"
        }`}
      >
        {/* Package Image */}
        <div className="relative h-48 bg-gradient-to-br from-emerald-400 to-emerald-600">
          {packageOption.image_url ? (
            <img
              src={packageOption.image_url}
              alt={packageOption.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className={`absolute inset-0 flex items-center justify-center ${
              packageOption.image_url ? "hidden" : "flex"
            }`}
            style={{ display: packageOption.image_url ? "none" : "flex" }}
          >
            <Package className="text-white" size={48} />
          </div>

          {/* Selected indicator */}
          {isSelected && (
            <div className="absolute top-4 right-4 p-2 bg-emerald-500 rounded-full shadow-lg">
              <Star className="text-white fill-current" size={16} />
            </div>
          )}

          {/* Price badge */}
          <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="font-bold text-emerald-600 text-lg">
              ₦{parseFloat(packageOption.price || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Package Info */}
        <div className="p-6">
          <h3 className="font-bold text-gray-900 text-xl mb-2">
            {packageOption.name}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {packageOption.description}
          </p>

          {/* Package Features */}
          <div className="space-y-2 mb-4">
            {packageOption.duration && (
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="mr-2" size={14} />
                <span>{packageOption.duration}</span>
              </div>
            )}

            {packageOption.features && packageOption.features.length > 0 && (
              <div className="space-y-1">
                {packageOption.features.slice(0, 3).map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center text-sm text-gray-600"
                  >
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></div>
                    <span>{feature}</span>
                  </div>
                ))}
                {packageOption.features.length > 3 && (
                  <div className="text-sm text-emerald-600 font-medium">
                    +{packageOption.features.length - 3} more features
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center justify-between">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                isAvailable
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {isAvailable ? "Available" : "Not Available"}
            </span>

            {isSelected && (
              <div className="flex items-center text-emerald-600 text-sm font-medium">
                <span>Selected</span>
                <ChevronRight className="ml-1" size={14} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
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
          <span>Back to Date & Package Size</span>
        </button>

        <div className="mb-4">
          <div className="flex items-center space-x-2 text-emerald-600 mb-2">
            <Package size={20} />
            <span className="text-sm font-medium">Package Options</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Choose Your Package
          </h1>
          <p className="text-gray-600">
            Select from our available group packages for{" "}
            {selectedPackageSize?.name} on{" "}
            {selectedDate && new Date(selectedDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Error Display */}
          {error && (
            <div className="mx-6 mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
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

          {/* Loading State */}
          {isLoading && loadingStep === "options" && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader className="animate-spin mx-auto mb-4" size={32} />
                <p className="text-gray-600 text-lg">
                  Loading package options...
                </p>
              </div>
            </div>
          )}

          {/* Package Options Horizontal Scroll */}
          {!isLoading && packageOptions.length > 0 && (
            <div className="flex-1 p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Package Options
                </h3>
              </div>

              <div className="relative">
                <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:space-x-0">
                  {packageOptions.map((packageOption) => {
                    const isSelected =
                      selectedPackageOption?.id === packageOption.id;
                    const isAvailable = packageOption.is_active;

                    return (
                      <div
                        key={packageOption.id}
                        onClick={() =>
                          isAvailable &&
                          handlePackageOptionSelect(packageOption)
                        }
                        className={`flex-shrink-0 w-72 md:w-auto cursor-pointer rounded-xl transition-all duration-200 border-2 overflow-hidden ${
                          !isAvailable
                            ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                            : isSelected
                            ? "border-emerald-500 bg-emerald-50 shadow-lg"
                            : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                        }`}
                      >
                        {/* Package Image */}
                        <div className="relative h-40 bg-gradient-to-br from-emerald-400 to-emerald-600">
                          {packageOption.image_url ? (
                            <img
                              src={packageOption.image_url}
                              alt={packageOption.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-emerald-500 flex items-center justify-center">
                              <div className="text-white text-center">
                                <div className="text-2xl font-bold mb-1">
                                  TOODUM
                                </div>
                                <div className="text-lg">TAKEAWAYS</div>
                                <div className="mt-2">
                                  <div className="w-8 h-0.5 bg-yellow-400 mx-auto mb-1"></div>
                                  <div className="flex justify-center space-x-1">
                                    <div className="w-1 h-4 bg-red-400"></div>
                                    <div className="w-1 h-4 bg-yellow-400"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Price badge */}
                          <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm px-3 py-1 rounded-full">
                            <span className="font-bold text-emerald-600">
                              ₦
                              {parseFloat(
                                packageOption.price || 0
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Package Info */}
                        <div className="p-4">
                          <h3 className="font-bold text-gray-900 text-lg mb-2">
                            {packageOption.name}
                          </h3>

                          {/* Selected indicator */}
                          <div className="flex items-center justify-between">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                isAvailable
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {isAvailable ? "Available" : "Not Available"}
                            </span>

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
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* No Package Options Available */}
          {!isLoading && packageOptions.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md mx-4">
                <Package className="mx-auto text-gray-400 mb-4" size={64} />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No packages available
                </h3>
                <p className="text-gray-600 mb-6">
                  No package options are currently available for your selected
                  date and group size. Please try selecting a different date or
                  package size.
                </p>
                <button
                  onClick={handleBack}
                  className="px-6 py-3 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                >
                  Change Selection
                </button>
              </div>
            </div>
          )}

          {/* Selection Summary */}
          {selectedPackageOption && (
            <div className="mx-6 mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-emerald-900 mb-4">
                Selected Package
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-emerald-700">Package:</span>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">
                    {selectedPackageOption.name}{" "}
                    {/* This should show "High Package" from your API */}
                  </h3>
                </div>
                <div>
                  <span className="text-emerald-700">Price:</span>
                  <div className="mt-2">
                    <span className="text-lg font-bold text-emerald-600">
                      ₦
                      {parseFloat(
                        selectedPackageOption.price || 0
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-emerald-700">Duration:</span>
                  <span className="ml-2 font-medium text-emerald-900">
                    Full day
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center space-x-2"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

          <button
            onClick={handleNext}
            disabled={!selectedPackageOption}
            className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
              !selectedPackageOption
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg hover:shadow-xl"
            }`}
          >
            <span>View Package Details</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default GroupPackageOptions;
