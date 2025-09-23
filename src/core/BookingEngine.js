// src/core/BookingEngine.js - FIXED for singleton UniversalAPIService
import React, { useReducer, useMemo } from "react";
import AdapterFactory from "./AdapterFactory";
import UniversalAPIService from "./UniversalAPIService"; // This is now a singleton
import UniversalBookingContext, {
  universalBookingReducer,
  initialState,
  ActionTypes,
} from "./UniversalStateManager";

/**
 * Main Booking Engine Component
 * Orchestrates the entire booking flow using business adapters
 */
const BookingEngine = ({ businessType = "", config = {}, children }) => {
  console.log("🚀 BookingEngine initialized:", { businessType, config });

  // Initialize state with reducer
  const [state, dispatch] = useReducer(universalBookingReducer, {
    ...initialState,
    config: { ...initialState.config, ...config, businessType },
  });

  // Create adapter based on business type
  const adapter = useMemo(() => {
    try {
      console.log(`🔧 Creating adapter for business type: ${businessType}`);
      return AdapterFactory.createAdapter(businessType, config);
    } catch (error) {
      console.error(`❌ Failed to create adapter for ${businessType}:`, error);
      // Fallback to events adapter if entry fails
      try {
        console.log("🔄 Attempting fallback to events adapter...");
        return AdapterFactory.createAdapter("events", config);
      } catch (fallbackError) {
        console.error("❌ Fallback adapter also failed:", fallbackError);
        throw new Error(`No valid adapter found for ${businessType}`);
      }
    }
  }, [businessType, config]);

  // FIXED: Use the singleton UniversalAPIService directly
  const apiService = useMemo(() => {
    try {
      console.log("🌐 Using singleton UniversalAPIService...");

      // The UniversalAPIService is already instantiated as a singleton
      // We just need to configure it for this session if needed
      if (config.apiBaseUrl) {
        console.log(`📍 API Base URL: ${config.apiBaseUrl}`);
      }

      console.log("✅ UniversalAPIService ready");
      return UniversalAPIService; // Return the singleton instance
    } catch (error) {
      console.error("❌ Failed to access UniversalAPIService:", error);
      return null;
    }
  }, [config.apiBaseUrl]); // FIXED: Only depend on config changes

  // Enhanced dispatch with adapter-specific logic
  const enhancedDispatch = (action) => {
    console.log("📨 Dispatching action:", action.type);

    // Pre-process certain actions with adapter-specific logic
    switch (action.type) {
      case ActionTypes.UPDATE_SELECTIONS:
        // Use adapter's calculation method if available
        const updatedState = universalBookingReducer(state, action);
        if (
          adapter &&
          adapter.calculateTotal &&
          typeof adapter.calculateTotal === "function"
        ) {
          try {
            const newTotal = adapter.calculateTotal(
              updatedState.selections,
              updatedState.items
            );
            console.log("💰 Calculated total:", newTotal);
            // Prevent infinite loops
            dispatch({ type: ActionTypes.SET_LOADING, payload: false });
            return dispatch({
              type: ActionTypes.CALCULATE_TOTAL,
              payload: newTotal,
            });
          } catch (error) {
            console.error("❌ Error calculating total:", error);
          }
        }
        break;

      case ActionTypes.SET_BUSINESS_TYPE:
        // Clear adapter-specific data when switching business types
        console.log("🔄 Resetting booking data for business type change");
        dispatch({ type: ActionTypes.RESET_BOOKING });
        break;
    }

    return dispatch(action);
  };

  // Helper functions
  const setCurrentStep = (step) => {
    console.log(`📍 Setting current step: ${step}`);
    dispatch({ type: ActionTypes.SET_CURRENT_STEP, payload: step });
  };

  const setError = (error) => {
    console.log(`❌ Setting error: ${error}`);
    dispatch({ type: ActionTypes.SET_ERROR, payload: error });
  };

  const setLoading = (loading) => {
    console.log(`⏳ Setting loading: ${loading}`);
    dispatch({ type: ActionTypes.SET_LOADING, payload: loading });
  };

  // Context value with all necessary data and functions
  const contextValue = {
    state,
    dispatch: enhancedDispatch,
    adapter,
    apiService,
    businessType,

    // Helper functions
    setCurrentStep,
    setError,
    setLoading,

    // Convenience properties
    isLoading: state.loading,
    hasError: !!state.error,
    currentStep: state.currentStep,
    totalAmount: state.totalAmount,

    // State shortcuts
    items: state.items,
    categories: state.categories,
    selectedItem: state.selectedItem,
    subItems: state.subItems,
    selections: state.selections,
    customerInfo: state.customerInfo,
    bookingReference: state.bookingReference,
  };

  console.log("🎯 BookingEngine context value prepared:", {
    hasAdapter: !!adapter,
    hasApiService: !!apiService,
    currentStep: state.currentStep,
    isLoading: state.loading,
    businessType,
  });

  return (
    <UniversalBookingContext.Provider value={contextValue}>
      {children}
    </UniversalBookingContext.Provider>
  );
};

export default BookingEngine;
