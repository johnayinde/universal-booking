import { createContext, useContext, useReducer } from "react";

// Action Types
export const ActionTypes = {
  // Configuration
  SET_CONFIG: "SET_CONFIG",
  SET_BUSINESS_TYPE: "SET_BUSINESS_TYPE",

  // Widget State
  SET_WIDGET_OPEN: "SET_WIDGET_OPEN",
  SET_CURRENT_STEP: "SET_CURRENT_STEP",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",

  // Data
  SET_ITEMS: "SET_ITEMS",
  SET_CATEGORIES: "SET_CATEGORIES",
  SET_SELECTED_ITEM: "SET_SELECTED_ITEM",
  SET_SUB_ITEMS: "SET_SUB_ITEMS",

  // Booking
  UPDATE_SELECTIONS: "UPDATE_SELECTIONS",
  UPDATE_CUSTOMER_INFO: "UPDATE_CUSTOMER_INFO",
  SET_BOOKING_REFERENCE: "SET_BOOKING_REFERENCE",
  SET_PAYMENT_STATUS: "SET_PAYMENT_STATUS",
  CALCULATE_TOTAL: "CALCULATE_TOTAL",

  // Reset
  RESET_BOOKING: "RESET_BOOKING",
  RESET_ALL: "RESET_ALL",
};

// Initial State
export const initialState = {
  // Configuration
  config: {
    businessType: "events",
    theme: "light",
    apiBaseUrl: "",
    branding: {
      primaryColor: "#3b82f6",
      logoUrl: "",
      companyName: "Universal Booking",
    },
  },

  // Widget State
  isWidgetOpen: false,
  currentStep: "list",
  loading: false,
  error: null,

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
  },
  bookingReference: null,
  totalAmount: 0,
  paymentStatus: "pending",
};

// Reducer
export const universalBookingReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_CONFIG:
      return {
        ...state,
        config: { ...state.config, ...action.payload },
      };

    case ActionTypes.SET_BUSINESS_TYPE:
      return {
        ...state,
        config: { ...state.config, businessType: action.payload },
        // Reset booking-specific data when business type changes
        items: [],
        selectedItem: null,
        subItems: [],
        selections: {},
        currentStep: "list",
      };

    case ActionTypes.SET_WIDGET_OPEN:
      return {
        ...state,
        isWidgetOpen: action.payload,
        // Reset to first step when closing
        currentStep: action.payload ? state.currentStep : "list",
      };

    case ActionTypes.SET_CURRENT_STEP:
      return {
        ...state,
        currentStep: action.payload,
        error: null,
      };

    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case ActionTypes.SET_ITEMS:
      return {
        ...state,
        items: action.payload,
      };

    case ActionTypes.SET_CATEGORIES:
      return {
        ...state,
        categories: action.payload,
      };

    case ActionTypes.SET_SELECTED_ITEM:
      return {
        ...state,
        selectedItem: action.payload,
        subItems: [],
        selections: {},
        currentStep: "details",
      };

    case ActionTypes.SET_SUB_ITEMS:
      return {
        ...state,
        subItems: action.payload,
      };

    case ActionTypes.UPDATE_SELECTIONS:
      return {
        ...state,
        selections: { ...state.selections, ...action.payload },
      };

    case ActionTypes.UPDATE_CUSTOMER_INFO:
      return {
        ...state,
        customerInfo: { ...state.customerInfo, ...action.payload },
      };

    case ActionTypes.SET_BOOKING_REFERENCE:
      return {
        ...state,
        bookingReference: action.payload,
      };

    case ActionTypes.SET_PAYMENT_STATUS:
      return {
        ...state,
        paymentStatus: action.payload,
      };

    case ActionTypes.CALCULATE_TOTAL:
      // This will be business-type specific calculation
      const total = calculateTotal(state.selections, state.selectedItem);
      return {
        ...state,
        totalAmount: total,
      };

    case ActionTypes.RESET_BOOKING:
      return {
        ...state,
        selectedItem: null,
        subItems: [],
        selections: {},
        customerInfo: initialState.customerInfo,
        bookingReference: null,
        totalAmount: 0,
        paymentStatus: "pending",
        currentStep: "list",
        error: null,
      };

    case ActionTypes.RESET_ALL:
      return {
        ...initialState,
        config: state.config, // Keep configuration
      };

    default:
      return state;
  }
};

// Helper function to calculate total (business-type agnostic)
const calculateTotal = (selections, selectedItem) => {
  if (!selections || !selectedItem) return 0;

  // This is a generic calculation - specific business adapters can override
  let total = 0;

  Object.values(selections).forEach((selection) => {
    if (selection.quantity && selection.price) {
      total += selection.quantity * selection.price;
    }
  });

  return total;
};

// Context
export const UniversalBookingContext = createContext();

// Hook to use the context
export const useUniversalBooking = () => {
  const context = useContext(UniversalBookingContext);
  if (!context) {
    throw new Error(
      "useUniversalBooking must be used within UniversalBookingProvider"
    );
  }
  return context;
};

export default UniversalBookingContext;
