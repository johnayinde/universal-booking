import React from "react";
import { ArrowLeft, Calendar, Clock, MapPin, Users, Tag } from "lucide-react";
import { useUniversalBooking } from "../../../core/UniversalStateManager";
import { ActionTypes } from "../../../core/UniversalStateManager";

const EventDetails = ({ adapter }) => {
  const { state, dispatch } = useUniversalBooking();
  const { selectedItem: event } = state;

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No event selected</p>
        <button
          onClick={() =>
            dispatch({ type: ActionTypes.SET_CURRENT_STEP, payload: "list" })
          }
          className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Browse Events
        </button>
      </div>
    );
  }

  const handleBack = () => {
    dispatch({ type: ActionTypes.SET_CURRENT_STEP, payload: "list" });
  };

  const handleBookTickets = () => {
    dispatch({ type: ActionTypes.SET_CURRENT_STEP, payload: "selection" });
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to Events</span>
      </button>

      {/* Event Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {event.name}
            </h1>

            {/* Category Badge */}
            {event.category && (
              <div className="mb-4">
                <span className="inline-flex items-center bg-primary-100 text-primary-800 text-sm px-3 py-1 rounded-full">
                  <Tag size={14} className="mr-1" />
                  {event.category.name}
                </span>
              </div>
            )}
          </div>

          {/* Availability Status */}
          <div className="ml-6">
            {event.isAvailable ? (
              <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">
                ✓ Available
              </span>
            ) : (
              <span className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full font-medium">
                ✗ Sold Out
              </span>
            )}
          </div>
        </div>

        {/* Event Meta Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Date */}
          <div className="flex items-center text-gray-700">
            <Calendar size={20} className="mr-3 text-primary-600" />
            <div>
              <div className="font-medium">Date</div>
              <div className="text-sm text-gray-600">{event.formattedDate}</div>
            </div>
          </div>

          {/* Time */}
          {event.formattedTime && (
            <div className="flex items-center text-gray-700">
              <Clock size={20} className="mr-3 text-primary-600" />
              <div>
                <div className="font-medium">Time</div>
                <div className="text-sm text-gray-600">
                  {event.formattedTime}
                </div>
              </div>
            </div>
          )}

          {/* Location */}
          {event.address && (
            <div className="flex items-center text-gray-700">
              <MapPin size={20} className="mr-3 text-primary-600" />
              <div>
                <div className="font-medium">Location</div>
                <div className="text-sm text-gray-600">{event.address}</div>
              </div>
            </div>
          )}

          {/* Capacity */}
          {(event.total_ticket || event.available_ticket) && (
            <div className="flex items-center text-gray-700">
              <Users size={20} className="mr-3 text-primary-600" />
              <div>
                <div className="font-medium">Availability</div>
                <div className="text-sm text-gray-600">
                  {event.available_ticket || 0} available
                  {event.total_ticket && ` of ${event.total_ticket} total`}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Event Description */}
        {event.description && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              About This Event
            </h3>
            <div className="text-gray-600 leading-relaxed">
              {event.description.split("\n").map((paragraph, index) => (
                <p key={index} className="mb-2">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Availability Progress */}
        {event.total_ticket && event.available_ticket !== undefined && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Tickets Sold
              </span>
              <span className="text-sm text-gray-600">
                {event.soldOutPercentage}% sold
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${event.soldOutPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {event.isAvailable ? (
            <>
              <button
                onClick={handleBookTickets}
                className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Select Tickets
              </button>
              <button
                onClick={handleBack}
                className="sm:w-auto bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Browse Other Events
              </button>
            </>
          ) : (
            <>
              <button
                disabled
                className="flex-1 bg-gray-300 text-gray-500 py-3 px-6 rounded-lg font-medium cursor-not-allowed"
              >
                Sold Out
              </button>
              <button
                onClick={handleBack}
                className="sm:w-auto bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Browse Other Events
              </button>
            </>
          )}
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">i</span>
            </div>
          </div>
          <div className="ml-3">
            <h4 className="text-blue-900 font-medium mb-1">
              Important Information
            </h4>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Please arrive 15-30 minutes before the event starts</li>
              <li>• Tickets are non-refundable once purchased</li>
              <li>• Valid ID may be required for entry</li>
              {event.total_ticket && (
                <li>• Limited capacity - book early to avoid disappointment</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
