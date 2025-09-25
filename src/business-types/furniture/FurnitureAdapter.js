// src/business-types/furniture/FurnitureAdapter.js
import BusinessAdapter from "../../core/BusinessAdapter";

// Import components
import FurnitureDateSelection from "./components/FurnitureDateSelection";
import FurnitureSessionSelection from "./components/FurnitureSessionSelection";
import FurniturePersonalInfo from "./components/FurniturePersonalInfo";
import FurnitureConfirmation from "./components/FurnitureConfirmation";

/**
 * Furniture Adapter for furniture booking system
 * Reuses entry booking design patterns with furniture-specific flow
 */
class FurnitureAdapter extends BusinessAdapter {
  constructor(config = {}) {
    super(config);
    console.log("🪑 FurnitureAdapter initialized with config:", config);

    // Set up API base URL
    this.apiBaseUrl = config.apiBaseUrl || "http://127.0.0.1:8000/api";
    this.locationId = config.locationId || config.location || 1;
  }

  getBusinessType() {
    return "furniture";
  }

  getComponents() {
    console.log("🧩 FurnitureAdapter: Getting components");
    return {
      list: FurnitureDateSelection, // Maps to "list" step
      details: FurnitureSessionSelection, // Maps to "details" step
      selection: FurniturePersonalInfo, // Maps to "selection" step
      booking: FurniturePersonalInfo, // Alternative mapping
      confirmation: FurnitureConfirmation, // Maps to "confirmation" step
    };
  }

  getAPIConfig() {
    console.log(
      `🔧 FurnitureAdapter: Getting API config for location ${this.locationId}`
    );

    return {
      endpoints: {
        furnitureList: `/booking/furniture/furniture-list?location_id=${this.locationId}`,
        sessions: `/booking/furniture/sessions`,
        availability: `/booking/furniture/availability`,
        booking: `/booking/furniture/bookings?location_id=${this.locationId}`,
      },
      baseUrl: this.apiBaseUrl,
      locationId: this.locationId,
    };
  }

  getBookingSteps() {
    return [
      {
        key: "list", // Changed from "dateSelection" to match widget expectations
        label: "Date & Furniture",
        name: "Select Date & Furniture",
        component: "list", // Component mapping stays the same
        icon: "calendar",
        description: "Pick date and furniture type",
      },
      {
        key: "details", // Changed from "sessionSelection"
        label: "Time Slots",
        name: "Select Sessions",
        component: "details", // Component mapping stays the same
        icon: "clock",
        description: "Choose available time slots",
      },
      {
        key: "booking",
        label: "Personal Details",
        name: "Personal Details",
        component: "booking",
        icon: "user",
        description: "Enter your information",
      },
      {
        key: "confirmation",
        label: "Confirmation",
        name: "Confirmation",
        component: "confirmation",
        icon: "check",
        description: "Review and confirm",
      },
    ];
  }

  /**
   * Get list of furniture for location
   */
  async getFurnitureList() {
    try {
      console.log(`🪑 Fetching furniture list for location ${this.locationId}`);

      const url = `${this.apiBaseUrl}/booking/furniture/furniture-list?location_id=${this.locationId}`;
      console.log("📡 Furniture API URL:", url);

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
      console.log("📦 Raw furniture response:", data);

      // Transform the response data
      let furniture = [];
      if (Array.isArray(data)) {
        furniture = data;
      } else if (data.data && Array.isArray(data.data)) {
        furniture = data.data;
      } else {
        throw new Error("Invalid response format - expected array");
      }

      const transformedFurniture = furniture.map((item) => ({
        id: item.id,
        name: item.name || "Furniture Item",
        description: item.description || "Available furniture",
        price: parseFloat(item.price) || 0,
        image_url: item.image_url,
        max_capacity: item.max_capacity || 8,
        available: item.available !== false,
      }));

      console.log("✅ Furniture list loaded:", transformedFurniture);
      return transformedFurniture;
    } catch (error) {
      console.error("❌ Failed to fetch furniture list:", error);
      throw error;
    }
  }

  /**
   * Get available sessions for selected furniture and date
   */
  async getFurnitureSessions(date, furnitureId) {
    try {
      console.log(
        `🪑 Fetching sessions for furniture ${furnitureId} on ${date}`
      );

      const url = `${this.apiBaseUrl}/booking/furniture/sessions?date=${date}&furniture_id=${furnitureId}&platform=web`;
      console.log("📡 Sessions API URL:", url);

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
      console.log("📦 Raw sessions response:", data);

      // Transform the response data
      let sessions = [];
      if (Array.isArray(data)) {
        sessions = data;
      } else if (data.data && Array.isArray(data.data)) {
        sessions = data.data;
      } else if (data.sessions && Array.isArray(data.sessions)) {
        sessions = data.sessions;
      } else {
        throw new Error("Invalid response format - expected array");
      }

      const transformedSessions = sessions.map((session) => ({
        id: session.id,
        name: session.name || `Session ${session.id}`,
        start_time: session.start_time,
        end_time: session.end_time,
        price: parseFloat(session.price) || 0,
        available_slots: session.available_slots || 0,
        max_capacity: session.max_capacity || 8,
        available: session.available !== false && session.available_slots > 0,
      }));

      console.log("✅ Furniture sessions loaded:", transformedSessions);
      return transformedSessions;
    } catch (error) {
      console.error("❌ Failed to fetch furniture sessions:", error);
      throw error;
    }
  }

  /**
   * Check furniture availability
   */
  async checkFurnitureAvailability(furnitureId, date, sessionId) {
    try {
      console.log(
        `🪑 Checking availability for furniture ${furnitureId}, date ${date}, session ${sessionId}`
      );

      const url = `${this.apiBaseUrl}/booking/furniture/availability`;
      console.log("📡 Availability API URL:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          furniture_id: furnitureId,
          date: date,
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("📦 Availability response:", data);

      console.log("✅ Availability check successful:", data);
      return data;
    } catch (error) {
      console.error("❌ Failed to check furniture availability:", error);
      throw error;
    }
  }

  /**
   * Create furniture booking
   */
  async createFurnitureBooking(bookingData) {
    try {
      console.log("🪑 Creating furniture booking:", bookingData);

      // Validate required fields
      if (!bookingData.customer_info) {
        throw new Error("Customer information is required");
      }

      if (!bookingData.furniture_id) {
        throw new Error("Furniture selection is required");
      }

      if (!bookingData.session_id) {
        throw new Error("Session selection is required");
      }

      if (!bookingData.date) {
        throw new Error("Booking date is required");
      }

      // Transform booking data for API
      const payload = {
        date: bookingData.date,
        platform: "web",
        furniture_id: bookingData.furniture_id,
        session_id: bookingData.session_id,
        email: bookingData.customer_info.email,
        first_name: bookingData.customer_info.firstName,
        last_name: bookingData.customer_info.lastName,
        phone: bookingData.customer_info.phone,
        total_amount: bookingData.total_amount,
        guests: bookingData.guests || 1,
        special_requests: bookingData.customer_info.specialRequests || "",
      };

      console.log("🪑 Submitting furniture booking payload:", payload);

      const url = `${this.apiBaseUrl}/booking/furniture/bookings?location_id=${this.locationId}`;
      console.log("📡 Booking API URL:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("✅ Furniture booking created successfully:", data);

      return { success: true, data };
    } catch (error) {
      console.error("❌ Furniture booking creation failed:", error);
      return { success: false, error: error.message, data: null };
    }
  }

  /**
   * Transform booking data for API submission
   */
  transformBookingData(data) {
    return {
      date: data.date,
      furniture_id: data.furnitureId,
      session_id: data.sessionId,
      customer_info: data.customerInfo,
      total_amount: data.totalAmount,
      guests: data.guests || 1,
    };
  }

  /**
   * Validate booking data before submission
   */
  validateBookingData(data) {
    const errors = [];

    if (!data.date) {
      errors.push("Booking date is required");
    }

    if (!data.furnitureId) {
      errors.push("Furniture selection is required");
    }

    if (!data.sessionId) {
      errors.push("Session selection is required");
    }

    if (!data.customerInfo) {
      errors.push("Customer information is required");
    } else {
      if (!data.customerInfo.firstName) {
        errors.push("First name is required");
      }
      if (!data.customerInfo.lastName) {
        errors.push("Last name is required");
      }
      if (!data.customerInfo.email) {
        errors.push("Email is required");
      }
      if (!data.customerInfo.phone) {
        errors.push("Phone number is required");
      }
    }

    if (!data.totalAmount || data.totalAmount <= 0) {
      errors.push("Valid booking amount is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Alias methods to match the parent interface
  async createBooking(bookingData) {
    return await this.createFurnitureBooking(bookingData);
  }
}

export default FurnitureAdapter;
