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

      // Check availability before selecting
      console.log("🪑 Checking availability for session:", session.id);
      const availability = await adapter.checkFurnitureAvailability(
        selectedFurniture.id,
        bookingData.date,
        session.id
      );

      if (availability.available) {
        setSelectedSession(session);

        // Calculate total amount
        const totalAmount =
          (selectedFurniture.price || 0) + (session.price || 0);

        // Update global state
        dispatch({
          type: ActionTypes.SET_SELECTED_SESSION,
          payload: session,
        });

        dispatch({
          type: ActionTypes.UPDATE_BOOKING_DATA,
          payload: {
            sessionId: session.id,
            totalAmount: totalAmount,
          },
        });

        console.log("🪑 Selected session:", session);
        console.log("💰 Total amount:", totalAmount);
      } else {
        dispatch({
          type: ActionTypes.SET_ERROR,
          payload:
            "This session is no longer available. Please select another time slot.",
        });
      }
    } catch (error) {
      console.error("❌ Failed to select session:", error);
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: error.message || "Failed to select session",
      });
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
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

    // Navigate to personal info - using correct step key
    dispatch({
      type: ActionTypes.SET_CURRENT_STEP,
      payload: "booking", // This matches the booking step key
    });
  };

  // Get session display class
  const getSessionClass = (session) => {
    const baseClass =
      "cursor-pointer rounded-xl p-4 sm:p-6 transition-all duration-200 border-2 ";

    if (!session.available || session.available_slots <= 0) {
      return (
        baseClass + "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
      );
    }

    if (selectedSession?.id === session.id) {
      return baseClass + "border-orange-500 bg-orange-50 shadow-lg";
    }

    return baseClass + "border-gray-200 hover:border-gray-300 hover:shadow-md";
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
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => {
                      if (session.available && session.available_slots > 0) {
                        handleSessionSelect(session);
                      }
                    }}
                    className={getSessionClass(session)}
                  >
                    {/* Session Header */}
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">
                        {session.name}
                      </h4>
                      {selectedSession?.id === session.id && (
                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Time Range */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Clock size={14} className="mr-2" />
                        <span className="text-sm">
                          {formatTime(session.start_time)} -{" "}
                          {formatTime(session.end_time)}
                        </span>
                      </div>

                      {/* Availability Info */}
                      {session.available_slots !== undefined && (
                        <div className="flex items-center text-gray-600">
                          <Users size={14} className="mr-2" />
                          <span className="text-sm">
                            {session.available_slots > 0
                              ? `${session.available_slots} slots available`
                              : "Fully booked"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    {session.price > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Session Fee:
                        </span>
                        <span className="font-semibold text-orange-600">
                          {formatCurrency(session.price)}
                        </span>
                      </div>
                    )}

                    {/* Availability Status */}
                    {!session.available || session.available_slots <= 0 ? (
                      <div className="mt-3 text-center">
                        <span className="text-sm text-red-600 font-medium">
                          {session.available_slots <= 0
                            ? "Fully Booked"
                            : "Unavailable"}
                        </span>
                      </div>
                    ) : (
                      selectedSession?.id === session.id && (
                        <div className="mt-3 text-center">
                          <span className="text-sm text-orange-600 font-medium">
                            Selected
                          </span>
                        </div>
                      )
                    )}
                  </div>
                ))}
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
                  ? new Date(bookingData.date).toLocaleDateString()
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
                    {selectedSession.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Time:</span>
                  <span className="font-medium text-green-900">
                    {formatTime(selectedSession.start_time)} -{" "}
                    {formatTime(selectedSession.end_time)}
                  </span>
                </div>
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
