// src/business-types/entry/components/EntryTicketList.jsx - FIXED with Working API
import React, { useState, useEffect } from "react";
import {
  Ticket,
  Plus,
  Minus,
  AlertCircle,
  RefreshCw,
  Loader,
  ArrowLeft,
} from "lucide-react";
import { useUniversalBooking } from "../../../core/UniversalStateManager";
import { ActionTypes } from "../../../core/UniversalStateManager";

const EntryTicketList = ({ apiService, adapter }) => {
  const { state, dispatch } = useUniversalBooking();

  // Component state
  const [ticketTypes, setTicketTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [selections, setSelections] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("none"); // "types", "items", "none"
  const [apiError, setApiError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedDate, setSelectedDate] = useState(
    state.bookingData?.date || ""
  );

  const toInputDate = (d) => {
    if (!d) return "";
    const dt = d instanceof Date ? d : new Date(d);
    const tz = dt.getTimezoneOffset() * 60000;
    return new Date(dt - tz).toISOString().slice(0, 10);
  };

  const todayInput = () => toInputDate(new Date());

  const plusMonthsInput = (m = 3) => {
    const d = new Date();
    d.setMonth(d.getMonth() + m);
    return toInputDate(d);
  };

  // Load ticket types on mount
  useEffect(() => {
    loadTicketTypes();
  }, []);

  // Update total when selections change
  useEffect(() => {
    const total = calculateTotal(selections, tickets);
    setTotalAmount(total);

    dispatch({
      type: ActionTypes.CALCULATE_TOTAL,
    });
  }, [selections, tickets]);

  /**
   * Load ticket types with robust error handling
   */
  const loadTicketTypes = async () => {
    setIsLoading(true);
    setLoadingStep("types");
    setApiError(null);

    try {
      let types = [];

      // Use adapter method if available
      if (adapter && typeof adapter.fetchTicketTypes === "function") {
        console.log("🔧 Using adapter.fetchTicketTypes...");
        types = await adapter.fetchTicketTypes();
      } else {
        console.log("❌ No adapter.fetchTicketTypes method found");
        throw new Error("Adapter method not available");
      }

      setTicketTypes(types);
      setRetryCount(0);

      // Auto-select first active type if available
      const activeTypes = types.filter((t) => t.is_active);
      if (activeTypes.length === 1) {
        await handleTypeSelect(activeTypes[0]);
      } else if (activeTypes.length > 0) {
      } else {
        setApiError("No active ticket types are currently available.");
      }
    } catch (error) {
      console.error("❌ Error loading ticket types:", error);
      setApiError(`Failed to load ticket types: ${error.message}`);
      setRetryCount((prev) => prev + 1);

      // Use fallback data after retries
      if (retryCount >= 2) {
        const fallbackTypes = [
          {
            id: 1,
            name: "Regular Entry",
            description: "Standard entry type (Demo Mode)",
            features: { fast_track: false },
            is_active: true,
          },
        ];
        setTicketTypes(fallbackTypes);
        await handleTypeSelect(fallbackTypes[0]);
      }
    } finally {
      setIsLoading(false);
      setLoadingStep("none");
    }
  };

  /**
   * Handle ticket type selection
   */
  const handleTypeSelect = async (type) => {
    if (selectedType?.id === type.id) {
      return;
    }

    setSelectedType(type);
    setTickets([]);
    setSelections({});
    setTotalAmount(0);

    // Update global state
    dispatch({
      type: ActionTypes.SET_SELECTED_ITEM,
      payload: {
        id: type.id,
        name: type.name,
        description: type.description,
        type: "entry_type",
      },
    });

    await loadTicketItems(type.id);
  };

  /**
   * Load ticket items for selected type
   */
  const loadTicketItems = async (typeId) => {
    setIsLoading(true);
    setLoadingStep("items");
    setApiError(null);

    try {
      console.log(`🔄 Loading ticket items for type ${typeId}...`);

      let items = [];

      // Use adapter method if available
      if (adapter && typeof adapter.fetchTicketItems === "function") {
        items = await adapter.fetchTicketItems(typeId);
      } else {
        throw new Error("Adapter method not available");
      }

      setTickets(items);

      // Update global state with ticket items
      dispatch({
        type: ActionTypes.SET_SUB_ITEMS,
        payload: items,
      });
    } catch (error) {
      setApiError(`Failed to load tickets: ${error.message}`);

      // Use fallback data
      const fallbackItems = [
        {
          id: 1,
          name: "Adult Ticket",
          description: "Standard entry for adults (Demo)",
          price: 3000,
          max_per_guest: 10,
          available: true,
          type: "Regular",
          category: "Individual",
        },
        {
          id: 2,
          name: "Child Ticket",
          description: "Entry for children 5-12 years (Demo)",
          price: 2000,
          max_per_guest: 5,
          available: true,
          type: "Regular",
          category: "Individual",
        },
      ];

      setTickets(fallbackItems);
      dispatch({
        type: ActionTypes.SET_SUB_ITEMS,
        payload: fallbackItems,
      });
    } finally {
      setIsLoading(false);
      setLoadingStep("none");
    }
  };

  /**
   * Calculate total amount
   */
  const calculateTotal = (selections, tickets) => {
    if (adapter && typeof adapter.calculateTotal === "function") {
      return adapter.calculateTotal(selections, tickets);
    }

    // Fallback calculation
    let total = 0;
    Object.keys(selections).forEach((ticketId) => {
      const quantity = selections[ticketId];
      const ticket = tickets.find((t) => t.id.toString() === ticketId);
      if (ticket && quantity > 0) {
        total += parseFloat(ticket.price || 0) * quantity;
      }
    });
    return total;
  };

  /**
   * Update ticket quantity
   */
  const updateQuantity = (ticketId, change) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    const currentQty = selections[ticketId] || 0;
    const newQty = Math.max(
      0,
      Math.min(ticket.max_per_guest || 10, currentQty + change)
    );

    const newSelections = { ...selections };

    if (newQty === 0) {
      delete newSelections[ticketId];
    } else {
      newSelections[ticketId] = newQty;
    }

    setSelections(newSelections);

    // FIX: Update global state with proper selection objects
    const globalSelections = {};
    Object.keys(newSelections).forEach((id) => {
      const qty = newSelections[id];
      const ticketData = tickets.find((t) => t.id.toString() === id.toString());
      if (ticketData && qty > 0) {
        globalSelections[id] = {
          id: ticketData.id,
          name: ticketData.name,
          price: ticketData.price,
          quantity: qty,
          type: ticketData.type,
          description: ticketData.description,
        };
      }
    });

    dispatch({
      type: ActionTypes.UPDATE_SELECTIONS,
      payload: globalSelections,
    });
  };

  /**
   * Check if can proceed to next step
   */
  const canProceed = () => {
    const hasLocalSelections = Object.values(selections).some((qty) => qty > 0);
    const hasGlobalSelections =
      state.selections &&
      Object.values(state.selections).some((sel) => sel && sel.quantity > 0);

    console.log("🔍 Can proceed check:", {
      hasLocalSelections,
      hasGlobalSelections,
      isLoading,
    });

    return (hasLocalSelections || hasGlobalSelections) && !isLoading;
  };

  /**
   * Handle next step
   */
  const handleNext = () => {
    if (!canProceed()) {
      console.warn("Cannot proceed - no tickets selected");
      return;
    }

    console.log("▶️ Proceeding to next step with selections:", selections);
    console.log("📊 Global state selections:", state.selections);

    dispatch({
      type: ActionTypes.SET_CURRENT_STEP,
      payload: "booking",
    });
  };

  const handleBack = () => {
    // Clear the selected business type
    sessionStorage.removeItem("selectedBusinessType");

    // Destroy current widget
    if (window.UniversalBookingWidget) {
      window.UniversalBookingWidget.destroyAll?.();
    }

    // Reinitialize widget without business type (shows bookables list)
    setTimeout(() => {
      const widget = window.UniversalBookingWidget.init({
        businessType: null, // This shows the bookables list
        locationId: state.config?.locationId || 1,
        apiBaseUrl: state.config?.apiBaseUrl,
        branding: state.config?.branding,
        autoShow: true,
      });
      widget.open();
    }, 100);
  };
  /**
   * Retry API call
   */
  const retryApiCall = () => {
    console.log("🔄 Retrying API call...");
    setRetryCount(0);
    if (selectedType) {
      loadTicketItems(selectedType.id);
    } else {
      loadTicketTypes();
    }
  };

  /**
   * Format currency
   */
  const formatCurrency = (amount) => {
    if (adapter && typeof adapter.formatCurrency === "function") {
      return adapter.formatCurrency(amount, state.config);
    }
    return `₦${parseFloat(amount).toLocaleString()}`;
  };

  // Render loading state
  if (isLoading && loadingStep === "types") {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4" size={32} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Loading Ticket Types
          </h3>
          <p className="text-gray-600">
            Please wait while we fetch available options...
          </p>
        </div>
      </div>
    );
  }

  // Render error state with retry
  if (apiError && ticketTypes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-4">
          <AlertCircle size={48} className="mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Unable to Load Ticket Types
        </h3>
        <p className="text-gray-600 mb-4">{apiError}</p>
        <button
          onClick={retryApiCall}
          className="inline-flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          <RefreshCw size={16} />
          <span>Try Again</span>
        </button>
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
          <span>Back to Bookables</span>
        </button>

        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Select Ticket Type
          </h1>
          <p className="text-gray-600">
            Choose your entry type and quantity for Nike Lake Resort
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* API Error Display */}
        {apiError && ticketTypes.length > 0 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle
                className="text-yellow-400 mr-2 flex-shrink-0"
                size={20}
              />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  API Warning
                </h3>
                <p className="mt-1 text-sm text-yellow-700">{apiError}</p>
                <p className="mt-1 text-xs text-yellow-600">
                  Using fallback data for demonstration
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Date Picker - ADD THIS SECTION */}
        <div className="max-w-4xl mb-6">
          <div className="bg-white rounded-xl sm:p-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Booking Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate || ""}
                required
                onChange={(e) => {
                  const v = e.target.value;
                  setSelectedDate(v);
                  dispatch({
                    type: ActionTypes.UPDATE_BOOKING_DATA,
                    payload: { date: v },
                  });
                }}
                min={todayInput()}
                max={plusMonthsInput(3)}
                className="w-full pr-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Ticket Type Selection */}
        {!selectedType && (
          <div className="max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {ticketTypes.map((type) => (
                <div
                  key={type.id}
                  onClick={() => handleTypeSelect(type)}
                  className="flex items-center justify-between rounded-xl border-2 border-gray-200 bg-white px-4 py-3 cursor-pointer hover:border-orange-300 hover:shadow transition-all duration-200"
                >
                  {/* Left: icon + text */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                      <Ticket className="text-orange-600 w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {type.name}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-1">
                        {type.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: chevron or indicator */}
                  <svg
                    className="w-5 h-5 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ticket Selection */}
        {selectedType && (
          <div className="max-w-4xl">
            {/* Selected Type Header */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-blue-900">
                    {selectedType.name}
                  </h2>
                  <p className="text-blue-700 text-sm">
                    {selectedType.description}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedType(null)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Change Type
                </button>
              </div>
            </div>

            {/* Loading Tickets */}
            {isLoading && loadingStep === "items" && (
              <div className="text-center py-8">
                <Loader className="animate-spin mx-auto mb-4" size={24} />
                <p className="text-gray-600">Loading available tickets...</p>
              </div>
            )}

            {/* Tickets List */}
            {!isLoading && tickets.length > 0 && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Select Tickets
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {tickets.map((ticket) => {
                    const quantity = selections[ticket.id] || 0;
                    const maxQty = ticket.max_per_guest || 10;

                    return (
                      <div
                        key={ticket.id}
                        className="flex items-center justify-between rounded-2xl border-2 border-gray-200 bg-white p-4 transition-all hover:border-orange-300"
                      >
                        {/* Left: icon + label = price */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                            <Ticket className="w-5 h-5 text-gray-800" />
                          </div>

                          <div className="min-w-0">
                            <div className="text-base sm:text-lg text-gray-900 truncate">
                              <span className="font-medium">{ticket.name}</span>
                              <span className="mx-1">{" = "}</span>
                              <span className="font-extrabold text-indigo-950">
                                {formatCurrency(ticket.price)}
                              </span>
                            </div>

                            {ticket.description && (
                              <p className="text-xs text-gray-600 truncate">
                                {ticket.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right: Add / qty pill */}
                        <div className="shrink-0">
                          {quantity === 0 ? (
                            <button
                              onClick={() => updateQuantity(ticket.id, 1)}
                              className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-orange-50 text-orange-600 font-semibold hover:bg-orange-100"
                            >
                              <span>Add</span>
                              <Plus className="w-4 h-4" />
                            </button>
                          ) : (
                            <div className="inline-flex items-center rounded-full bg-orange-50 px-2 py-1">
                              <button
                                onClick={() => updateQuantity(ticket.id, -1)}
                                disabled={quantity === 0}
                                aria-label="Decrease"
                                className="w-8 h-8 rounded-full flex items-center justify-center text-orange-600 hover:bg-orange-100 disabled:opacity-50"
                              >
                                <Minus className="w-4 h-4" />
                              </button>

                              <span className="w-8 text-center font-semibold text-gray-900">
                                {quantity}
                              </span>

                              <button
                                onClick={() => updateQuantity(ticket.id, 1)}
                                disabled={quantity >= maxQty}
                                aria-label="Increase"
                                className="w-8 h-8 rounded-full flex items-center justify-center text-orange-600 hover:bg-orange-100 disabled:opacity-50"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Total & Next Button */}
                {totalAmount > 0 && (
                  <div className="rounded-lg p-4 flex justify-end">
                    <button
                      onClick={handleNext}
                      disabled={!canProceed()}
                      className={`py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                        canProceed()
                          ? "bg-orange-600 text-white hover:bg-orange-700 shadow-lg hover:shadow-xl"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {isLoading ? "Processing..." : "Next"}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* No tickets available */}
            {!isLoading && tickets.length === 0 && selectedType && (
              <div className="text-center py-12">
                <Ticket className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No tickets available
                </h3>
                <p className="text-gray-600 mb-4">
                  No tickets are currently available for {selectedType.name}.
                </p>
                <button
                  onClick={retryApiCall}
                  className="inline-flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <RefreshCw size={16} />
                  <span>Retry</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EntryTicketList;
