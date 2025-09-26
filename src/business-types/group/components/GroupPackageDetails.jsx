// src/business-types/group/components/GroupPackageDetails.jsx
import React, { useState, useEffect, useContext } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Info,
  Loader,
  AlertCircle,
  Clock,
  Users,
  MapPin,
  CheckCircle,
  Star,
  Calendar,
  Package,
} from "lucide-react";
import UniversalBookingContext, {
  ActionTypes,
} from "../../../core/UniversalStateManager";

/**
 * Group Package Details Component
 * Third step: Detailed view of selected package
 */
const GroupPackageDetails = () => {
  const { state, dispatch } = useContext(UniversalBookingContext);
  const { adapter, selectedDate, error, isLoading, selection } = state;

  // Local state
  const [packageDetails, setPackageDetails] = useState(null);
  const [loadingStep, setLoadingStep] = useState("");

  // Get selected data from state
  const selectedPackageSize = selection?.packageSize;
  const selectedPackageOption = selection?.packageOption;

  // Fetch package details when component loads
  useEffect(() => {
    if (selectedPackageOption) {
      setPackageDetails(selectedPackageOption);
    }
  }, [selectedPackageOption]);

  // Fetch detailed package information
  const fetchPackageDetails = async () => {
    try {
      setLoadingStep("details");
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_ERROR });

      console.log("📋 Fetching package details...");
      const result = await adapter.fetchPackageDetails(
        selectedPackageOption.id
      );

      if (result.success) {
        setPackageDetails(result.data);
        console.log("✅ Package details loaded:", result.data);
      } else {
        // Fallback to existing package option data
        setPackageDetails(selectedPackageOption);
        console.log("⚠️ Using fallback package data:", selectedPackageOption);
      }
    } catch (error) {
      console.error("❌ Error fetching package details:", error);
      // Use fallback data instead of showing error
      setPackageDetails(selectedPackageOption);
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      setLoadingStep("");
    }
  };

  // Handle back navigation
  const handleBack = () => {
    dispatch({
      type: ActionTypes.SET_CURRENT_STEP,
      payload: "details",
    });
  };

  // Handle next step
  const handleNext = () => {
    if (!packageDetails) {
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: "Package details not available",
      });
      return;
    }

    // Update selection with detailed package info
    dispatch({
      type: ActionTypes.UPDATE_SELECTION,
      payload: {
        ...selection,
        packageDetails,
      },
    });

    // Navigate to personal info
    dispatch({
      type: ActionTypes.SET_CURRENT_STEP,
      payload: "booking",
    });
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!packageDetails || !selectedPackageSize) return 0;
    return (
      parseFloat(packageDetails.price || 0) *
      parseInt(selectedPackageSize.size || 1)
    );
  };

  if (!selectedPackageOption) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Package Selected
          </h3>
          <p className="text-gray-600 mb-4">
            Please go back and select a package option.
          </p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
          >
            Select Package
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          <span>Back to Package Options</span>
        </button>

        <div className="mb-4">
          <div className="flex items-center space-x-2 text-emerald-600 mb-2">
            <Info size={20} />
            <span className="text-sm font-medium">Package Details</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {selectedPackageOption.name}
          </h1>
          <p className="text-gray-600">
            Review the complete details of your selected package
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

          {/* Loading State */}
          {isLoading && loadingStep === "details" && (
            <div className="text-center py-8">
              <Loader className="animate-spin mx-auto mb-4" size={32} />
              <p className="text-gray-600 text-lg">
                Loading package details...
              </p>
            </div>
          )}

          {/* Package Details */}
          {packageDetails && (
            <>
              {/* Package Hero */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="relative h-64 bg-gradient-to-br from-emerald-400 to-emerald-600">
                  {packageDetails.image_url ? (
                    <img
                      src={packageDetails.image_url}
                      alt={packageDetails.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className={`absolute inset-0 flex items-center justify-center ${
                      packageDetails.image_url ? "hidden" : "flex"
                    }`}
                    style={{
                      display: packageDetails.image_url ? "none" : "flex",
                    }}
                  >
                    <Package className="text-white" size={64} />
                  </div>

                  {/* Price overlay */}
                  <div className="absolute bottom-6 left-6 bg-white bg-opacity-95 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <div className="text-sm text-gray-600">
                      Price per person
                    </div>
                    <div className="text-2xl font-bold text-emerald-600">
                      ₦{parseFloat(packageDetails.price || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Package Information Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Details */}
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Package Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Users className="mr-3 text-emerald-600" size={20} />
                        <div>
                          <div className="font-medium">Group Size</div>
                          <div className="text-sm text-gray-600">
                            {selectedPackageSize.size} people
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <Calendar className="mr-3 text-emerald-600" size={20} />
                        <div>
                          <div className="font-medium">Date</div>
                          <div className="text-sm text-gray-600">
                            {new Date(selectedDate).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </div>
                        </div>
                      </div>

                      {packageDetails.duration && (
                        <div className="flex items-center">
                          <Clock className="mr-3 text-emerald-600" size={20} />
                          <div>
                            <div className="font-medium">Duration</div>
                            <div className="text-sm text-gray-600">
                              {packageDetails.duration}
                            </div>
                          </div>
                        </div>
                      )}

                      {packageDetails.location && (
                        <div className="flex items-center">
                          <MapPin className="mr-3 text-emerald-600" size={20} />
                          <div>
                            <div className="font-medium">Location</div>
                            <div className="text-sm text-gray-600">
                              {packageDetails.location}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Description
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {packageDetails.description ||
                        packageDetails.detailed_description ||
                        "Experience the perfect group getaway with this carefully curated package."}
                    </p>
                  </div>
                </div>

                {/* Right Column - Features & Pricing */}
                <div className="space-y-6">
                  {/* Features/What's Included */}
                  {(packageDetails.features || packageDetails.benefits) && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <CheckCircle
                          className="mr-2 text-emerald-600"
                          size={20}
                        />
                        What's Included
                      </h3>
                      <div className="space-y-2">
                        {(
                          packageDetails.benefits ||
                          packageDetails.features ||
                          []
                        ).map((item, index) => (
                          <div key={index} className="flex items-start">
                            <CheckCircle
                              className="mr-2 mt-0.5 text-emerald-500 flex-shrink-0"
                              size={16}
                            />
                            <span className="text-gray-700">
                              {item.name || item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pricing Breakdown */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-emerald-900 mb-4 flex items-center">
                      <Star className="mr-2 text-emerald-600" size={20} />
                      Pricing Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-700">
                          {packageDetails.name} × {selectedPackageSize.size}
                        </span>
                        <span className="font-medium text-emerald-900">
                          ₦
                          {(
                            parseFloat(packageDetails.price || 0) *
                            parseInt(selectedPackageSize.size)
                          ).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-emerald-700">
                          Price per person
                        </span>
                        <span className="font-medium text-emerald-900">
                          ₦
                          {parseFloat(
                            packageDetails.price || 0
                          ).toLocaleString()}
                        </span>
                      </div>

                      <div className="border-t border-emerald-200 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-emerald-900">
                            Total Amount
                          </span>
                          <span className="font-bold text-xl text-emerald-600">
                            ₦{calculateTotalPrice().toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  {packageDetails.terms_and_conditions && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Terms & Conditions
                      </h3>
                      <div className="text-sm text-gray-600 space-y-2">
                        {Array.isArray(packageDetails.terms_and_conditions) ? (
                          packageDetails.terms_and_conditions.map(
                            (term, index) => (
                              <div key={index} className="flex items-start">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                                <span>{term}</span>
                              </div>
                            )
                          )
                        ) : (
                          <p>{packageDetails.terms_and_conditions}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Summary */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Booking Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-gray-600 mb-1">Date</div>
                    <div className="font-medium text-gray-900">
                      {new Date(selectedDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-gray-600 mb-1">Package</div>
                    <div className="font-medium text-gray-900">
                      {packageDetails.name}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-gray-600 mb-1">Group Size</div>
                    <div className="font-medium text-gray-900">
                      {selectedPackageSize.size} people
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-gray-600 mb-1">Total Price</div>
                    <div className="font-medium text-emerald-600 text-lg">
                      ₦{calculateTotalPrice().toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between max-w-4xl">
          <button
            onClick={handleBack}
            disabled={isLoading}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

          <button
            onClick={handleNext}
            disabled={isLoading || !packageDetails}
            className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
              isLoading || !packageDetails
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg hover:shadow-xl"
            }`}
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin" size={18} />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <span>Continue to Booking</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupPackageDetails;
