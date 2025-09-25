// src/core/BookingEngine.js - FIXED Integration
import React, { useReducer, useMemo } from "react";
import AdapterFactory from "./AdapterFactory";
import { getAPIService } from "./UniversalAPIService";
import UniversalBookingContext, {
  universalBookingReducer,
  initialState,
  ActionTypes,
} from "./UniversalStateManager";

/**
 * Fixed Booking Engine Component with proper API integration
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

      // Enhanced config for entry business type
      const enhancedConfig = {
        ...config,
        locationId: config.locationId || config.location || 2, // Default to Enugu
        apiBaseUrl: config.apiBaseUrl || "http://127.0.0.1:8000/api",
      };

      return AdapterFactory.createAdapter(businessType, enhancedConfig);
    } catch (error) {
      console.error(`❌ Failed to create adapter for ${businessType}:`, error);

      // Try fallback to events adapter
      try {
        console.log("🔄 Attempting fallback to events adapter...");
        return AdapterFactory.createAdapter("events", config);
      } catch (fallbackError) {
        console.error("❌ Fallback adapter also failed:", fallbackError);
        throw new Error(
          `No valid adapter found for business type: ${businessType}`
        );
      }
    }
  }, [businessType, config]);

  // Create API service instance with proper configuration
  const apiService = useMemo(() => {
    const apiConfig = {
      apiBaseUrl: config.apiBaseUrl || "http://127.0.0.1:8000/api",
      timeout: config.timeout || 30000,
      headers: config.headers || {},
    };

    console.log("🔧 Creating API service with config:", apiConfig);

    const service = getAPIService(apiConfig);

    // Add entry-specific methods for backward compatibility
    if (businessType === "entry") {
      // Override generic methods to use entry-specific endpoints
      service.getSubItems = async (itemId) => {
        console.log(`🔍 Getting sub-items (entry tickets) for type: ${itemId}`);
        const locationId = config.locationId || config.location || 2;
        return service.getEntryTicketItems(itemId, locationId);
      };

      service.getItems = async (params = {}) => {
        console.log("🔍 Getting items (entry ticket types)");
        const locationId = config.locationId || config.location || 2;
        return service.getEntryTicketTypes(locationId);
      };

      service.createBooking = async (bookingData) => {
        console.log("🎫 Creating entry booking via API service");
        return service.createEntryBooking({
          ...bookingData,
          landmark_location_id: config.locationId || config.location || 2,
        });
      };
    }

    return service;
  }, [businessType, config]);

  // Prepare context value with all necessary methods
  const contextValue = useMemo(() => {
    // Helper methods
    const helpers = {
      // Step navigation
      setCurrentStep: (step) => {
        console.log(`📍 Setting current step: ${step}`);
        dispatch({ type: ActionTypes.SET_CURRENT_STEP, payload: step });
      },

      // Loading and error handling
      setLoading: (loading) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: loading });
      },

      setError: (error) => {
        console.error("❌ Setting error:", error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error });
      },

      clearError: () => {
        dispatch({ type: ActionTypes.CLEAR_ERROR });
      },

      // Widget control
      closeWidget: () => {
        console.log("🔐 Closing widget");
        dispatch({ type: ActionTypes.SET_WIDGET_OPEN, payload: false });
      },

      openWidget: () => {
        console.log("🔓 Opening widget");
        dispatch({ type: ActionTypes.SET_WIDGET_OPEN, payload: true });
      },

      // Selection management
      updateSelections: (selections) => {
        console.log("🛒 Updating selections:", selections);
        dispatch({ type: ActionTypes.UPDATE_SELECTIONS, payload: selections });
      },

      clearSelections: () => {
        console.log("🗑️ Clearing selections");
        dispatch({ type: ActionTypes.CLEAR_SELECTIONS });
      },

      // Customer info
      updateCustomerInfo: (info) => {
        console.log("👤 Updating customer info:", info);
        dispatch({ type: ActionTypes.UPDATE_CUSTOMER_INFO, payload: info });
      },

      // Payment handling
      setPaymentStatus: (status) => {
        console.log("💳 Setting payment status:", status);
        dispatch({ type: ActionTypes.SET_PAYMENT_STATUS, payload: status });
      },

      setPaymentUrl: (url) => {
        console.log("🔗 Setting payment URL:", url);
        dispatch({ type: ActionTypes.SET_PAYMENT_URL, payload: url });
      },

      // Booking reference
      setBookingReference: (reference) => {
        console.log("📝 Setting booking reference:", reference);
        dispatch({
          type: ActionTypes.SET_BOOKING_REFERENCE,
          payload: reference,
        });
      },

      // Reset functions
      resetBooking: () => {
        console.log("🔄 Resetting booking");
        dispatch({ type: ActionTypes.RESET_BOOKING });
      },

      resetAll: () => {
        console.log("🔄 Resetting all");
        dispatch({ type: ActionTypes.RESET_ALL });
      },

      // Utility functions
      getSelectedTickets: () => {
        if (!state.selections) return [];
        return Object.values(state.selections).filter(
          (selection) => selection.quantity > 0
        );
      },

      getTotalTickets: () => {
        if (!state.selections) return 0;
        return Object.values(state.selections).reduce(
          (total, selection) => total + (selection.quantity || 0),
          0
        );
      },

      formatCurrency: (amount) => {
        if (adapter && typeof adapter.formatCurrency === "function") {
          return adapter.formatCurrency(amount, state.config);
        }
        return new Intl.NumberFormat("en-NG", {
          style: "currency",
          currency: "NGN",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(amount);
      },

      // Labels and configuration
      getLabels: () => adapter.getLabels(),

      // Debug info
      getDebugInfo: () => ({
        businessType,
        currentStep: state.currentStep,
        hasAdapter: !!adapter,
        hasApiService: !!apiService,
        isLoading: state.loading,
        hasError: !!state.error,
        totalAmount: state.totalAmount,
        totalTickets: helpers.getTotalTickets(),
        paymentStatus: state.paymentStatus,
        bookingReference: state.bookingReference,
        config: {
          locationId: config.locationId || config.location,
          apiBaseUrl: config.apiBaseUrl,
        },
      }),
    };

    const contextValue = {
      state,
      dispatch,
      adapter,
      apiService,
      currentStep: state.currentStep,
      locationId: config.locationId || config.location,
      ...helpers,
    };

    console.log("🎯 BookingEngine context value prepared:", {
      hasAdapter: !!adapter,
      hasApiService: !!apiService,
      currentStep: state.currentStep,
      isLoading: state.loading,
      businessType,
    });

    return contextValue;
  }, [state, adapter, apiService, businessType, config]);

  return (
    <UniversalBookingContext.Provider value={contextValue}>
      {children}
    </UniversalBookingContext.Provider>
  );
};

export default BookingEngine;
