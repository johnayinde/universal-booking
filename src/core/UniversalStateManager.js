// src/core/UniversalStateManager.js - Enhanced with Payment Support
import React, { createContext, useContext } from "react";

// Action Types
export const ActionTypes = {
  // Loading and errors
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",

  // Widget control
  SET_WIDGET_OPEN: "SET_WIDGET_OPEN",
  SET_CURRENT_STEP: "SET_CURRENT_STEP",

  // Data management
  SET_ITEMS: "SET_ITEMS",
  SET_CATEGORIES: "SET_CATEGORIES",
  SET_SELECTED_ITEM: "SET_SELECTED_ITEM",
  SET_SUB_ITEMS: "SET_SUB_ITEMS",

  // Booking and selections
  UPDATE_SELECTIONS: "UPDATE_SELECTIONS",
  CLEAR_SELECTIONS: "CLEAR_SELECTIONS",
  UPDATE_CUSTOMER_INFO: "UPDATE_CUSTOMER_INFO",
  SET_BOOKING_REFERENCE: "SET_BOOKING_REFERENCE",
  CALCULATE_TOTAL: "CALCULATE_TOTAL",

  // Payment management
  SET_PAYMENT_STATUS: "SET_PAYMENT_STATUS",
  SET_PAYMENT_URL: "SET_PAYMENT_URL",
  SET_PAYMENT_REFERENCE: "SET_PAYMENT_REFERENCE",
  UPDATE_PAYMENT_INFO: "UPDATE_PAYMENT_INFO",

  // Reset actions
  RESET_BOOKING: "RESET_BOOKING",
  RESET_ALL: "RESET_ALL",

  //furniture-specific actions:
  SET_SELECTED_FURNITURE: "SET_SELECTED_FURNITURE",
  SET_SELECTED_SESSION: "SET_SELECTED_SESSION",
  UPDATE_BOOKING_DATA: "UPDATE_BOOKING_DATA",
  SET_FURNITURE_LOADING: "SET_FURNITURE_LOADING",

  // ADD THESE GROUP-SPECIFIC ACTIONS:
  SET_SELECTED_DATE: "SET_SELECTED_DATE",
  UPDATE_SELECTION: "UPDATE_SELECTION",
  SET_PACKAGE_SIZE: "SET_PACKAGE_SIZE",
  SET_PACKAGE_OPTION: "SET_PACKAGE_OPTION",
  SET_PACKAGE_DETAILS: "SET_PACKAGE_DETAILS",
};

// Payment Status Constants
export const PaymentStatus = {
  PENDING: "pending",
  PROCESSING: "processing",
  SUCCESS: "success",
  FAILED: "failed",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
};

// Initial state
export const initialState = {
  // Widget state
  isWidgetOpen: false,
  currentStep: "list",
  loading: false,
  error: null,

  // Configuration
  config: {
    businessType: "",
    theme: "light",
    apiBaseUrl: "",
    branding: {
      primaryColor: "#3b82f6",
      logoUrl: "",
      companyName: "Universal Booking",
    },
    autoShow: false,
    position: "bottom-right",
  },

  // Data
  items: [],
  categories: [],
  selectedItem: null,
  subItems: [],

  // Booking
  selections: {},
  customerInfo: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialRequests: "",
    agreeToTerms: false,
    agreeToMarketing: false,
  },
  totalAmount: 0,
  bookingReference: null,

  // Payment
  paymentStatus: PaymentStatus.PENDING,
  paymentUrl: null,
  paymentReference: null,
  paymentInfo: {
    method: "paystack",
    currency: "NGN",
    processingFee: 0,
    metadata: {},
  },

  // furniture-specific fields:
  selectedFurniture: null,
  selectedSession: null,
  bookingData: {
    date: "",
    furnitureId: null,
    sessionId: null,
    totalAmount: 0,
  },
  furnitureLoading: false,

  // GROUP-SPECIFIC FIELDS:
  selectedDate: null,
  selection: {},
};

// Enhanced reducer with payment support
export const universalBookingReducer = (state, action) => {
  console.log("🔄 State reducer action:", action.type, action.payload);

  switch (action.type) {
    // Loading and errors
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };

    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };

    // Widget control
    case ActionTypes.SET_WIDGET_OPEN:
      return { ...state, isWidgetOpen: action.payload };

    case ActionTypes.SET_CURRENT_STEP:
      return { ...state, currentStep: action.payload, error: null };

    // Data management
    case ActionTypes.SET_ITEMS:
      return { ...state, items: action.payload };

    case ActionTypes.SET_CATEGORIES:
      return { ...state, categories: action.payload };

    case ActionTypes.SET_SELECTED_ITEM:
      return {
        ...state,
        selectedItem: action.payload,
        // Clear selections when changing items
        selections: {},
        totalAmount: 0,
      };

    case ActionTypes.SET_SUB_ITEMS:
      return { ...state, subItems: action.payload };

    // Booking and selections
    case ActionTypes.UPDATE_SELECTIONS:
      const newSelections = { ...action.payload };
      const newTotal = calculateTotal(newSelections, state.selectedItem);
      console.log("🛒 Updating selections:", newSelections, "Total:", newTotal);
      return {
        ...state,
        selections: newSelections,
        totalAmount: newTotal,
      };

    case ActionTypes.CLEAR_SELECTIONS:
      return {
        ...state,
        selections: {},
        totalAmount: 0,
      };

    case ActionTypes.UPDATE_CUSTOMER_INFO:
      return {
        ...state,
        customerInfo: { ...state.customerInfo, ...action.payload },
      };

    case ActionTypes.SET_BOOKING_REFERENCE:
      return { ...state, bookingReference: action.payload };

    case ActionTypes.CALCULATE_TOTAL:
      const calculatedTotal = calculateTotal(
        state.selections,
        state.selectedItem
      );
      return { ...state, totalAmount: calculatedTotal };

    // Payment management
    case ActionTypes.SET_PAYMENT_STATUS:
      return { ...state, paymentStatus: action.payload };

    case ActionTypes.SET_PAYMENT_URL:
      return { ...state, paymentUrl: action.payload };

    case ActionTypes.SET_PAYMENT_REFERENCE:
      return { ...state, paymentReference: action.payload };

    case ActionTypes.UPDATE_PAYMENT_INFO:
      return {
        ...state,
        paymentInfo: { ...state.paymentInfo, ...action.payload },
      };

    // Add these NEW furniture-specific cases:
    case ActionTypes.SET_SELECTED_FURNITURE:
      return {
        ...state,
        selectedFurniture: action.payload,
      };

    case ActionTypes.SET_SELECTED_SESSION:
      return {
        ...state,
        selectedSession: action.payload,
      };

    case ActionTypes.UPDATE_BOOKING_DATA:
      return {
        ...state,
        bookingData: {
          ...state.bookingData,
          ...action.payload,
        },
      };

    case ActionTypes.SET_FURNITURE_LOADING:
      return {
        ...state,
        furnitureLoading: action.payload,
      };

    // Package cases

    // ADD THESE NEW CASES:
    case ActionTypes.SET_SELECTED_DATE:
      return { ...state, selectedDate: action.payload };

    case ActionTypes.UPDATE_SELECTION:
      return {
        ...state,
        selection: { ...state.selection, ...action.payload },
      };

    case ActionTypes.SET_PACKAGE_SIZE:
      return {
        ...state,
        selection: { ...state.selection, packageSize: action.payload },
      };

    case ActionTypes.SET_PACKAGE_OPTION:
      return {
        ...state,
        selection: { ...state.selection, packageOption: action.payload },
      };

    case ActionTypes.SET_PACKAGE_DETAILS:
      return {
        ...state,
        selection: { ...state.selection, packageDetails: action.payload },
      };

    // Reset actions
    case ActionTypes.RESET_BOOKING:
      return {
        ...state,
        selectedItem: null,
        subItems: [],
        selections: {},
        customerInfo: initialState.customerInfo,
        bookingReference: null,
        totalAmount: 0,
        paymentStatus: PaymentStatus.PENDING,
        paymentUrl: null,
        paymentReference: null,

        currentStep:
          state.config?.businessType === "furniture"
            ? "dateSelection"
            : state.config?.businessType === "group"
            ? "list"
            : "list",
        error: null,
        //
        isOpen: state.isOpen,
        businessType: state.businessType,
        config: state.config,
        //

        // Clear furniture-specific data:
        selectedFurniture: null,
        selectedSession: null,
        bookingData: initialState.bookingData,
      };

    case ActionTypes.RESET_ALL:
      return { ...initialState, config: state.config };

    default:
      return state;
  }
};

// Helper function to calculate total amount
const calculateTotal = (selections, selectedItem) => {
  if (!selections || !selectedItem) return 0;

  let total = 0;
  Object.values(selections).forEach((selection) => {
    if (selection.quantity && selection.price) {
      total += selection.quantity * selection.price;
    }
  });

  return total;
};

// Context creation
const UniversalBookingContext = createContext();

// Enhanced context provider
export const UniversalBookingProvider = ({ children, value }) => {
  const enhancedValue = {
    ...value,

    // Enhanced helper functions
    setCurrentStep: (step) => {
      value.dispatch({ type: ActionTypes.SET_CURRENT_STEP, payload: step });
    },

    setLoading: (loading) => {
      value.dispatch({ type: ActionTypes.SET_LOADING, payload: loading });
    },

    setError: (error) => {
      value.dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    },

    clearError: () => {
      value.dispatch({ type: ActionTypes.CLEAR_ERROR });
    },

    closeWidget: () => {
      value.dispatch({ type: ActionTypes.SET_WIDGET_OPEN, payload: false });
    },

    openWidget: () => {
      value.dispatch({ type: ActionTypes.SET_WIDGET_OPEN, payload: true });
    },

    // Selection helpers
    updateSelections: (selections) => {
      value.dispatch({
        type: ActionTypes.UPDATE_SELECTIONS,
        payload: selections,
      });
    },

    clearSelections: () => {
      value.dispatch({ type: ActionTypes.CLEAR_SELECTIONS });
    },

    // Customer info helpers
    updateCustomerInfo: (info) => {
      value.dispatch({ type: ActionTypes.UPDATE_CUSTOMER_INFO, payload: info });
    },

    // Payment helpers
    setPaymentStatus: (status) => {
      value.dispatch({ type: ActionTypes.SET_PAYMENT_STATUS, payload: status });
    },

    setPaymentUrl: (url) => {
      value.dispatch({ type: ActionTypes.SET_PAYMENT_URL, payload: url });
    },

    updatePaymentInfo: (info) => {
      value.dispatch({ type: ActionTypes.UPDATE_PAYMENT_INFO, payload: info });
    },

    // Booking helpers
    resetBooking: () => {
      value.dispatch({ type: ActionTypes.RESET_BOOKING });
    },

    resetAll: () => {
      value.dispatch({ type: ActionTypes.RESET_ALL });
    },

    // Enhanced getters
    getSelectedTickets: () => {
      if (!value.state.selections) return [];
      return Object.values(value.state.selections).filter(
        (selection) => selection.quantity > 0
      );
    },

    getTotalTickets: () => {
      if (!value.state.selections) return 0;
      return Object.values(value.state.selections).reduce(
        (total, selection) => total + (selection.quantity || 0),
        0
      );
    },

    getTotalAmount: () => {
      return value.state.totalAmount || 0;
    },

    isBookingValid: () => {
      const { selections, customerInfo } = value.state;
      const hasTickets = Object.values(selections).some((s) => s.quantity > 0);
      const hasRequiredInfo =
        customerInfo.firstName &&
        customerInfo.lastName &&
        customerInfo.email &&
        customerInfo.phone &&
        customerInfo.agreeToTerms;
      return hasTickets && hasRequiredInfo;
    },

    // Payment validation
    canProceedToPayment: () => {
      return value.isBookingValid() && value.state.totalAmount > 0;
    },

    // Format currency helper
    formatCurrency: (amount) => {
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    },

    // Debug helpers
    getDebugInfo: () => {
      return {
        currentStep: value.state.currentStep,
        hasAdapter: !!value.adapter,
        hasApiService: !!value.apiService,
        isLoading: value.state.loading,
        hasError: !!value.state.error,
        totalAmount: value.state.totalAmount,
        totalTickets: value.getTotalTickets(),
        paymentStatus: value.state.paymentStatus,
        bookingReference: value.state.bookingReference,
      };
    },
  };

  return (
    <UniversalBookingContext.Provider value={enhancedValue}>
      {children}
    </UniversalBookingContext.Provider>
  );
};

// Enhanced hook with better error handling
export const useUniversalBooking = () => {
  const context = useContext(UniversalBookingContext);

  if (!context) {
    throw new Error(
      "useUniversalBooking must be used within a UniversalBookingProvider"
    );
  }

  return context;
};

// Export context for advanced usage
export default UniversalBookingContext;
