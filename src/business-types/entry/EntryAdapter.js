// src/business-types/entry/EntryAdapter.js - UPDATED with Dynamic Location Support
import BusinessAdapter from "../../core/BusinessAdapter";

// Import your existing components
import EntryTicketList from "./components/EntryTicketList";
import EntryPersonalInfo from "./components/EntryPersonalInfo";
import EntryConfirmation from "./components/EntryConfirmation";

/**
 * Entry Ticket business type adapter with dynamic location support
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
    // Dynamic API configuration based on location
    const locationId = this.config.locationId || this.config.location || 1;

    return {
      endpoints: {
        // These will be dynamically resolved based on location
        list: `http://entry.landmarkafrica.com/api/booking/entry/type?landmark_location_id=${locationId}`,
        items: `http://entry.landmarkafrica.com/api/booking/entry/items?type_id={typeId}&platform=web`,
        booking: `http://entry.landmarkafrica.com/api/booking/create-booking`,
        payment: `http://entry.landmarkafrica.com/api/booking/initiate-payment`,
      },
      dataFields: {
        id: "id",
        name: "name",
        description: "description",
        price: "price",
        maxQuantity: "max_per_guest",
        available: "available",
        image: "image_url",
        type: "type",
        category: "category",
        features: "features",
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
      locationId: 1, // Default to Lagos
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
   * Transform booking data for API submission - Updated for new API format
   */
  transformBookingData(bookingData) {
    const { selections, customerInfo, selectedTickets, totalAmount } =
      bookingData;

    // Transform selections into the expected API format for your new endpoints
    const tickets = Object.keys(selections)
      .filter((ticketId) => selections[ticketId] > 0)
      .map((ticketId) => {
        const ticket = (selectedTickets || []).find(
          (t) => t.id.toString() === ticketId
        );
        return {
          id: parseInt(ticketId),
          name: ticket?.name,
          count: selections[ticketId], // Using 'count' to match your API
          price: parseFloat(ticket?.price || 0),
          total_price: parseFloat(ticket?.price || 0) * selections[ticketId],
          type: ticket?.type || "entry",
        };
      });

    // Format to match your API structure from the examples you showed
    return {
      location_id: this.config.locationId || this.config.location || 1,
      ticket_type_id: bookingData.selectedItem?.id, // If there's a selected ticket type
      first_name: customerInfo.firstName,
      last_name: customerInfo.lastName,
      email: customerInfo.email,
      phone: customerInfo.phone,
      selected_tickets: tickets,
      total_amount: totalAmount,
      currency: "NGN",
      payment_type: totalAmount > 0 ? "online" : "free",
      payment_method: "paystack",
      payment_status: totalAmount > 0 ? "pending" : "completed",
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

  /**
   * NEW METHOD: Fetch ticket types for the current location
   * This will be called by your EntryTicketList component
   */
  async fetchTicketTypes() {
    try {
      const locationId = this.config.locationId || this.config.location || 1;
      const url = `http://entry.landmarkafrica.com/api/booking/entry/type?landmark_location_id=${locationId}`;

      console.log(`🎫 Fetching ticket types for location ${locationId}:`, url);

      const response = await fetch(url);
      const data = await response.json();

      if (Array.isArray(data)) {
        return data.map((type) => ({
          id: type.id,
          name: type.name || "Regular",
          description: type.description || "Standard entry type",
          features: type.features || {},
          is_active: type.is_active,
          fast_track: type.features?.fast_track || false,
          created_at: type.created_at,
          updated_at: type.updated_at,
        }));
      }

      throw new Error("Invalid response format");
    } catch (error) {
      console.error("Error fetching ticket types:", error);
      throw error;
    }
  }

  /**
   * NEW METHOD: Fetch ticket items for a specific type
   * This will be called when user selects a ticket type
   */
  async fetchTicketItems(typeId) {
    try {
      const url = `http://entry.landmarkafrica.com/api/booking/entry/items?type_id=${typeId}&platform=web`;

      console.log(`🎟️ Fetching ticket items for type ${typeId}:`, url);

      const response = await fetch(url);
      const data = await response.json();

      if (Array.isArray(data)) {
        return data.map((item) => ({
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
          available: true, // Assuming available if returned by API
        }));
      }

      throw new Error("Invalid response format");
    } catch (error) {
      console.error("Error fetching ticket items:", error);
      throw error;
    }
  }

  /**
   * NEW METHOD: Create booking with the new API
   */
  async createBooking(bookingData) {
    try {
      const transformedData = this.transformBookingData(bookingData);
      const url = "http://entry.landmarkafrica.com/api/booking/create-booking";

      console.log("📝 Creating booking:", transformedData);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transformedData),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("✅ Booking created successfully:", result);
        return result;
      } else {
        throw new Error(result.message || "Failed to create booking");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
  }
}

export default EntryAdapter;
