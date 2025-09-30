// src/business-types/group/components/GroupPackageDetails.jsx
import React, { useState, useEffect, useContext } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Info,
  Loader,
  AlertCircle,
 
} from "lucide-react";
import UniversalBookingContext, {
  ActionTypes,
} from "../../../core/UniversalStateManager";

/**
 * Group Package Details Component
 * Third step: Detailed view of selected package
 */
const GroupPackageDetails = ({ apiService, adapter }) => {
  const { state, dispatch } = useContext(UniversalBookingContext);
  const { error, isLoading, selection } = state;

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
      payload: "list",
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
      <div className="p-6 b">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          <span>Back to Package Options</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
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
              <div className="bg-white rounded-xl overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-64 h-48 md:h-64 relative bg-emerald-500 flex-shrink-0">
                    {packageDetails.image_url ? (
                      <img
                        src={packageDetails.image_url}
                        alt={packageDetails.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-emerald-500 flex items-center justify-center">
                        <div className="text-white text-center">
                          <div className="text-2xl font-bold mb-1">TOODUM</div>
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
                  </div>

                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2 mr-3">
                          {packageDetails.name}
                        </h2>
                        <span className="text-3xl font-bold text-orange-400">
                          ₦
                          {parseFloat(
                            packageDetails.price || 0
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Package Details
                      </h4>
                      <p className="text-gray-600 leading-relaxed font-normal text-xs">
                        {packageDetails.description ||
                          "Dive into our exhilarating activity package designed to provide you with a perfect blend of adventure and relaxation! Experience the thrill of archery as you aim for the bullseye, or test your skills at our state-of-the-art shooting ranges. For those who love the great outdoors, enjoy a scenic horse riding excursion through picturesque trails."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              {(packageDetails.benefits || packageDetails.features) && (
                <div className="bg-white rounded-xl p-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Benefits
                  </h3>
                  <ul className="space-y-2">
                    {(
                      packageDetails.benefits ||
                      packageDetails.features ||
                      []
                    ).map((benefit, index) => (
                      <li key={index} className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-3"></div>
                        <span className="text-gray-700">
                          {benefit.name || benefit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 ">
        <div className="flex items-center justify-end max-w-4xl">
          <button
            onClick={handleNext}
            disabled={isLoading || !packageDetails}
            className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
              isLoading || !packageDetails
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-orange-400 text-white  shadow-lg hover:shadow-xl"
            }`}
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin" size={18} />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <span>Next</span>
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
