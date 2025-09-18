import React, { useReducer, useMemo } from "react";
import AdapterFactory from "./AdapterFactory";
import UniversalAPIService from "./UniversalAPIService";
import UniversalBookingContext, {
  universalBookingReducer,
  initialState,
  ActionTypes,
} from "./UniversalStateManager";

/**
 * Main Booking Engine Component
 * Orchestrates the entire booking flow using business adapters
 */
const BookingEngine = ({ businessType = "events", config = {}, children }) => {
  // Initialize state with reducer
  const [state, dispatch] = useReducer(universalBookingReducer, {
    ...initialState,
    config: { ...initialState.config, ...config, businessType },
  });

  // Create adapter and API service based on business type
  const adapter = useMemo(() => {
    try {
      return AdapterFactory.create(businessType, config);
    } catch (error) {
      console.error(`Failed to create adapter for ${businessType}:`, error);
      // Fallback to events adapter
      return AdapterFactory.create("events", config);
    }
  }, [businessType, config]);

  const apiService = useMemo(() => {
    const baseUrl = config.apiBaseUrl || "http://127.0.0.1:8000/api";
    return new UniversalAPIService(adapter, baseUrl);
  }, [adapter, config.apiBaseUrl]);

  // Enhanced dispatch with adapter-specific logic
  const enhancedDispatch = (action) => {
    // Pre-process certain actions with adapter-specific logic
    switch (action.type) {
      case ActionTypes.UPDATE_SELECTIONS:
        // Use adapter's calculation method if available
        const updatedState = universalBookingReducer(state, action);
        if (
          adapter.calculateTotal &&
          typeof adapter.calculateTotal === "function"
        ) {
          const newTotal = adapter.calculateTotal(updatedState.selections);
          dispatch({ type: ActionTypes.SET_LOADING, payload: false }); // Prevent infinite loops
          return dispatch({
            type: ActionTypes.CALCULATE_TOTAL,
            payload: newTotal,
          });
        }
        break;

      case ActionTypes.SET_BUSINESS_TYPE:
        // Clear adapter-specific data when switching business types
        dispatch({ type: ActionTypes.RESET_BOOKING });
        break;
    }

    return dispatch(action);
  };

  // Context value with all necessary data and functions
  const contextValue = {
    state,
    dispatch: enhancedDispatch,
    adapter,
    apiService,
    businessType,

    // Convenience functions
    isLoading: state.loading,
    hasError: !!state.error,
    currentStep: state.currentStep,

    // Business-specific helpers
    getLabels: () => adapter.getLabels(),
    getBookingSteps: () => adapter.getBookingSteps(),
    validateBooking: (bookingData) => adapter.validateBookingData(bookingData),

    // State helpers
    getTotalAmount: () => state.totalAmount,
    getSelectedItem: () => state.selectedItem,
    getSelections: () => state.selections,
    getCustomerInfo: () => state.customerInfo,

    // Actions helpers
    setLoading: (loading) =>
      enhancedDispatch({
        type: ActionTypes.SET_LOADING,
        payload: loading,
      }),

    setError: (error) =>
      enhancedDispatch({
        type: ActionTypes.SET_ERROR,
        payload: error,
      }),

    clearError: () =>
      enhancedDispatch({
        type: ActionTypes.CLEAR_ERROR,
      }),

    setCurrentStep: (step) =>
      enhancedDispatch({
        type: ActionTypes.SET_CURRENT_STEP,
        payload: step,
      }),

    selectItem: (item) =>
      enhancedDispatch({
        type: ActionTypes.SET_SELECTED_ITEM,
        payload: item,
      }),

    updateSelections: (selections) =>
      enhancedDispatch({
        type: ActionTypes.UPDATE_SELECTIONS,
        payload: selections,
      }),

    updateCustomerInfo: (info) =>
      enhancedDispatch({
        type: ActionTypes.UPDATE_CUSTOMER_INFO,
        payload: info,
      }),

    resetBooking: () =>
      enhancedDispatch({
        type: ActionTypes.RESET_BOOKING,
      }),

    // Widget control
    openWidget: () =>
      enhancedDispatch({
        type: ActionTypes.SET_WIDGET_OPEN,
        payload: true,
      }),

    closeWidget: () =>
      enhancedDispatch({
        type: ActionTypes.SET_WIDGET_OPEN,
        payload: false,
      }),

    toggleWidget: () =>
      enhancedDispatch({
        type: ActionTypes.SET_WIDGET_OPEN,
        payload: !state.isWidgetOpen,
      }),
  };

  return (
    <UniversalBookingContext.Provider value={contextValue}>
      {children}
    </UniversalBookingContext.Provider>
  );
};

export default BookingEngine;
