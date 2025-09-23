// src/business-types/entry/EntryAdapter.js - COMPLETE FIXED VERSION
import BusinessAdapter from "../../core/BusinessAdapter";

// Import components
import EntryTicketList from "./components/EntryTicketList";
import EntryPersonalInfo from "./components/EntryPersonalInfo";
import EntryConfirmation from "./components/EntryConfirmation";

/**
 * Entry Ticket business type adapter
 */
class EntryAdapter extends BusinessAdapter {
  getBusinessType() {
    return "entry";
  }

  getComponents() {
    return {
      list: EntryTicketList,
      booking: EntryPersonalInfo,
      confirmation: EntryConfirmation,
    };
  }

  getAPIConfig() {
    return {
      endpoints: {
        list: "/api/entry/tickets/list",
        booking: "/api/entry/booking/create",
        payment: "/api/entry/payment/initiate",
      },
      dataFields: {
        id: "id",
        name: "name",
        description: "description",
        price: "price",
        maxQuantity: "max_per_order",
        available: "available",
        image: "image_url",
      },
    };
  }

  getBookingSteps() {
    return [
      { key: "list", label: "Tickets", component: "list", icon: "ticket" },
      {
        key: "booking",
        label: "Personal Details",
        component: "booking",
        icon: "user",
      },
      {
        key: "confirmation",
        label: "Confirmation",
        component: "confirmation",
        icon: "check",
      },
    ];
  }

  getDefaultConfig() {
    return {
      ...super.getDefaultConfig(),
      branding: {
        primaryColor: "#f97316",
        companyName: "Nike Lake Resort",
        logoUrl: "/api/branding/logo",
      },
      currency: "NGN",
      currencySymbol: "₦",
    };
  }

  getLabels() {
    return {
      ...super.getLabels(),
      title: "Entry Tickets",
      subtitle: "Select entry type and quantity",
      bookingTitle: "Booking Information",
      ticketDetails: "Ticket Details",
      total: "Total",
      next: "Next",
      back: "Back",
      makePayment: "Make Payment",
      processingPayment: "Processing Payment...",
    };
  }

  /**
   * Calculate total amount from selections
   */
  calculateTotal(selections, tickets) {
    let total = 0;

    Object.keys(selections).forEach((ticketId) => {
      const quantity = selections[ticketId];
      // const ticket = tickets.find((t) => t.id.toString() === ticketId);
      const ticket = (tickets || []).find((t) => t.id.toString() === ticketId);

      if (ticket && quantity > 0) {
        total += parseFloat(ticket.price || 0) * quantity;
      }
    });

    return total;
  }

  /**
   * Get selected tickets from selections
   */
  getSelectedTickets(selections, availableTickets) {
    return Object.keys(selections)
      .filter((ticketId) => selections[ticketId] > 0)
      .map((ticketId) => {
        const ticket = availableTickets.find(
          (t) => t.id.toString() === ticketId
        );
        return {
          ...ticket,
          quantity: selections[ticketId],
          totalPrice: parseFloat(ticket.price || 0) * selections[ticketId],
        };
      });
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount, config) {
    const symbol = config?.currencySymbol || "₦";
    return `${symbol}${parseFloat(amount).toLocaleString()}`;
  }

  /**
   * Transform booking data for API submission
   */
  transformBookingData(bookingData) {
    const { selections, customerInfo, selectedTickets, totalAmount } =
      bookingData;

    // Transform selections into the expected API format
    const tickets = Object.keys(selections)
      .filter((ticketId) => selections[ticketId] > 0)
      .map((ticketId) => {
        const ticket = (selectedTickets || []).find(
          (t) => t.id.toString() === ticketId
        );
        return {
          ticket_id: parseInt(ticketId),
          ticket_name: ticket?.name,
          quantity: selections[ticketId],
          unit_price: parseFloat(ticket?.price || 0),
          total_price: parseFloat(ticket?.price || 0) * selections[ticketId],
        };
      });

    return {
      booking_type: "entry",
      customer_info: {
        first_name: customerInfo.firstName,
        last_name: customerInfo.lastName,
        email: customerInfo.email,
        phone: customerInfo.phone,
      },
      tickets: tickets,
      total_amount: totalAmount,
      currency: "NGN",
      payment_method: "paystack",
    };
  }

  /**
   * Validate booking data before submission
   */
  validateBookingData(bookingData) {
    const errors = {};
    const { selections, customerInfo } = bookingData;

    // Validate ticket selections
    const hasSelections = Object.values(selections).some((qty) => qty > 0);
    if (!hasSelections) {
      errors.selections = "Please select at least one ticket";
    }

    // Validate customer info
    if (!customerInfo.firstName?.trim()) {
      errors.firstName = "First name is required";
    }

    if (!customerInfo.lastName?.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!customerInfo.email?.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!customerInfo.phone?.trim()) {
      errors.phone = "Phone number is required";
    } else if (
      !/^[\d\+\-\s\(\)]{10,}$/.test(customerInfo.phone.replace(/\s/g, ""))
    ) {
      errors.phone = "Please enter a valid phone number";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}

export default EntryAdapter;
