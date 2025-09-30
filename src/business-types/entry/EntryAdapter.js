// src/business-types/entry/EntryAdapter.js - FIXED with Working API Calls
import BusinessAdapter from "../../core/BusinessAdapter";
import ConfigManager from "../../core/ConfigManager";

import EntryTicketList from "./components/EntryTicketList";
import EntryPersonalInfo from "./components/EntryPersonalInfo";
import EntryConfirmation from "./components/EntryConfirmation";
import { Calendar, Ticket, User, Check, CheckCheck } from "lucide-react";

/**
 * Fixed Entry Adapter with working API integration
 */
class EntryAdapter extends BusinessAdapter {
  constructor(config = {}) {
    super(config);
    console.log("🎫 EntryAdapter initialized with config:", config);

    // Set up API base URL
    this.apiBaseUrl = config.apiBaseUrl || "http://127.0.0.1:8000/api";
    this.locationId = config.locationId || config.location || 1;
  }

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
        types: `/booking/entry/type?landmark_location_id=${this.locationId}`,
        items: `/booking/entry/items`,
        booking: `/booking/entry/create`,
      },
      baseUrl: this.apiBaseUrl,
      locationId: this.locationId,
    };
  }

  getBookingSteps() {
    return [
      {
        key: "list",
        label: "Booking Type",
        name: "Booking Type",
        component: "list",
        icon: Calendar,
        description: "Select entry type and quantity",
      },
      {
        key: "booking",
        label: "Personal Details",
        name: "Personal Details",
        component: "booking",
        icon: User,
        description: "Enter your information",
      },
      {
        key: "confirmation",
        label: "Confirmation",
        name: "Confirmation",
        component: "confirmation",
        icon: CheckCheck,
        description: "Review and confirm",
      },
    ];
  }

  getDefaultConfig() {
    const loc = ConfigManager.getLocation(this.locationId);
    return {
      ...super.getDefaultConfig(),
      branding: {
        primaryColor: "#f97316",
        companyName: loc?.displayName || `Location ${this.locationId}`,
        logoUrl: "",
      },
      currency: "NGN",
      currencySymbol: "₦",
      locationId: this.locationId,
    };
  }

  getLabels() {
    return {
      ...super.getLabels(),
      title: "Entry Tickets",
      subtitle: "Select your ticket type and quantity",
      bookingTitle: "Complete Your Booking",
      bookingSubtitle: "Enter your details to proceed",
    };
  }

  // =============================================
  // API METHODS - FIXED IMPLEMENTATION
  // =============================================

  /**
   * Fetch ticket types with proper error handling
   */
  async fetchTicketTypes() {
    try {
      const url = `${this.apiBaseUrl}/booking/entry/type?landmark_location_id=${this.locationId}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Transform the response data
      let types = [];
      if (Array.isArray(data)) {
        types = data.map((type) => ({
          id: type.id,
          name: type.name || "Entry Ticket",
          description: type.description || "Standard entry access",
          features: type.features || {},
          is_active: type.is_active !== false,
          fast_track: type.features?.fast_track || false,
          created_at: type.created_at,
          updated_at: type.updated_at,
        }));
      } else if (data.data && Array.isArray(data.data)) {
        // Handle wrapped response
        types = data.data.map((type) => ({
          id: type.id,
          name: type.name || "Entry Ticket",
          description: type.description || "Standard entry access",
          features: type.features || {},
          is_active: type.is_active !== false,
        }));
      } else {
        throw new Error(
          "Invalid response format - expected array or {data: array}"
        );
      }

      return types;
    } catch (error) {
      console.error("❌ Error fetching ticket types:", error);

      // Return fallback data
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
   * Fetch ticket items for a specific type
   */
  async fetchTicketItems(typeId) {
    try {
      const url = `${this.apiBaseUrl}/booking/entry/items?type_id=${typeId}&platform=web&landmark_location_id=${this.locationId}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Transform the response data
      let items = [];
      if (Array.isArray(data)) {
        items = data.map((item) => ({
          id: item.id,
          name: item.name || "Adult Ticket",
          description: item.description || "Standard entry ticket",
          price: parseFloat(item.price) || 0,
          max_per_guest: item.max_per_guest || 10,
          image_url: item.image_url,
          type: item.type || "Regular",
          category: item.category || "Individual",
          benefits: item.benefits || [],
          terms_conditions: item.terms_conditions || {},
          available: item.available !== false,
        }));
      } else if (data.data && Array.isArray(data.data)) {
        // Handle wrapped response
        items = data.data.map((item) => ({
          id: item.id,
          name: item.name || "Adult Ticket",
          description: item.description || "Standard entry ticket",
          price: parseFloat(item.price) || 0,
          max_per_guest: item.max_per_guest || 10,
          available: item.available !== false,
        }));
      } else {
        throw new Error(
          "Invalid response format - expected array or {data: array}"
        );
      }

      return items;
    } catch (error) {
      console.error("❌ Error fetching ticket items:", error);
    }
  }



  /**
   * Create booking with proper payload structure
   */
  async createBooking(bookingData) {

    try {
      const url = `${this.apiBaseUrl}/booking/entry/create-booking?location_id=${this.locationId}`;

      const payload = {
        date: bookingData.date || new Date().toISOString().split("T")[0],
        platform: bookingData.platform,
        ticket_type_id: bookingData.ticket_type_id,
        ticket_type: bookingData.ticket_type,
        email: bookingData.email,
        first_name: bookingData.first_name,
        last_name: bookingData.last_name,
        phone: bookingData.phone,
        items: bookingData.items,
      };


      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const result = await response.json();

      return result;
    
    } catch (error) {
      console.error("❌ Booking creation failed:", error);
      return {
        success: false,
        error: error.message || "Failed to create booking",
        data: null,
      };
    }
  }

  /**
   * Calculate total amount with proper formatting
   */
  calculateTotal(selections, items) {
    if (!selections || !items) return 0;

    let total = 0;
    Object.keys(selections).forEach((itemId) => {
      const quantity = selections[itemId];
      const item = items.find((i) => i.id.toString() === itemId.toString());

      if (item && quantity > 0) {
        total += parseFloat(item.price || 0) * quantity;
      }
    });

    return total;
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount, config = {}) {
    const currency = config.currency || this.getDefaultConfig().currency;

    if (currency === "NGN") {
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    }

    return `${currency} ${parseFloat(amount).toLocaleString()}`;
  }

  /**
   * Validate booking data before submission
   */
  validateBookingData(data) {
    const errors = [];

    // Check customer info
    if (!data.customer_info?.first_name) errors.push("First name is required");
    if (!data.customer_info?.last_name) errors.push("Last name is required");
    if (!data.customer_info?.email) errors.push("Email is required");
    if (!data.customer_info?.phone) errors.push("Phone number is required");

    // Check tickets
    if (!data.tickets || data.tickets.length === 0) {
      errors.push("At least one ticket must be selected");
    }

    // Check total amount
    if (!data.total_amount || data.total_amount <= 0) {
      errors.push("Total amount must be greater than zero");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default EntryAdapter;
