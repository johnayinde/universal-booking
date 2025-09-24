// src/business-types/entry/components/EntryTicketList.jsx - FIXED with Working API
import React, { useState, useEffect } from "react";
import {
  Ticket,
  Plus,
  Minus,
  AlertCircle,
  RefreshCw,
  Loader,
  CheckCircle,
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

  // Debug info
  console.log("🎫 EntryTicketList rendered with:", {
    hasAdapter: !!adapter,
    hasApiService: !!apiService,
    locationId: state.config?.locationId || state.config?.location,
    currentStep: state.currentStep,
    loadingStep,
    selectedType: selectedType?.name,
    ticketCount: tickets.length,
    totalAmount,
  });

  // Load ticket types on mount
  useEffect(() => {
    loadTicketTypes();
  }, []);

  // useEffect(() => {
  //   console.log("🔄 EntryPersonalInfo selections changed:", {
  //     stateSelections: state.selections,
  //     selectedTickets: selectedTickets.length,
  //     totalTickets,
  //   });
  // }, [state.selections, selectedTickets, totalTickets]);

  // Update total when selections change
  useEffect(() => {
    const total = calculateTotal(selections, tickets);
    setTotalAmount(total);

    // Update global state
    // dispatch({
    //   type: ActionTypes.UPDATE_SELECTIONS,
    //   payload: selections,
    // });

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
      console.log("🔄 Loading ticket types...");

      let types = [];

      // Use adapter method if available
      if (adapter && typeof adapter.fetchTicketTypes === "function") {
        console.log("🔧 Using adapter.fetchTicketTypes...");
        types = await adapter.fetchTicketTypes();
      } else {
        console.log("❌ No adapter.fetchTicketTypes method found");
        throw new Error("Adapter method not available");
      }

      console.log("✅ Ticket types loaded:", types);
      setTicketTypes(types);
      setRetryCount(0);

      // Auto-select first active type if available
      const activeTypes = types.filter((t) => t.is_active);
      if (activeTypes.length === 1) {
        console.log("🎯 Auto-selecting single active type:", activeTypes[0]);
        await handleTypeSelect(activeTypes[0]);
      } else if (activeTypes.length > 0) {
        console.log("📋 Multiple types available, user must select");
      } else {
        console.warn("⚠️ No active ticket types found");
        setApiError("No active ticket types are currently available.");
      }
    } catch (error) {
      console.error("❌ Error loading ticket types:", error);
      setApiError(`Failed to load ticket types: ${error.message}`);
      setRetryCount((prev) => prev + 1);

      // Use fallback data after retries
      if (retryCount >= 2) {
        console.log("🔄 Using fallback data after multiple failures");
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
      console.log("🔄 Type already selected:", type.name);
      return;
    }

    console.log("🎯 Selecting ticket type:", type);
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
        console.log("🔧 Using adapter.fetchTicketItems...");
        items = await adapter.fetchTicketItems(typeId);
      } else {
        console.log("❌ No adapter.fetchTicketItems method found");
        throw new Error("Adapter method not available");
      }

      console.log("✅ Ticket items loaded:", items);
      setTickets(items);

      // Update global state with ticket items
      dispatch({
        type: ActionTypes.SET_SUB_ITEMS,
        payload: items,
      });
    } catch (error) {
      console.error("❌ Error loading ticket items:", error);
      setApiError(`Failed to load tickets: ${error.message}`);

      // Use fallback data
      console.log("🔄 Using fallback ticket data");
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
    console.log(">>>>>>>", globalSelections);

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

        {/* Ticket Type Selection */}
        {!selectedType && (
          <div className="max-w-2xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Available Entry Types
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {ticketTypes.map((type) => (
                <div
                  key={type.id}
                  onClick={() => handleTypeSelect(type)}
                  className="bg-white border-2 border-gray-200 rounded-xl p-3 cursor-pointer hover:border-orange-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Ticket className="text-orange-600" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {type.name}
                      </h3>

                      <p className="text-gray-600 text-sm mb-3">
                        {type.description}
                      </p>
                      {type.features?.fast_track && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Fast Track Access
                        </span>
                      )}
                    </div>
                    <div className="text-orange-600">
                      <svg
                        className="w-6 h-6"
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
                  </div>
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

                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  {tickets.map((ticket) => {
                    const quantity = selections[ticket.id] || 0;
                    const maxQty = ticket.max_per_guest || 10;

                    return (
                      <div
                        key={ticket.id}
                        className={`bg-white rounded-xl p-4 sm:p-6 transition-all duration-200 border sm:border-2 ${
                          quantity > 0
                            ? "border-orange-200 bg-orange-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 sm:gap-4">
                          {/* Ticket Info */}
                          <div className="flex-1">
                            <div className="flex items-start gap-3 sm:gap-4">
                              <div
                                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center ${
                                  quantity > 0 ? "bg-orange-500" : "bg-gray-100"
                                }`}
                              >
                                <Ticket
                                  className={`w-5 h-5 sm:w-6 sm:h-6 ${
                                    quantity > 0
                                      ? "text-white"
                                      : "text-gray-400"
                                  }`}
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-0.5 sm:mb-1">
                                  {ticket.name}
                                </h4>

                                {ticket.description && (
                                  <p className="text-gray-600 text-xs sm:text-sm mb-1.5 sm:mb-2 line-clamp-2">
                                    {ticket.description}
                                  </p>
                                )}

                                <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
                                  <span className="text-xl sm:text-2xl font-bold text-gray-900">
                                    {formatCurrency(ticket.price)}
                                  </span>

                                  {ticket.type && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-medium bg-blue-100 text-blue-800">
                                      {ticket.type}
                                    </span>
                                  )}

                                  {maxQty < 10 && (
                                    <span className="text-[11px] sm:text-xs text-gray-500">
                                      Max {maxQty} per order
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 sm:gap-3">
                            <button
                              onClick={() => updateQuantity(ticket.id, -1)}
                              disabled={quantity === 0}
                              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-orange-300 text-orange-600 flex items-center justify-center hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                              <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>

                            <div
                              className={`w-14 h-9 sm:w-16 sm:h-10 rounded-lg border-2 flex items-center justify-center font-bold text-base sm:text-lg transition-all duration-200 ${
                                quantity > 0
                                  ? "border-orange-300 bg-orange-100 text-orange-700"
                                  : "border-gray-200 bg-gray-50 text-gray-600"
                              }`}
                            >
                              {quantity}
                            </div>

                            <button
                              onClick={() => updateQuantity(ticket.id, 1)}
                              disabled={quantity >= maxQty}
                              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-orange-300 text-orange-600 flex items-center justify-center hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        </div>

                        {/* Subtotal for this ticket */}
                        {/* {quantity > 0 && (
                          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-orange-200">
                            <div className="flex justify-between items-center text-xs sm:text-sm">
                              <span className="text-orange-700 font-medium">
                                ✓ Added to booking
                              </span>
                              <span className="text-orange-600 font-semibold">
                                {quantity} × {formatCurrency(ticket.price)} ={" "}
                                {formatCurrency(ticket.price * quantity)}
                              </span>
                            </div>
                          </div>
                        )} */}
                      </div>
                    );
                  })}
                </div>

                {/* Total & Next Button */}
                {totalAmount > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    {/* <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-lg font-medium text-gray-900">
                          Total
                        </span>
                        <p className="text-sm text-gray-600">
                          {Object.values(selections).reduce(
                            (sum, qty) => sum + qty,
                            0
                          )}{" "}
                          ticket(s) selected
                        </p>
                      </div>
                      <span className="text-2xl font-bold text-orange-600">
                        {formatCurrency(totalAmount)}
                      </span>
                    </div> */}

                    <button
                      onClick={handleNext}
                      disabled={!canProceed()}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
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
