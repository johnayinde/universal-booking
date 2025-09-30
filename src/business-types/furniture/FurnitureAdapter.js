// src/business-types/furniture/FurnitureAdapter.js
import BusinessAdapter from "../../core/BusinessAdapter";

// Import components
import FurnitureDateSelection from "./components/FurnitureDateSelection";
import FurniturePersonalInfo from "./components/FurniturePersonalInfo";
import FurnitureConfirmation from "./components/FurnitureConfirmation";
import { Calendar, User, Check, CheckCheck, Clock } from "lucide-react";

/**
 * Furniture Adapter for furniture booking system
 * Reuses entry booking design patterns with furniture-specific flow
 */
class FurnitureAdapter extends BusinessAdapter {
  constructor(config = {}) {
    super(config);

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
      selection: FurniturePersonalInfo, // Maps to "selection" step
      booking: FurniturePersonalInfo, // Alternative mapping
      confirmation: FurnitureConfirmation, // Maps to "confirmation" step
      // Also add the original mappings for compatibility
      dateSelection: FurnitureDateSelection,
    };
  }

  getAPIConfig() {

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
        key: "list",
        label: "Date & Furniture",
        name: "Select Date & Furniture",
        component: "dateSelection",
        icon: Calendar,
        description: "Pick date and furniture type",
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
        icon: Check,
        description: "Review and confirm",
      },
    ];
  }

  /**
   * Get list of furniture for location
   */
  async getFurnitureList() {
    try {

      const url = `${this.apiBaseUrl}/booking/furniture/furniture-list?location_id=${this.locationId}`;

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

      // Handle the new API response format
      let furniture = [];
      if (data.status && data.data && Array.isArray(data.data)) {
        furniture = data.data;
      } else if (Array.isArray(data)) {
        furniture = data;
      } else {
        throw new Error(
          "Invalid response format - expected {status, data} structure"
        );
      }

      const transformedFurniture = furniture.map((item) => ({
        id: item.id,
        landmark_location_id: item.landmark_location_id,
        name: item.name || "",
        description: item.description || "",
        is_active: item.is_active,
        available_number: item.available_number || 0,
        reserved_number: item.reserved_number || 0,
        image_url: item.image_url,
        features: item.features || {},
        created_at: item.created_at,
        updated_at: item.updated_at,
       
      }));

      return transformedFurniture;
    } catch (error) {
      console.error("❌ Failed to load furniture list:", error);
      throw error;
    }
  }

  /**
   * Get available sessions for furniture and date
   */
  async getFurnitureSessions(date, furnitureId, platform = "web") {
    try {
     
      const url = `${this.apiBaseUrl}/booking/furniture/sessions?date=${date}&furniture_id=${furnitureId}&platform=${platform}`;

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

      // Handle the new API response format
      let sessions = [];
      if (data.status && data.data && Array.isArray(data.data)) {
        sessions = data.data;
      } else if (Array.isArray(data)) {
        sessions = data;
      } else {
        throw new Error("Invalid sessions response format");
      }

      const transformedSessions = sessions.map((session) => ({
        id: session.id,
        session_name: session.session_name,
        start_time: session.start_time,
        end_time: session.end_time,
        duration_hours: session.duration_hours,
        price: parseFloat(session.price) || 0,
       
      }));

      return transformedSessions;
    } catch (error) {
      console.error("❌ Failed to load sessions:", error);
      throw error;
    }
  }

  /**
   * Check furniture availability (UPDATED with correct response format)
   */
  async checkFurnitureAvailability(furnitureId, date, sessionId) {
    try {
     
      const url = `${this.apiBaseUrl}/booking/furniture/availability`;

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

      // UPDATED: Handle new API response format
      if (data.status && data.data && Array.isArray(data.data)) {
        // Find the session we're checking for
        const sessionAvailability = data.data.find(
          (session) => session.session_id === sessionId
        );

        if (sessionAvailability) {
          return {
            session_id: sessionAvailability.session_id,
            session_name: sessionAvailability.session_name,
            start_time: sessionAvailability.start_time,
            end_time: sessionAvailability.end_time,
            duration_hours: sessionAvailability.duration_hours,
            total: sessionAvailability.total,
            booked: sessionAvailability.booked,
            available: sessionAvailability.available,
            // For backward compatibility
            furniture_id: furnitureId,
            date: date,
          };
        } else {
          // Session not found in availability data
          throw new Error("Session not found in availability data");
        }
      } else {
        throw new Error("Invalid availability response format");
      }
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

      // Validate required fields
      if (!bookingData.customer_info) {
        throw new Error("Customer information is required");
      }

      if (!bookingData.session_id) {
        throw new Error("Session selection is required");
      }

      if (!bookingData.date) {
        throw new Error("Booking date is required");
      }

      // UPDATED: New API payload format matching your specification
      const payload = {
        date: bookingData.date,
        platform: "web",
        session_id: bookingData.session_id,
        session_name: bookingData.session_name || "",
        email: bookingData.customer_info.email,
        first_name: bookingData.customer_info.firstName,
        last_name: bookingData.customer_info.lastName,
        phone: bookingData.customer_info.phone,
        items: [
          {
            item_id: bookingData.furniture_id,
            item_name: bookingData.furniture_name || "",
            quantity: bookingData.quantity || 1,
            price: bookingData.total_amount || 0,
          },
        ],
      };


      const url = `${this.apiBaseUrl}/booking/furniture/bookings?location_id=${this.locationId}`;

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

      // UPDATED: Handle expected response format
      if (data.status && data.data) {
        return {
          success: true,
          data: data.data, // This contains {booking, payment, customer}
          message: data.msg,
          code: data.code,
        };
      } else {
        // Fallback for unexpected format
        return { success: true, data };
      }
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
