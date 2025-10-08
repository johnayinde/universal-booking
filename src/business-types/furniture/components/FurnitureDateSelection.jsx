// src/business-types/furniture/components/FurnitureDateSelection.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Loader,
  Users,
  AlertCircle,
  Minus,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { useUniversalBooking } from "../../../core/UniversalStateManager";
import { ActionTypes } from "../../../core/UniversalStateManager";

const FurnitureDateSelection = ({ adapter }) => {
  const { state, dispatch } = useUniversalBooking();
  const { error } = state;

  // Date & furniture
  const [selectedDate, setSelectedDate] = useState(
    state.bookingData?.date || ""
  );
  const [furnitureList, setFurnitureList] = useState([]);
  const [selectedFurniture, setSelectedFurniture] = useState(
    state.selectedFurniture || null
  );

  // Sessions + qty (counter is on the timeslot)
  const [sessions, setSessions] = useState([]); // list from API
  const [slotQty, setSlotQty] = useState({}); // {sessionId: quantity}
  const [availability, setAvailability] = useState({}); // {sessionId: {total, booked, available}}

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");

  // Currency
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const toInputDate = (d) => {
    if (!d) return "";
    const dt = d instanceof Date ? d : new Date(d);
    // normalize to local date, strip time & TZ
    const tz = dt.getTimezoneOffset() * 60000;
    return new Date(dt - tz).toISOString().slice(0, 10);
  };
  const todayInput = () => toInputDate(new Date());
  const plusMonthsInput = (m = 3) => {
    const d = new Date();
    d.setMonth(d.getMonth() + m);
    return toInputDate(d);
  };

  const formatTime = (t) =>
    t
      ? new Date(`2000-01-01T${t}`).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : "";

  // ------- Load furniture once
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        setLoadingStep("furniture");
        dispatch({ type: ActionTypes.CLEAR_ERROR });
        const furniture = await adapter.getFurnitureList();
        setFurnitureList(furniture || []);
      } catch (e) {
        dispatch({
          type: ActionTypes.SET_ERROR,
          payload: e?.message || "Failed to load furniture list",
        });
      } finally {
        setIsLoading(false);
        setLoadingStep("");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------- Select furniture (then fetch sessions)
  const handleFurnitureSelect = async (f) => {
    setSelectedFurniture(f);
    dispatch({ type: ActionTypes.SET_SELECTED_FURNITURE, payload: f });
  };

  // ------- Fetch sessions whenever both date & furniture are chosen
  useEffect(() => {
    const fetchSessions = async () => {
      if (!selectedFurniture || !selectedDate) return;
      try {
        setIsLoading(true);
        setLoadingStep("sessions");
        dispatch({ type: ActionTypes.CLEAR_ERROR });

        const list = await adapter.getFurnitureSessions(
          selectedDate,
          selectedFurniture.id
        );
        setSessions(list || []);
        setSlotQty({}); // reset counters on change
        setAvailability({});
      } catch (e) {
        dispatch({
          type: ActionTypes.SET_ERROR,
          payload: e?.message || "Failed to load available sessions",
        });
      } finally {
        setIsLoading(false);
        setLoadingStep("");
      }
    };
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFurniture, selectedDate]);

  // ------- Increment / decrement (checks availability on first increment)
  const checkAndCacheAvailability = async (session) => {
    // if already cached, reuse
    if (availability[session.id]) return availability[session.id];
    try {
      setIsLoading(true);
      setLoadingStep("availability");
      const a = await adapter.checkFurnitureAvailability(
        selectedFurniture.id,
        selectedDate,
        session.id
      );
      const info = { total: a.total, booked: a.booked, available: a.available };
      setAvailability((prev) => ({ ...prev, [session.id]: info }));
      return info;
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  const increaseQty = async (session) => {
    const a = await checkAndCacheAvailability(session);
    const current = slotQty[session.id] || 0;
    if (current >= (a?.available || 0)) return; // can't exceed available
    setSlotQty((prev) => ({ ...prev, [session.id]: current + 1 }));
  };

  const decreaseQty = (session) => {
    const current = slotQty[session.id] || 0;
    const next = Math.max(0, current - 1);
    setSlotQty((prev) => {
      const n = { ...prev };
      if (next === 0) delete n[session.id];
      else n[session.id] = next;
      return n;
    });
  };

  // ------- Derived totals
  const slotLines = useMemo(() => {
    return sessions
      .filter((s) => slotQty[s.id] > 0)
      .map((s) => ({
        id: s.id,
        name: s.session_name || s.name,
        qty: slotQty[s.id],
        unitPrice: s.price || 0,
        subtotal: (s.price || 0) * (slotQty[s.id] || 0),
      }));
  }, [sessions, slotQty]);

  const canProceed = Boolean(
    selectedDate &&
      selectedFurniture &&
      slotLines.reduce((n, l) => n + l.qty, 0) > 0
  );

  const totalAmount =
    (selectedFurniture?.price || 0) +
    slotLines.reduce((sum, l) => sum + l.subtotal, 0);

  // ------- Next: persist to global and go to Personal Info
  const handleNext = () => {
    if (!canProceed) return;

    // Save chosen slots (first selected slot id & name also stored for compatibility)
    const first = slotLines[0];
    if (first) {
      dispatch({
        type: ActionTypes.SET_SELECTED_SESSION,
        payload: {
          id: first.id,
          session_name: first.name,
          quantity: first.qty,
          price: first.unitPrice,
        },
      });
    }

    dispatch({
      type: ActionTypes.UPDATE_BOOKING_DATA,
      payload: {
        date: selectedDate,
        furniture_id: selectedFurniture?.id,
        furniture_name: selectedFurniture?.name,
        sessionLines: slotLines, // all selected slots with qty
        totalAmount,
        availability, // cached availability map
      },
    });

    dispatch({ type: ActionTypes.SET_CURRENT_STEP, payload: "booking" });
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

  // ------- UI
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
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-5xl space-y-3">
          {/* Error */}
          {error && (
            <div className="bg-red-50  rounded-lg p-4 flex items-start gap-2">
              <AlertCircle className="text-red-400" size={18} />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Date picker */}
          <div className="bg-white rounded-xl p-4 sm:p-5 ">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate || ""} // must be YYYY-MM-DD
                onChange={(e) => {
                  const v = e.target.value; // already YYYY-MM-DD
                  setSelectedDate(v);
                  dispatch({
                    type: ActionTypes.UPDATE_BOOKING_DATA,
                    payload: { date: v },
                  });
                }}
                className="w-full pr-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Furniture */}
          <div className="bg-white rounded-xl sm:p-3">
            <div className="flex items-baseline justify-start mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-2 mr-3">
                Furniture
              </label>

              <span className="text-xs text-orange-600">
                Pick only one option
              </span>
            </div>

            {isLoading && loadingStep === "furniture" ? (
              <div className="py-8 text-center text-gray-600">
                <Loader className="animate-spin mx-auto mb-2" size={22} />
                Loading furniture...
              </div>
            ) : furnitureList.length ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {furnitureList.map((f) => {
                  const isSelected = selectedFurniture?.id === f.id;
                  const isAvailable =
                    f.is_active && f.available_number > f.reserved_number;
                  const max = Math.max(
                    0,
                    (f.available_number || 0) - (f.reserved_number || 0)
                  );
                  return (
                    <button
                      key={f.id}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => handleFurnitureSelect(f)}
                      className={`rounded-2xl border-2 p-4 text-left transition ${
                        !isAvailable
                          ? "bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed"
                          : isSelected
                          ? "border-orange-400 bg-orange-50"
                          : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-gray-900 font-semibold">
                            {f.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Max of {f.capacity || f.max_people || max || 1}{" "}
                            people
                          </div>
                        </div>
                        <div
                          className={`p-2 rounded-lg ${
                            isSelected
                              ? "bg-orange-100 text-orange-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          <Users size={18} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-gray-500">
                No furniture available
              </div>
            )}
          </div>

          {/* Sessions (Time Slots) with counter */}
          {selectedFurniture && selectedDate && (
            <div className="bg-white rounded-xl  ">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Slot
              </label>

              {isLoading && loadingStep === "sessions" ? (
                <div className="py-8 text-center text-gray-600">
                  <Loader className="animate-spin mx-auto mb-2" size={22} />
                  Loading time slots...
                </div>
              ) : sessions.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sessions.map((s) => {
                    const qty = slotQty[s.id] || 0;
                    const avail = availability[s.id]; // undefined until first increment
                    const disabled = avail ? avail.available === 0 : false;

                    return (
                      <div
                        key={s.id}
                        className={`flex flex-col justify-between rounded-[16px] border-2 p-4 transition-all
    ${
      qty > 0
        ? "border-orange-500 bg-white"
        : "border-gray-300 bg-white hover:border-gray-400"
    }`}
                      >
                        {/* Top: Session title & time */}
                        <div className="mb-4">
                          <div className="text-base font-semibold text-gray-900">
                            {s.session_name || s.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatTime(s.start_time)} –{" "}
                            {formatTime(s.end_time)}
                          </div>
                        </div>

                        {/* Bottom: Counter + Price */}
                        <div className="flex items-center justify-between">
                          {/* Counter */}
                          <div className="inline-flex items-center rounded-full bg-orange-50 px-2 py-1">
                            <button
                              onClick={() => decreaseQty(s)}
                              disabled={qty === 0}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-orange-600 hover:bg-orange-100 disabled:opacity-50"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-semibold">
                              {qty}
                            </span>
                            <button
                              disabled={
                                availability[s.id]?.available !== undefined &&
                                qty >= availability[s.id].available
                              }
                              onClick={() => increaseQty(s)}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-orange-600 hover:bg-orange-100 disabled:opacity-50"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-sm font-extrabold text-gray-900">
                            {formatCurrency(s.price)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center text-gray-500">
                  No time slots available
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex justify-end gap-3">
          <button
            onClick={handleNext}
            disabled={!canProceed || isLoading}
            className={`px-8 py-3 rounded-lg font-medium transition-colors ${
              canProceed && !isLoading
                ? "bg-orange-600 text-white hover:bg-orange-700 shadow-lg hover:shadow-xl"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isLoading ? "Processing..." : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FurnitureDateSelection;
