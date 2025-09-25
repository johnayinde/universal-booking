// src/core/UniversalAPIService.js - CORRECTED for Entry API Endpoints
class UniversalAPIService {
  constructor(config = {}) {
    this.baseURL =
      config.apiBaseUrl ||
      process.env.REACT_APP_API_BASE_URL ||
      "http://127.0.0.1:8000/api";
    this.timeout = config.timeout || 30000;
    this.headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...config.headers,
    };

    console.log("🔧 UniversalAPIService initialized:", {
      baseURL: this.baseURL,
      timeout: this.timeout,
    });
  }

  /**
   * Make HTTP request with enhanced error handling
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const config = {
      headers: { ...this.headers, ...options.headers },
      signal: controller.signal,
      ...options,
    };

    console.log(`🌐 API Request: ${options.method || "GET"} ${url}`, {
      body: options.body ? JSON.parse(options.body) : null,
    });

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      let data;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        console.error(`❌ API Error ${response.status}:`, data);
        throw new Error(
          data.message ||
            data.error ||
            `HTTP ${response.status}: ${response.statusText}`
        );
      }

      console.log(`✅ API Success: ${options.method || "GET"} ${url}`, data);
      return { success: true, data, status: response.status };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === "AbortError") {
        console.error("⏱️ API Request timeout:", url);
        throw new Error(
          "Request timeout. Please check your connection and try again."
        );
      }

      console.error("❌ API Request failed:", error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: "GET" });
  }

  /**
   * POST request
   */
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ===========================================
  // ENTRY-SPECIFIC API METHODS (CORRECTED)
  // ===========================================

  /**
   * Get entry ticket types for a specific location
   */
  async getEntryTicketTypes(locationId = 2) {
    try {
      console.log(
        `🔍 Fetching entry ticket types for location ${locationId}...`
      );

      const result = await this.get("/booking/entry/type", {
        landmark_location_id: locationId,
      });

      if (result.success && result.data) {
        // Transform the data if needed
        let types = result.data;

        if (!Array.isArray(types)) {
          if (types.data && Array.isArray(types.data)) {
            types = types.data;
          } else {
            throw new Error("Invalid response format - expected array");
          }
        }

        // Ensure proper structure
        const transformedTypes = types.map((type) => ({
          id: type.id,
          name: type.name || "Entry Ticket",
          description: type.description || "Standard entry access",
          features: type.features || {},
          is_active: type.is_active !== false,
          fast_track: type.features?.fast_track || false,
          created_at: type.created_at,
          updated_at: type.updated_at,
        }));

        console.log("✅ Entry ticket types loaded:", transformedTypes);
        return transformedTypes;
      }

      throw new Error("No data received from server");
    } catch (error) {
      console.error("❌ Failed to fetch entry ticket types:", error);
      throw error;
    }
  }

  /**
   * Get entry ticket items for a specific type
   */
  async getEntryTicketItems(typeId, locationId = 2) {
    try {
      console.log(
        `🔍 Fetching entry ticket items for type ${typeId}, location ${locationId}...`
      );

      const result = await this.get("/booking/entry/items", {
        type_id: typeId,
        platform: "web",
        landmark_location_id: locationId,
      });

      if (result.success && result.data) {
        // Transform the data if needed
        let items = result.data;

        if (!Array.isArray(items)) {
          if (items.data && Array.isArray(items.data)) {
            items = items.data;
          } else {
            throw new Error("Invalid response format - expected array");
          }
        }

        // Ensure proper structure
        const transformedItems = items.map((item) => ({
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

        console.log("✅ Entry ticket items loaded:", transformedItems);
        return transformedItems;
      }

      throw new Error("No data received from server");
    } catch (error) {
      console.error("❌ Failed to fetch entry ticket items:", error);
      throw error;
    }
  }

  /**
   * Create entry booking with Paystack integration
   */
  async createEntryBooking(bookingData) {
    try {
      console.log("🎫 Creating entry booking:", bookingData);

      // Validate required fields
      if (!bookingData.customer_info) {
        throw new Error("Customer information is required");
      }

      if (!bookingData.tickets || bookingData.tickets.length === 0) {
        throw new Error("At least one ticket is required");
      }

      if (!bookingData.total_amount || bookingData.total_amount <= 0) {
        throw new Error("Valid total amount is required");
      }

      // Transform booking data for new API structure
      const payload = {
        date: bookingData.date || new Date().toISOString().split("T")[0],
        platform: "web",
        ticket_type_id: bookingData.ticket_type_id || 1,
        ticket_type: bookingData.ticket_type || "Regular",
        email: bookingData.customer_info.email,
        first_name: bookingData.customer_info.first_name,
        last_name: bookingData.customer_info.last_name,
        phone: bookingData.customer_info.phone,
        items: bookingData.tickets.map((ticket) => ({
          item_id: ticket.ticket_id || ticket.id,
          item_name: ticket.name || ticket.item_name || "Adult",
          quantity: ticket.quantity,
          price: ticket.price,
        })),
      };

      console.log("📤 Sending entry booking payload:", payload);

      // Use the new endpoint structure
      const result = await this.request(
        `/booking/entry/create-booking?location_id=${this.locationId}`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      if (result.success && result.data && result.data.status) {
        const response = result.data.data;

        console.log("✅ Entry booking created successfully:", response);

        return {
          success: true,
          data: {
            booking_reference: response.booking.booking_ref,
            booking_id: response.booking.id,
            payment_url: response.payment.payment_url,
            payment_reference: response.payment.reference,
            access_code: response.payment.access_code,
            amount: response.booking.total_amount,
            currency: "NGN",
            ...response,
          },
        };
      }

      throw new Error(
        result.data?.msg || "Invalid response from booking service"
      );
    } catch (error) {
      console.error("❌ Entry booking creation failed:", error);
      return {
        success: false,
        error: error.message || "Failed to create entry booking",
        data: null,
      };
    }
  }

  /**
   * Get entry booking status
   */
  async getEntryBookingStatus(bookingReference) {
    try {
      console.log(`🔍 Fetching entry booking status for: ${bookingReference}`);

      const result = await this.get(
        `/booking/entry/${bookingReference}/status`
      );

      if (result.success && result.data) {
        console.log("✅ Entry booking status retrieved:", result.data);
        return result;
      }

      throw new Error("No booking status data received");
    } catch (error) {
      console.error("❌ Failed to fetch entry booking status:", error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  /**
   * Get entry booking details
   */
  async getEntryBookingDetails(bookingReference) {
    try {
      console.log(`🔍 Fetching entry booking details for: ${bookingReference}`);

      const result = await this.get(`/booking/entry/${bookingReference}`);

      if (result.success && result.data) {
        console.log("✅ Entry booking details retrieved:", result.data);
        return result;
      }

      throw new Error("No booking details received");
    } catch (error) {
      console.error("❌ Failed to fetch entry booking details:", error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  // ===========================================
  // LEGACY COMPATIBILITY METHODS
  // ===========================================

  /**
   * Legacy method for backward compatibility
   */
  async getTicketTypes(locationId = 2) {
    return this.getEntryTicketTypes(locationId);
  }

  /**
   * Legacy method for backward compatibility
   */
  async getTicketItems(locationId = 2, typeId) {
    return this.getEntryTicketItems(typeId, locationId);
  }

  /**
   * Legacy method for backward compatibility
   */
  async createBooking(bookingData) {
    // Determine if this is an entry booking based on structure
    if (bookingData.entry_tickets || bookingData.landmark_location_id) {
      return this.createEntryBooking(bookingData);
    }

    // Default to entry booking for now
    return this.createEntryBooking(bookingData);
  }

  // ===========================================
  // GENERAL API METHODS
  // ===========================================

  /**
   * Verify payment status
   */
  async verifyPayment(paymentReference) {
    try {
      console.log(`🔍 Verifying payment: ${paymentReference}`);

      const result = await this.request(
        `/payment/verify?reference=${paymentReference}`,
        {
          method: "POST",
        }
      );

      if (result.success && result.data) {
        console.log("✅ Payment verified successfully:", result.data);
        return result;
      }

      throw new Error("Payment verification failed");
    } catch (error) {
      console.error("Failed to verify payment:", error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  /**
   * Handle payment callback
   */
  async handlePaymentCallback(reference, status) {
    try {
      console.log(`🔄 Processing payment callback: ${reference} - ${status}`);

      return await this.post("/payments/callback", {
        reference,
        status,
        processed_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to handle payment callback:", error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  /**
   * Test API connectivity
   */
  async testConnection() {
    try {
      const startTime = Date.now();
      const result = await this.get("/health");
      const responseTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          ...result.data,
          response_time: responseTime,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: { status: "unreachable" },
      };
    }
  }

  /**
   * Update API configuration
   */
  updateConfig(newConfig) {
    if (newConfig.apiBaseUrl) {
      this.baseURL = newConfig.apiBaseUrl;
    }
    if (newConfig.timeout) {
      this.timeout = newConfig.timeout;
    }
    if (newConfig.headers) {
      this.headers = { ...this.headers, ...newConfig.headers };
    }

    console.log("🔧 API Service config updated:", {
      baseURL: this.baseURL,
      timeout: this.timeout,
    });
  }
}

// Singleton instance
let apiServiceInstance = null;

/**
 * Get singleton instance of API service
 */
export const getAPIService = (config) => {
  if (!apiServiceInstance) {
    apiServiceInstance = new UniversalAPIService(config);
  } else if (config) {
    apiServiceInstance.updateConfig(config);
  }
  return apiServiceInstance;
};

export default UniversalAPIService;
