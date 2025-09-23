// src/business-types/entry/EntryAdapter.js - UPDATED for singleton UniversalAPIService
import BusinessAdapter from "../../core/BusinessAdapter";
import UniversalAPIService from "../../core/UniversalAPIService"; // Singleton

// Import your existing components
import EntryTicketList from "./components/EntryTicketList";
import EntryPersonalInfo from "./components/EntryPersonalInfo";
import EntryConfirmation from "./components/EntryConfirmation";

/**
 * Entry Ticket business type adapter with singleton API service support
 */
class EntryAdapter extends BusinessAdapter {
  constructor(config = {}) {
    super(config);
    console.log("🎫 EntryAdapter initialized with config:", config);
  }

  getBusinessType() {
    return "entry";
  }

  getComponents() {
    console.log("🧩 EntryAdapter: Getting components");
    return {
      list: EntryTicketList,
      booking: EntryPersonalInfo,
      confirmation: EntryConfirmation,
    };
  }

  getAPIConfig() {
    const locationId = this.config.locationId || this.config.location || 1;
    console.log(
      `🔧 EntryAdapter: Getting API config for location ${locationId}`
    );

    return {
      endpoints: {
        // These endpoints are now handled by the singleton UniversalAPIService
        // through ConfigManager
        types: `dynamic_location_${locationId}`,
        items: `dynamic_location_${locationId}`,
        booking: `dynamic_location_${locationId}`,
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

    console.log("💰 Calculated total:", total, "from selections:", selections);
    return total;
  }

  /**
   * Get selected tickets from selections
   */
  getSelectedTickets(selections, availableTickets) {
    const selected = Object.keys(selections)
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

    console.log("🎫 Selected tickets:", selected);
    return selected;
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount, config) {
    const symbol = config?.currencySymbol || "₦";
    return `${symbol}${parseFloat(amount).toLocaleString()}`;
  }

  /**
   * Fetch ticket types using singleton UniversalAPIService
   */
  async fetchTicketTypes() {
    const locationId = this.config.locationId || this.config.location || 1;

    console.log(`🔍 Fetching ticket types for location ${locationId}...`);

    try {
      // Use the singleton UniversalAPIService
      const types = await UniversalAPIService.getTicketTypes(locationId);
      console.log("✅ Ticket types loaded:", types);
      return types;
    } catch (error) {
      console.error("❌ Error fetching ticket types:", error);

      // Fallback to sample data
      console.log("🔄 Using sample data as fallback");
      return [
        {
          id: 1,
          name: "Regular Entry",
          description: "Standard entry to Nike Lake Resort facilities",
          features: { fast_track: false },
          is_active: true,
        },
        {
          id: 2,
          name: "VIP Entry",
          description: "Premium entry with exclusive benefits",
          features: { fast_track: true },
          is_active: true,
        },
      ];
    }
  }

  /**
   * Fetch ticket items using singleton UniversalAPIService
   */
  async fetchTicketItems(typeId) {
    const locationId = this.config.locationId || this.config.location || 1;

    console.log(`🔍 Fetching ticket items for type ${typeId}...`);

    try {
      // Use the singleton UniversalAPIService
      const items = await UniversalAPIService.getTicketItems(
        locationId,
        typeId
      );
      console.log("✅ Ticket items loaded:", items);
      return items;
    } catch (error) {
      console.error("❌ Error fetching ticket items:", error);

      // Fallback to sample data based on type
      console.log("🔄 Using sample data as fallback");
      const sampleData = {
        1: [
          // Regular Entry
          {
            id: 1,
            name: "Adult Ticket",
            description: "Standard entry for adults",
            price: 3000,
            max_per_guest: 10,
            available: true,
            type: "Regular",
            category: "Individual",
          },
          {
            id: 2,
            name: "Child Ticket",
            description: "Entry for children (5-12 years)",
            price: 2000,
            max_per_guest: 5,
            available: true,
            type: "Regular",
            category: "Individual",
          },
        ],
        2: [
          // VIP Entry
          {
            id: 3,
            name: "VIP Adult",
            description: "Premium entry with exclusive access",
            price: 5000,
            max_per_guest: 5,
            available: true,
            type: "VIP",
            category: "Premium",
          },
          {
            id: 4,
            name: "VIP Child",
            description: "Premium entry for children",
            price: 3500,
            max_per_guest: 3,
            available: true,
            type: "VIP",
            category: "Premium",
          },
        ],
      };

      return sampleData[typeId] || sampleData[1]; // Default to regular if type not found
    }
  }

  /**
   * Transform booking data for API submission
   */
  transformBookingData(bookingData) {
    const { selections, customerInfo, selectedTickets, totalAmount } =
      bookingData;
    const locationId = this.config.locationId || this.config.location || 1;

    // Transform selections into the expected API format
    const tickets = Object.keys(selections)
      .filter((ticketId) => selections[ticketId] > 0)
      .map((ticketId) => {
        const ticket = (selectedTickets || []).find(
          (t) => t.id.toString() === ticketId
        );
        return {
          id: parseInt(ticketId),
          name: ticket?.name,
          count: selections[ticketId],
          price: parseFloat(ticket?.price || 0),
          total_price: parseFloat(ticket?.price || 0) * selections[ticketId],
          type: ticket?.type || "entry",
        };
      });

    const transformed = {
      location_id: locationId,
      ticket_type_id: bookingData.selectedItem?.id,
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

    console.log("🔄 Transformed booking data:", transformed);
    return transformed;
  }

  /**
   * Create booking using singleton UniversalAPIService
   */
  async createBooking(bookingData) {
    const locationId = this.config.locationId || this.config.location || 1;
    const transformedData = this.transformBookingData(bookingData);

    console.log("📝 Creating booking...");

    try {
      // Use the singleton UniversalAPIService
      const result = await UniversalAPIService.createBooking(
        locationId,
        "entry",
        transformedData
      );
      console.log("✅ Booking created successfully:", result);
      return result;
    } catch (error) {
      console.error("❌ Error creating booking:", error);

      // Fallback - simulate successful booking for demo
      console.log("🔄 Simulating successful booking for demo purposes");
      return {
        success: true,
        booking_id: `DEMO_${Date.now()}`,
        reference: `NLR${Date.now()}`,
        total_amount: transformedData.total_amount,
        payment_status: transformedData.payment_status,
        message: "Booking created successfully (Demo Mode)",
        customer_info: {
          name: `${transformedData.first_name} ${transformedData.last_name}`,
          email: transformedData.email,
          phone: transformedData.phone,
        },
        tickets: transformedData.selected_tickets,
        location_id: transformedData.location_id,
        created_at: new Date().toISOString(),
      };
    }
  }

  /**
   * Validate booking data before submission
   */
  validateBookingData(bookingData) {
    const errors = {};
    const { selections, customerInfo } = bookingData;

    console.log("🔍 Validating booking data:", bookingData);

    // Validate ticket selections
    const hasSelections =
      selections && Object.values(selections).some((qty) => qty > 0);
    if (!hasSelections) {
      errors.selections = "Please select at least one ticket";
    }

    // Validate customer info
    if (!customerInfo) {
      errors.customerInfo = "Customer information is required";
      return { isValid: false, errors };
    }

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

    const isValid = Object.keys(errors).length === 0;
    console.log("✅ Validation result:", { isValid, errors });

    return { isValid, errors };
  }
}

export default EntryAdapter;
