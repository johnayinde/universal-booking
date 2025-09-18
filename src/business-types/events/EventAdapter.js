import BusinessAdapter from "../../core/BusinessAdapter";

// Components will be imported here
import EventList from "./components/EventList";
import EventDetails from "./components/EventDetails";
import TicketSelection from "./components/TicketSelection";
import EventBookingForm from "./components/EventBookingForm";
import EventConfirmation from "./components/EventConfirmation";

/**
 * Event business type adapter
 */
class EventAdapter extends BusinessAdapter {
  getBusinessType() {
    return "events";
  }

  getComponents() {
    return {
      list: EventList,
      details: EventDetails,
      selection: TicketSelection,
      booking: EventBookingForm,
      confirmation: EventConfirmation,
    };
  }

  getAPIConfig() {
    return {
      endpoints: {
        list: "/lca/events/list",
        details: "/lca/events/detail/{id}",
        subItems: "/lca/events/seat-tickets/{id}",
        categories: "/lca/events/categories",
        booking: "/lca/create-booking",
        updateBooking: "/lca/update-booking/{id}",
        cancelBooking: "/lca/cancel-booking/{id}",
      },
      dataFields: {
        id: "id",
        name: "name",
        description: "description",
        price: "price",
        startTime: "start_time",
        endTime: "end_time",
        location: "address",
        category: "category",
        totalCapacity: "total_ticket",
        availableCapacity: "available_ticket",
      },
    };
  }

  getBookingSteps() {
    return [
      { key: "list", label: "Browse Events", component: "list" },
      { key: "details", label: "Event Details", component: "details" },
      { key: "selection", label: "Select Tickets", component: "selection" },
      { key: "booking", label: "Booking Info", component: "booking" },
      { key: "confirmation", label: "Confirmation", component: "confirmation" },
    ];
  }

  getDefaultConfig() {
    return {
      ...super.getDefaultConfig(),
      branding: {
        primaryColor: "#3b82f6",
        companyName: "Event Ticketing",
      },
    };
  }

  getLabels() {
    return {
      ...super.getLabels(),
      title: "Event Tickets",
      subtitle: "Find and book your perfect event",
      confirmButton: "Book Tickets",
      listTitle: "Available Events",
      detailsTitle: "Event Details",
      selectionTitle: "Select Tickets",
      bookingTitle: "Booking Information",
      confirmationTitle: "Booking Confirmed",
    };
  }

  /**
   * Transform booking data to API format
   * @param {object} bookingData
   * @returns {object}
   */
  transformBookingData(bookingData) {
    const { selectedItem, selections, customerInfo, totalAmount } = bookingData;

    // Transform selections to tickets array
    const selectedTickets = Object.values(selections).map((ticket) => ({
      id: ticket.id,
      name: ticket.name,
      price: ticket.price,
      count: ticket.quantity,
      seat_name: ticket.seatName || "",
      type: ticket.type,
    }));

    return {
      event_id: selectedItem.id,
      first_name: customerInfo.firstName,
      last_name: customerInfo.lastName,
      email: customerInfo.email,
      phone: customerInfo.phone,
      selected_tickets: selectedTickets,
      payment_type: totalAmount > 0 ? "online" : "free",
      payment_status: totalAmount > 0 ? "pending" : "completed",
      total_amount: totalAmount,
    };
  }

  /**
   * Validate booking data
   * @param {object} bookingData
   * @returns {object}
   */
  validateBookingData(bookingData) {
    const errors = {};
    const { selectedItem, selections, customerInfo } = bookingData;

    // Validate selected event
    if (!selectedItem) {
      errors.event = "Please select an event";
    }

    // Validate ticket selections
    if (!selections || Object.keys(selections).length === 0) {
      errors.tickets = "Please select at least one ticket";
    } else {
      const totalTickets = Object.values(selections).reduce(
        (sum, ticket) => sum + (ticket.quantity || 0),
        0
      );
      if (totalTickets === 0) {
        errors.tickets = "Please select at least one ticket";
      }
    }

    // Validate customer info
    if (!customerInfo.firstName?.trim()) {
      errors.firstName = "First name is required";
    }

    if (!customerInfo.lastName?.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!customerInfo.email?.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(customerInfo.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!customerInfo.phone?.trim()) {
      errors.phone = "Phone number is required";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Calculate total amount for event booking
   * @param {object} selections
   * @returns {number}
   */
  calculateTotal(selections) {
    if (!selections) return 0;

    return Object.values(selections).reduce((total, ticket) => {
      return total + (ticket.price || 0) * (ticket.quantity || 0);
    }, 0);
  }

  /**
   * Format event data for display
   * @param {object} event
   * @returns {object}
   */
  formatEventData(event) {
    return {
      ...event,
      formattedDate: this.formatDate(event.start_time),
      formattedTime: this.formatTime(event.start_time, event.end_time),
      isAvailable: (event.available_ticket || 0) > 0,
      soldOutPercentage: this.calculateSoldOutPercentage(
        event.total_ticket,
        event.available_ticket
      ),
    };
  }

  /**
   * Format date for display
   * @param {string} dateString
   * @returns {string}
   */
  formatDate(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  /**
   * Format time range for display
   * @param {string} startTime
   * @param {string} endTime
   * @returns {string}
   */
  formatTime(startTime, endTime) {
    if (!startTime) return "";

    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : null;

    const options = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };

    const startFormatted = start.toLocaleTimeString("en-US", options);
    const endFormatted = end ? end.toLocaleTimeString("en-US", options) : "";

    return endFormatted
      ? `${startFormatted} - ${endFormatted}`
      : startFormatted;
  }

  /**
   * Calculate sold out percentage
   * @param {number} total
   * @param {number} available
   * @returns {number}
   */
  calculateSoldOutPercentage(total, available) {
    if (!total || total === 0) return 0;
    return Math.round(((total - (available || 0)) / total) * 100);
  }
}

export default EventAdapter;
