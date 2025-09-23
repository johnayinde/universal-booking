// src/business-types/entry/components/EntryTicketList.jsx - FIXED with better error handling
import React, { useState, useEffect } from "react";
import { useUniversalBooking } from "../../../core/UniversalStateManager";
import { ActionTypes } from "../../../core/UniversalStateManager";
import {
  Minus,
  Plus,
  Ticket,
  User,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const EntryTicketList = () => {
  const {
    state,
    dispatch,
    adapter,
    apiService,
    setCurrentStep,
    setError,
    setLoading,
  } = useUniversalBooking();

  // State management
  const [ticketTypes, setTicketTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [selections, setSelections] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [loadingStep, setLoadingStep] = useState("none"); // 'types', 'items', 'none'
  const [retryCount, setRetryCount] = useState(0);

  console.log("🎫 EntryTicketList component rendered with state:", {
    adapterExists: !!adapter,
    locationId: state.config?.locationId || state.config?.location,
    currentStep: state.currentStep,
  });

  // Load ticket types on component mount
  useEffect(() => {
    loadTicketTypes();
  }, []);

  // Load ticket types with robust error handling
  const loadTicketTypes = async () => {
    setIsLoading(true);
    setLoadingStep("types");
    setApiError(null);

    try {
      console.log("🔄 Loading ticket types...");

      // Get location ID from config
      const locationId =
        state.config?.locationId || state.config?.location || 1;
      console.log("📍 Using location ID:", locationId);

      let types = [];

      // Try using the adapter's method first
      if (adapter && typeof adapter.fetchTicketTypes === "function") {
        console.log("🔧 Using adapter.fetchTicketTypes...");
        types = await adapter.fetchTicketTypes();
      } else {
        // Direct API call fallback
        console.log("🌐 Fallback to direct API call...");
        const url = `http://127.0.0.1:8000/api/booking/entry/type?landmark_location_id=${locationId}`;
        console.log("📡 API URL:", url);

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("📦 Raw API response:", data);

        if (Array.isArray(data)) {
          types = data.map((type) => ({
            id: type.id,
            name: type.name || "Regular",
            description: type.description || "Standard entry type",
            features: type.features || {},
            is_active: type.is_active !== false,
            fast_track: type.features?.fast_track || false,
            created_at: type.created_at,
            updated_at: type.updated_at,
          }));
        } else {
          throw new Error("Invalid response format - expected array");
        }
      }

      console.log("✅ Ticket types loaded:", types);
      setTicketTypes(types);
      setRetryCount(0);

      // Auto-select the first active type if only one exists
      const activeTypes = types.filter((t) => t.is_active);
      if (activeTypes.length === 1) {
        console.log("🎯 Auto-selecting single active type:", activeTypes[0]);
        handleTypeSelect(activeTypes[0]);
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

      // After multiple failures, use sample data
      if (retryCount >= 2) {
        console.log("🔄 Using sample data after multiple failures");
        const sampleTypes = [
          {
            id: 1,
            name: "Regular Entry",
            description: "Standard entry type for demonstration",
            features: { fast_track: false },
            is_active: true,
          },
        ];
        setTicketTypes(sampleTypes);
        handleTypeSelect(sampleTypes[0]);
      }
    } finally {
      setIsLoading(false);
      setLoadingStep("none");
    }
  };

  // Handle ticket type selection
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

    await loadTicketItems(type.id);
  };

  // Load ticket items for selected type
  const loadTicketItems = async (typeId) => {
    setIsLoading(true);
    setLoadingStep("items");
    setApiError(null);

    try {
      console.log(`🔄 Loading ticket items for type ${typeId}...`);

      let items = [];

      // Try using the adapter's method first
      if (adapter && typeof adapter.fetchTicketItems === "function") {
        console.log("🔧 Using adapter.fetchTicketItems...");
        items = await adapter.fetchTicketItems(typeId);
      } else {
        // Direct API call fallback
        console.log("🌐 Fallback to direct API call...");
        const url = `http://127.0.0.1:8000/api/booking/entry/items?type_id=${typeId}&platform=web`;
        console.log("📡 API URL:", url);

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("📦 Raw API response:", data);

        if (Array.isArray(data)) {
          items = data.map((item) => ({
            id: item.id,
            name: item.name || "Adult",
            description: item.description || "Access to main event area",
            price: parseFloat(item.price) || 0,
            max_per_guest: item.max_per_guest || 2,
            image_url: item.image_url,
            type: item.type || "Regular",
            category: item.category || "Individual",
            benefits: item.benefits || [],
            terms_conditions: item.terms_conditions || {},
            no_refund: item.terms_conditions?.no_refund || true,
            available: true,
          }));
        } else {
          throw new Error("Invalid response format - expected array");
        }
      }

      console.log("✅ Ticket items loaded:", items);
      setTickets(items);

      // Update global state
      dispatch({
        type: ActionTypes.SET_ITEMS,
        payload: items,
      });
    } catch (error) {
      console.error("❌ Error loading ticket items:", error);
      setApiError(`Failed to load tickets: ${error.message}`);

      // Fallback to sample data based on type
      console.log("🔄 Using sample ticket data as fallback");
      const sampleTickets = [
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

      setTickets(sampleTickets);
      dispatch({
        type: ActionTypes.SET_ITEMS,
        payload: sampleTickets,
      });
    } finally {
      setIsLoading(false);
      setLoadingStep("none");
    }
  };

  // Calculate total when selections change
  useEffect(() => {
    const total = calculateTotal(selections, tickets);
    setTotalAmount(total);

    // Update global state
    dispatch({
      type: ActionTypes.UPDATE_SELECTIONS,
      payload: selections,
    });

    dispatch({
      type: ActionTypes.CALCULATE_TOTAL,
      payload: total,
    });
  }, [selections, tickets]);

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

  const updateQuantity = (ticketId, change) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    const currentQty = selections[ticketId] || 0;
    const newQty = Math.max(
      0,
      Math.min(ticket.max_per_guest || 10, currentQty + change)
    );

    setSelections((prev) => ({
      ...prev,
      [ticketId]: newQty,
    }));
  };

  const canProceed = () => {
    return Object.values(selections).some((qty) => qty > 0) && !isLoading;
  };

  const handleNext = () => {
    if (!canProceed()) return;

    // Store selected type and items in global state
    if (selectedType) {
      dispatch({
        type: ActionTypes.SET_SELECTED_ITEM,
        payload: selectedType,
      });
    }

    // Navigate to next step
    setCurrentStep("booking");
  };

  const handleRetry = () => {
    console.log("🔄 Retrying API call...");
    setRetryCount(0);
    if (selectedType) {
      loadTicketItems(selectedType.id);
    } else {
      loadTicketTypes();
    }
  };

  const formatCurrency = (amount) => {
    if (adapter && typeof adapter.formatCurrency === "function") {
      return adapter.formatCurrency(amount, state.config);
    }
    return `₦${parseFloat(amount).toLocaleString()}`;
  };

  // Show loading state
  if (isLoading && loadingStep === "types") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ticket types...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Display with Retry */}
      {apiError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <div className="flex-1">
              <h4 className="text-red-800 font-medium">API Error</h4>
              <p className="text-red-700 text-sm mt-1">{apiError}</p>
              <p className="text-red-600 text-xs mt-2">
                {retryCount > 0
                  ? "Using sample data for demonstration."
                  : "Click retry to try again."}
              </p>
              {retryCount < 3 && (
                <button
                  onClick={handleRetry}
                  className="mt-3 inline-flex items-center px-3 py-1 bg-red-100 text-red-800 text-sm rounded hover:bg-red-200 transition-colors"
                >
                  <RefreshCw size={14} className="mr-1" />
                  Retry
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ticket Types Selection */}
      {ticketTypes.length > 1 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Select Ticket Type
          </h3>
          <div className="grid gap-3">
            {ticketTypes
              .filter((type) => type.is_active !== false)
              .map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleTypeSelect(type)}
                  disabled={isLoading}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedType?.id === type.id
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-start space-x-3">
                    <Ticket
                      className={`mt-1 ${
                        selectedType?.id === type.id
                          ? "text-orange-600"
                          : "text-gray-400"
                      }`}
                      size={20}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{type.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {type.description}
                      </p>
                      {type.features?.fast_track && (
                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-2">
                          Fast Track
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Loading Items */}
      {isLoading && loadingStep === "items" && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Loading tickets...</p>
          </div>
        </div>
      )}

      {/* Ticket Selection */}
      {tickets.length > 0 && !isLoading && (
        <>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Select Tickets
            </h3>
            <div className="space-y-4">
              {tickets.map((ticket) => {
                const quantity = selections[ticket.id] || 0;
                const maxQty = ticket.max_per_guest || 10;

                return (
                  <div
                    key={ticket.id}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {ticket.name}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {ticket.description}
                        </p>
                        <div className="mt-2">
                          <span className="text-lg font-bold text-orange-600">
                            {formatCurrency(ticket.price)}
                          </span>
                          <span className="text-sm text-gray-500 ml-2">
                            per person
                          </span>
                          {ticket.type && (
                            <span className="ml-3 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {ticket.type}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 ml-4">
                        <button
                          onClick={() => updateQuantity(ticket.id, -1)}
                          disabled={quantity === 0}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus size={16} />
                        </button>

                        <span className="w-8 text-center font-medium">
                          {quantity}
                        </span>

                        <button
                          onClick={() => updateQuantity(ticket.id, 1)}
                          disabled={quantity >= maxQty}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    {quantity > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {quantity} × {formatCurrency(ticket.price)}
                          </span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(ticket.price * quantity)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total & Next Button */}
          {totalAmount > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-medium text-gray-900">Total</span>
                <span className="text-xl font-bold text-orange-600">
                  {formatCurrency(totalAmount)}
                </span>
              </div>

              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
          <p className="text-gray-600">
            No tickets are currently available for {selectedType.name}.
          </p>
          <button
            onClick={handleRetry}
            className="mt-4 inline-flex items-center px-4 py-2 bg-orange-100 text-orange-800 rounded hover:bg-orange-200 transition-colors"
          >
            <RefreshCw size={16} className="mr-2" />
            Try Again
          </button>
        </div>
      )}

      {/* No types available */}
      {!isLoading && ticketTypes.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No ticket types available
          </h3>
          <p className="text-gray-600">
            No ticket types are currently available for this location.
          </p>
          <button
            onClick={handleRetry}
            className="mt-4 inline-flex items-center px-4 py-2 bg-orange-100 text-orange-800 rounded hover:bg-orange-200 transition-colors"
          >
            <RefreshCw size={16} className="mr-2" />
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default EntryTicketList;
