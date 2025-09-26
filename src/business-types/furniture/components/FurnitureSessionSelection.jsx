// src/business-types/furniture/components/FurnitureSessionSelection.jsx
import React, { useState, useEffect } from "react";
import {
  Clock,
  ArrowLeft,
  Loader,
  Users,
  AlertCircle,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { useUniversalBooking } from "../../../core/UniversalStateManager";
import { ActionTypes } from "../../../core/UniversalStateManager";

const FurnitureSessionSelection = ({ apiService, adapter }) => {
  const { state, dispatch } = useUniversalBooking();
  const { selectedFurniture, bookingData, error } = state;

  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return "";
    try {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      return timeString;
    }
  };

  // Load sessions when component mounts
  useEffect(() => {
    if (selectedFurniture && bookingData?.date) {
      loadSessions();
    }
  }, [selectedFurniture, bookingData?.date]);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      setLoadingStep("sessions");
      dispatch({ type: ActionTypes.CLEAR_ERROR });

      console.log(
        "🪑 Loading sessions for furniture:",
        selectedFurniture.id,
        "on date:",
        bookingData.date
      );
      const sessionList = await adapter.getFurnitureSessions(
        bookingData.date,
        selectedFurniture.id
      );

      setSessions(sessionList);
      console.log("✅ Sessions loaded:", sessionList);
    } catch (error) {
      console.error("❌ Failed to load sessions:", error);
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: error.message || "Failed to load available sessions",
      });
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  // Handle session selection
  const handleSessionSelect = async (session) => {
    try {
      setIsLoading(true);
      setLoadingStep("availability");
      dispatch({ type: ActionTypes.CLEAR_ERROR });

      // UPDATED: Check availability with new API format
      console.log("🪑 Checking availability for session:", session.id);
      const availability = await adapter.checkFurnitureAvailability(
        selectedFurniture.id,
        bookingData.date,
        session.id
      );

      // UPDATED: Handle new availability response format
      console.log("📦 Availability data:", availability);

      if (availability.available > 0) {
        const updatedSession = {
          ...session,
          available_slots: availability.available,
          total_slots: availability.total,
          booked_slots: availability.booked,
        };

        setSelectedSession(updatedSession);

        // Calculate total amount
        const totalAmount =
          (selectedFurniture.price || 0) + (session.price || 0);

        // Update global state
        dispatch({
          type: ActionTypes.SET_SELECTED_SESSION,
          payload: updatedSession,
        });

        dispatch({
          type: ActionTypes.UPDATE_BOOKING_DATA,
          payload: {
            sessionId: session.id,
            session_id: session.id, // ADDED: Include session_id for new API
            session_name: session.session_name, // ADDED: Include session_name for new API
            totalAmount: totalAmount,
            availability: {
              total: availability.total,
              booked: availability.booked,
              available: availability.available,
            },
          },
        });

        console.log("🪑 Selected session:", updatedSession);
        console.log("💰 Total amount:", totalAmount);
        console.log("📊 Availability:", {
          total: availability.total,
          booked: availability.booked,
          available: availability.available,
        });
      } else {
        dispatch({
          type: ActionTypes.SET_ERROR,
          payload: `This session is fully booked (${availability.booked}/${availability.total} slots taken). Please select another time slot.`,
        });
      }
    } catch (error) {
      console.error("❌ Failed to select session:", error);
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload:
          error.message ||
          "Failed to check session availability. Please try again.",
      });
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  // UPDATED: Session card rendering with new fields
  const renderSessionCard = (session) => {
    console.log("🪑 Rendering session card:", session);

    const isSelected = selectedSession?.id === session.id;
    // FIXED: Sessions are always clickable initially, availability checked on click
    const isClickable = true;

    return (
      <div
        key={session.id}
        onClick={() => isClickable && handleSessionSelect(session)}
        className={`cursor-pointer rounded-xl p-6 transition-all duration-200 border-2 ${
          isSelected
            ? "border-orange-500 bg-orange-50 shadow-lg"
            : "border-gray-200 hover:border-gray-300 hover:shadow-md"
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="text-blue-600" size={20} />
            </div>
            <div>
              {/* FIXED: Use session_name from API response */}
              <h4 className="font-semibold text-gray-900">
                {session.session_name || session.name}
              </h4>
              <p className="text-sm text-gray-600">
                {formatTime(session.start_time)} -{" "}
                {formatTime(session.end_time)}
              </p>
              {/* FIXED: Show duration_hours from API */}
              <p className="text-xs text-gray-500">
                Duration: {session.duration_hours} hours
              </p>

              {/* FIXED: Only show availability info AFTER it's been checked */}
              {session.available_slots !== undefined &&
                session.total_slots !== undefined && (
                  <p className="text-xs text-gray-500">
                    Available: {session.available_slots}/{session.total_slots}{" "}
                    slots
                  </p>
                )}
            </div>
          </div>

          <div className="text-right">
            {session.price > 0 && (
              <p className="font-bold text-lg text-gray-900">
                {formatCurrency(session.price)}
              </p>
            )}

            {/* FIXED: Only show availability badge AFTER availability check */}
            {session.available_slots !== undefined && (
              <div className="mt-1">
                {session.available_slots > 0 ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {session.available_slots} available
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Fully booked
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* FIXED: Only show "fully booked" message if availability was checked and it's 0 */}
        {session.available_slots !== undefined &&
          session.available_slots === 0 && (
            <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
              Fully Booked - {session.booked_slots || 0}/
              {session.total_slots || 0} slots taken
            </div>
          )}

        {isSelected && (
          <div className="flex items-center text-orange-600 text-sm">
            <CheckCircle size={16} className="mr-1" />
            Selected
          </div>
        )}
      </div>
    );
  };

  // Handle back button
  const handleBack = () => {
    dispatch({
      type: ActionTypes.SET_CURRENT_STEP,
      payload: "list", // Changed from "dateSelection" to "list"
    });
  };

  // Handle next step
  const handleNext = () => {
    if (!selectedSession) {
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: "Please select a time slot",
      });
      return;
    }

    // FIXED: Check if session was verified as available
    if (
      selectedSession.available_slots !== undefined &&
      selectedSession.available_slots === 0
    ) {
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload:
          "Selected session is no longer available. Please choose another time slot.",
      });
      return;
    }

    // Navigate to personal info
    dispatch({
      type: ActionTypes.SET_CURRENT_STEP,
      payload: "booking",
    });
  };
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          <span>Back to Date & Furniture</span>
        </button>

        <div className="mb-4">
          <div className="flex items-center space-x-2 text-orange-600 mb-2">
            <Clock size={20} />
            <span className="text-sm font-medium">Session Selection</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Select Time Slot
          </h1>
          <p className="text-gray-600">
            Choose your preferred time slot for {selectedFurniture?.name}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle
                  className="text-red-400 mr-2 flex-shrink-0"
                  size={20}
                />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Booking Summary */}
          {selectedFurniture && bookingData?.date && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-medium text-blue-900 mb-3 flex items-center">
                <Calendar className="mr-2" size={16} />
                Your Selection
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Date:</span>
                  <span className="font-medium text-blue-900">
                    {new Date(bookingData.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Furniture:</span>
                  <span className="font-medium text-blue-900">
                    {selectedFurniture.name}
                  </span>
                </div>
                {selectedFurniture.price > 0 && (
                  <div className="flex justify-between">
                    <span className="text-blue-700">Base Price:</span>
                    <span className="font-medium text-blue-900">
                      {formatCurrency(selectedFurniture.price)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Loading Sessions */}
          {isLoading && loadingStep === "sessions" && (
            <div className="text-center py-12">
              <Loader className="animate-spin mx-auto mb-4" size={24} />
              <p className="text-gray-600">Loading available sessions...</p>
            </div>
          )}

          {/* Loading Availability Check */}
          {isLoading && loadingStep === "availability" && (
            <div className="text-center py-8">
              <Loader className="animate-spin mx-auto mb-4" size={24} />
              <p className="text-gray-600">Checking availability...</p>
            </div>
          )}

          {/* Sessions List */}
          {!isLoading && sessions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Clock className="mr-2" size={20} />
                Available Time Slots
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sessions.map(renderSessionCard)}
              </div>
            </div>
          )}

          {/* No Sessions Available */}
          {!isLoading && sessions.length === 0 && !error && (
            <div className="text-center py-12">
              <Clock className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No sessions available
              </h3>
              <p className="text-gray-600 mb-4">
                No time slots are available for {selectedFurniture?.name} on{" "}
                {bookingData?.date
                  ? new Date(bookingData.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "the selected date"}
                .
              </p>
              <button
                onClick={handleBack}
                className="inline-flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                <ArrowLeft size={16} />
                <span>Choose Different Date</span>
              </button>
            </div>
          )}

          {/* Selected Session Summary */}
          {selectedSession && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h4 className="font-medium text-green-900 mb-3 flex items-center">
                <CheckCircle className="mr-2" size={16} />
                Selected Session
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Time Slot:</span>
                  <span className="font-medium text-green-900">
                    {selectedSession.session_name || selectedSession.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Time:</span>
                  <span className="font-medium text-green-900">
                    {formatTime(selectedSession.start_time)} -{" "}
                    {formatTime(selectedSession.end_time)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Duration:</span>
                  <span className="font-medium text-green-900">
                    {selectedSession.duration_hours} hours
                  </span>
                </div>
                {/* Show availability if checked */}
                {selectedSession.available_slots !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-green-700">Availability:</span>
                    <span className="font-medium text-green-900">
                      {selectedSession.available_slots}/
                      {selectedSession.total_slots} available
                    </span>
                  </div>
                )}
                {selectedSession.price > 0 && (
                  <div className="flex justify-between">
                    <span className="text-green-700">Session Fee:</span>
                    <span className="font-medium text-green-900">
                      {formatCurrency(selectedSession.price)}
                    </span>
                  </div>
                )}
                {(selectedFurniture?.price > 0 ||
                  selectedSession.price > 0) && (
                  <div className="flex justify-between border-t border-green-200 pt-2 mt-2">
                    <span className="text-green-700 font-medium">Total:</span>
                    <span className="font-bold text-green-900">
                      {formatCurrency(
                        (selectedFurniture?.price || 0) +
                          (selectedSession.price || 0)
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={!selectedSession || isLoading}
            className={`px-8 py-3 rounded-lg font-medium transition-colors ${
              selectedSession && !isLoading
                ? "bg-orange-600 text-white hover:bg-orange-700 shadow-lg hover:shadow-xl"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isLoading ? "Loading..." : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FurnitureSessionSelection;
