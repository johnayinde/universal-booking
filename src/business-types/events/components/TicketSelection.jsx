// src/business-types/events/components/TicketSelection.jsx - Enhanced with Perfect Counter
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Minus,
  Ticket,
  AlertCircle,
  Users,
  Clock,
} from "lucide-react";
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
  const [animatingTickets, setAnimatingTickets] = useState(new Set());

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

    // Add animation effect
    setAnimatingTickets((prev) => new Set(prev).add(ticket.id));
    setTimeout(() => {
      setAnimatingTickets((prev) => {
        const newSet = new Set(prev);
        newSet.delete(ticket.id);
        return newSet;
      });
    }, 300);

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        <span className="ml-3 text-gray-600">Loading tickets...</span>
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
          <span>Back to Event Details</span>
        </button>

        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Select Tickets
          </h1>
          <p className="text-gray-600">
            Choose your ticket type and quantity for {event.name}
          </p>
        </div>

        {/* Event Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
              <Ticket className="text-white" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900">{event.name}</h3>
              {event.date && (
                <div className="flex items-center space-x-2 text-blue-700 text-sm mt-1">
                  <Clock size={16} />
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                </div>
              )}
              {event.location && (
                <p className="text-blue-600 text-sm mt-1">{event.location}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tickets Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle
                className="text-red-400 mr-2 flex-shrink-0"
                size={20}
              />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Tickets List */}
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
          <div className="space-y-4 max-w-4xl">
            {tickets.map((ticket) => (
              <EnhancedTicketCard
                key={ticket.id}
                ticket={ticket}
                quantity={getSelectedQuantity(ticket.id)}
                onQuantityChange={handleQuantityChange}
                isAnimating={animatingTickets.has(ticket.id)}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between max-w-4xl">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Back
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {getTotalTickets() > 0 && (
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {getTotalTickets()} ticket{getTotalTickets() !== 1 ? "s" : ""}{" "}
                  selected
                </p>
                <p className="text-lg font-bold text-orange-600">
                  {formatCurrency(state.totalAmount)}
                </p>
              </div>
            )}

            <button
              onClick={handleContinue}
              disabled={getTotalTickets() === 0}
              className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                getTotalTickets() > 0
                  ? "bg-orange-600 text-white hover:bg-orange-700 shadow-lg hover:shadow-xl"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Continue to Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Ticket Card Component with Perfect Counter
const EnhancedTicketCard = ({
  ticket,
  quantity,
  onQuantityChange,
  isAnimating,
  formatCurrency,
}) => {
  const maxQuantity = Math.min(ticket.ticket_per_order || 10, 10);
  const price = parseFloat(ticket.price) || 0;
  const isFree = price === 0;
  const isSelected = quantity > 0;

  const handleDecrement = () => {
    if (quantity > 0) {
      onQuantityChange(ticket, quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(ticket, quantity + 1);
    }
  };

  return (
    <div
      className={`bg-white border-2 rounded-xl p-6 transition-all duration-300 ${
        isSelected
          ? "border-orange-200 bg-orange-50 shadow-lg"
          : "border-gray-200 hover:border-gray-300 hover:shadow-md"
      } ${isAnimating ? "scale-105" : ""}`}
    >
      <div className="flex items-start justify-between">
        {/* Ticket Info */}
        <div className="flex-1">
          <div className="flex items-start space-x-4">
            {/* Ticket Icon */}
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isSelected ? "bg-orange-500" : "bg-gray-100"
              }`}
            >
              <Ticket
                className={isSelected ? "text-white" : "text-gray-400"}
                size={20}
              />
            </div>

            {/* Ticket Details */}
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900 mb-1">
                {ticket.name}
              </h4>

              {ticket.description && (
                <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                  {ticket.description}
                </p>
              )}

              {/* Ticket Meta */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {ticket.type && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {ticket.type}
                  </span>
                )}

                {ticket.category && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {ticket.category}
                  </span>
                )}

                {maxQuantity < 10 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Users size={12} className="mr-1" />
                    Max {maxQuantity} per order
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-gray-900">
                  {isFree ? "Free" : formatCurrency(price)}
                </span>
                {!isFree && (
                  <span className="text-sm text-gray-500">per ticket</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quantity Counter */}
        <div className="flex flex-col items-end space-y-4">
          {/* Counter Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDecrement}
              disabled={quantity === 0}
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                quantity === 0
                  ? "border-gray-200 text-gray-300 cursor-not-allowed"
                  : "border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400 active:scale-95"
              }`}
            >
              <Minus size={18} />
            </button>

            {/* Quantity Display */}
            <div
              className={`w-16 h-10 rounded-lg border-2 flex items-center justify-center font-bold text-lg transition-all duration-200 ${
                isSelected
                  ? "border-orange-300 bg-orange-100 text-orange-700"
                  : "border-gray-200 bg-gray-50 text-gray-600"
              } ${isAnimating ? "animate-pulse" : ""}`}
            >
              {quantity}
            </div>

            <button
              onClick={handleIncrement}
              disabled={quantity >= maxQuantity}
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                quantity >= maxQuantity
                  ? "border-gray-200 text-gray-300 cursor-not-allowed"
                  : "border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400 active:scale-95"
              }`}
            >
              <Plus size={18} />
            </button>
          </div>

          {/* Subtotal */}
          {isSelected && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Subtotal</p>
              <p className="text-xl font-bold text-orange-600">
                {formatCurrency(price * quantity)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="mt-4 pt-4 border-t border-orange-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-orange-700 font-medium">
              ✓ Added to booking
            </span>
            <span className="text-orange-600">
              {quantity} × {formatCurrency(price)} ={" "}
              {formatCurrency(price * quantity)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketSelection;
