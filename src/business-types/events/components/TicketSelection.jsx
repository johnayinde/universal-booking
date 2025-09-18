import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, Minus, Ticket, AlertCircle } from "lucide-react";
import { useUniversalBooking } from "../../../core/UniversalStateManager";
import { ActionTypes } from "../../../core/UniversalStateManager";

const TicketSelection = ({ apiService, adapter }) => {
  const { state, dispatch } = useUniversalBooking();
  const {
    selectedItem: event,
    subItems: tickets,
    selections,
    loading,
    error,
  } = state;

  const [loadingTickets, setLoadingTickets] = useState(false);

  // Load tickets when component mounts
  useEffect(() => {
    if (event?.id) {
      loadTickets();
    }
  }, [event?.id]);

  // Calculate total when selections change
  useEffect(() => {
    dispatch({ type: ActionTypes.CALCULATE_TOTAL });
  }, [selections]);

  const loadTickets = async () => {
    setLoadingTickets(true);
    dispatch({ type: ActionTypes.CLEAR_ERROR });

    try {
      const result = await apiService.getSubItems(event.id);

      if (result.success) {
        dispatch({ type: ActionTypes.SET_SUB_ITEMS, payload: result.data });
      } else {
        dispatch({ type: ActionTypes.SET_ERROR, payload: result.error });
      }
    } catch (error) {
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: "Failed to load tickets",
      });
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleQuantityChange = (ticket, newQuantity) => {
    const maxQuantity = Math.min(ticket.ticket_per_order || 10, 10);
    const quantity = Math.max(0, Math.min(newQuantity, maxQuantity));

    const updatedSelection = {
      id: ticket.id,
      name: ticket.name,
      price: parseFloat(ticket.price) || 0,
      quantity: quantity,
      type: ticket.type,
      description: ticket.description,
    };

    // If quantity is 0, remove from selections, otherwise update
    if (quantity === 0) {
      const newSelections = { ...selections };
      delete newSelections[ticket.id];
      dispatch({ type: ActionTypes.UPDATE_SELECTIONS, payload: newSelections });
    } else {
      dispatch({
        type: ActionTypes.UPDATE_SELECTIONS,
        payload: { [ticket.id]: updatedSelection },
      });
    }
  };

  const getSelectedQuantity = (ticketId) => {
    return selections[ticketId]?.quantity || 0;
  };

  const getTotalTickets = () => {
    return Object.values(selections).reduce(
      (total, ticket) => total + ticket.quantity,
      0
    );
  };

  const handleBack = () => {
    dispatch({ type: ActionTypes.SET_CURRENT_STEP, payload: "details" });
  };

  const handleContinue = () => {
    if (getTotalTickets() === 0) {
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: "Please select at least one ticket",
      });
      return;
    }
    dispatch({ type: ActionTypes.SET_CURRENT_STEP, payload: "booking" });
  };

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No event selected</p>
      </div>
    );
  }

  if (loadingTickets) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error && !tickets.length) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <AlertCircle size={48} className="mx-auto mb-2" />
          <span className="text-lg font-medium">{error}</span>
        </div>
        <button
          onClick={loadTickets}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to Details</span>
      </button>

      {/* Event Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          {event.name}
        </h2>
        <div className="text-sm text-gray-600 space-y-1">
          <p>{event.formattedDate}</p>
          {event.formattedTime && <p>{event.formattedTime}</p>}
          {event.address && <p>{event.address}</p>}
        </div>
      </div>

      {/* Tickets Section */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Select Tickets
        </h3>

        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Ticket size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tickets available
            </h3>
            <p className="text-gray-600">
              All tickets for this event are currently sold out.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                quantity={getSelectedQuantity(ticket.id)}
                onQuantityChange={handleQuantityChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="text-red-400 mr-2" size={20} />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Summary and Continue */}
      {tickets.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">
                Order Summary
              </h4>
              <p className="text-sm text-gray-600">
                {getTotalTickets()} ticket{getTotalTickets() !== 1 ? "s" : ""}{" "}
                selected
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                ${state.totalAmount.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Selected Tickets Summary */}
          {Object.values(selections).length > 0 && (
            <div className="mb-4 space-y-2">
              {Object.values(selections).map((ticket) => (
                <div key={ticket.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {ticket.name} × {ticket.quantity}
                  </span>
                  <span className="text-gray-900">
                    ${(ticket.price * ticket.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleBack}
              className="sm:w-auto bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleContinue}
              disabled={getTotalTickets() === 0}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                getTotalTickets() > 0
                  ? "bg-primary-600 text-white hover:bg-primary-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Continue to Booking
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Ticket Card Component
const TicketCard = ({ ticket, quantity, onQuantityChange }) => {
  const maxQuantity = Math.min(ticket.ticket_per_order || 10, 10);
  const price = parseFloat(ticket.price) || 0;
  const isFree = price === 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            {ticket.name}
          </h4>

          {ticket.description && (
            <p className="text-gray-600 text-sm mb-3">{ticket.description}</p>
          )}

          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-gray-900">
              {isFree ? "Free" : `$${price.toFixed(2)}`}
              {ticket.type && (
                <span className="ml-2 text-sm text-gray-500 font-normal">
                  ({ticket.type})
                </span>
              )}
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onQuantityChange(ticket, quantity - 1)}
                disabled={quantity === 0}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <Minus size={16} />
              </button>

              <span className="w-8 text-center font-medium">{quantity}</span>

              <button
                onClick={() => onQuantityChange(ticket, quantity + 1)}
                disabled={quantity >= maxQuantity}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Quantity limit info */}
          {maxQuantity < 10 && (
            <p className="text-xs text-gray-500 mt-2">
              Maximum {maxQuantity} per order
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketSelection;
