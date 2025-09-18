import React, { useState, useEffect } from "react";
import { Calendar, MapPin, Users, Search, Filter, Clock } from "lucide-react";
import { useUniversalBooking } from "../../../core/UniversalStateManager";
import { ActionTypes } from "../../../core/UniversalStateManager";

const EventList = ({ apiService, adapter }) => {
  const { state, dispatch } = useUniversalBooking();
  const { items: events, categories, loading, error } = state;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredEvents, setFilteredEvents] = useState([]);

  // Load events and categories on component mount
  useEffect(() => {
    loadEvents();
    loadCategories();
  }, []);

  // Filter events based on search and category
  useEffect(() => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (event) =>
          event.category?.id?.toString() === selectedCategory.toString()
      );
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, selectedCategory]);

  const loadEvents = async () => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    dispatch({ type: ActionTypes.CLEAR_ERROR });

    try {
      const result = await apiService.getAvailableItems();

      if (result.success) {
        const formattedEvents = result.data.data.map((event) =>
          adapter.formatEventData(event)
        );
        dispatch({ type: ActionTypes.SET_ITEMS, payload: formattedEvents });
      } else {
        dispatch({ type: ActionTypes.SET_ERROR, payload: result.error });
      }
    } catch (error) {
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: "Failed to load events",
      });
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  const loadCategories = async () => {
    try {
      const result = await apiService.getCategories();

      if (result.success) {
        dispatch({
          type: ActionTypes.SET_CATEGORIES,
          payload: result.data,
        });
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const handleEventSelect = (event) => {
    dispatch({ type: ActionTypes.SET_SELECTED_ITEM, payload: event });
  };

  const handleRetry = () => {
    loadEvents();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <span className="text-lg font-medium">{error}</span>
        </div>
        <button
          onClick={handleRetry}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {adapter.getLabels().listTitle}
        </h2>
        <p className="text-gray-600">{adapter.getLabels().subtitle}</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="relative">
            <Filter
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white min-w-[150px]"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Calendar size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No events found
          </h3>
          <p className="text-gray-600">
            {searchTerm || selectedCategory
              ? "Try adjusting your search or filter criteria."
              : "No events are currently available."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onSelect={() => handleEventSelect(event)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Event Card Component
const EventCard = ({ event, onSelect }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
      <div onClick={onSelect}>
        {/* Event Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {event.name}
            </h3>
            {event.category && (
              <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                {event.category.name}
              </span>
            )}
          </div>

          {/* Availability Badge */}
          <div className="ml-4">
            {event.isAvailable ? (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Available
              </span>
            ) : (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                Sold Out
              </span>
            )}
          </div>
        </div>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          {/* Date and Time */}
          <div className="flex items-center text-gray-600 text-sm">
            <Calendar size={16} className="mr-2" />
            <span>{event.formattedDate}</span>
          </div>

          {event.formattedTime && (
            <div className="flex items-center text-gray-600 text-sm">
              <Clock size={16} className="mr-2" />
              <span>{event.formattedTime}</span>
            </div>
          )}

          {/* Location */}
          {event.address && (
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin size={16} className="mr-2" />
              <span>{event.address}</span>
            </div>
          )}

          {/* Capacity */}
          {(event.total_ticket || event.available_ticket) && (
            <div className="flex items-center text-gray-600 text-sm">
              <Users size={16} className="mr-2" />
              <span>
                {event.available_ticket || 0} available
                {event.total_ticket && ` of ${event.total_ticket}`}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Action Button */}
        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold text-gray-900">
            {/* Price would go here if available */}
          </div>

          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              event.isAvailable
                ? "bg-primary-600 text-white hover:bg-primary-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={!event.isAvailable}
          >
            {event.isAvailable ? "View Details" : "Sold Out"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventList;
