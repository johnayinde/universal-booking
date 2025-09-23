// src/core/UniversalAPIService.js
import ConfigManager from "./ConfigManager";

class UniversalAPIService {
  constructor() {
    this.cache = new Map();
    this.requestInterceptors = [];
    this.responseInterceptors = [];
  }

  // Add request interceptor
  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
  }

  // Add response interceptor
  addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor);
  }

  // Apply request interceptors
  applyRequestInterceptors(config) {
    return this.requestInterceptors.reduce(
      (config, interceptor) => interceptor(config),
      config
    );
  }

  // Apply response interceptors
  applyResponseInterceptors(response) {
    return this.responseInterceptors.reduce(
      (response, interceptor) => interceptor(response),
      response
    );
  }

  // Generic fetch method with interceptors
  async fetch(url, options = {}) {
    // Apply request interceptors
    const config = this.applyRequestInterceptors({
      url,
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    try {
      console.log(`🌐 API Request: ${config.method || "GET"} ${config.url}`);

      const response = await fetch(config.url, {
        method: config.method || "GET",
        headers: config.headers,
        body: config.body,
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      const result = {
        success: response.ok,
        status: response.status,
        data: response.ok ? data : null,
        error: !response.ok ? data : null,
      };

      // Apply response interceptors
      return this.applyResponseInterceptors(result);
    } catch (error) {
      console.error("🚨 API Error:", error);
      return {
        success: false,
        status: 0,
        data: null,
        error: error.message,
      };
    }
  }

  // Get ticket types for entry bookings
  async getTicketTypes(locationId) {
    try {
      const url = ConfigManager.getApiUrl(locationId, "entry", "list");
      const response = await this.fetch(url);
      console.log("Ticket Types Response>>>>>>:", response);

      if (response.success && Array.isArray(response.data.data)) {
        return response.data.data.map((type) => ({
          id: type.id,
          name: type.name,
          description: type.description,
          features: type.features || {},
          is_active: type.is_active,
          fast_track: type.features?.fast_track || false,
          created_at: type.created_at,
          updated_at: type.updated_at,
        }));
      }

      throw new Error(response.error || "Failed to fetch ticket types");
    } catch (error) {
      console.error("Error fetching ticket types:", error);
      throw error;
    }
  }

  // Get ticket items for a specific type
  async getTicketItems(locationId, typeId) {
    try {
      const url = ConfigManager.getApiUrl(locationId, "entry", "items", {
        typeId,
      });
      const response = await this.fetch(url);

      if (response.success && Array.isArray(response.data.data)) {
        return response.data.data.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: parseFloat(item.price) || 0,
          max_per_guest: item.max_per_guest || 2,
          image_url: item.image_url,
          type: item.type,
          category: item.category,
          benefits: item.benefits || [],
          terms_conditions: item.terms_conditions || {},
          no_refund: item.terms_conditions?.no_refund || true,
        }));
      }

      throw new Error(response.error || "Failed to fetch ticket items");
    } catch (error) {
      console.error("Error fetching ticket items:", error);
      throw error;
    }
  }

  // Create booking
  async createBooking(locationId, bookableType, bookingData) {
    try {
      const config = ConfigManager.getBookableConfig(locationId, bookableType);
      const url = config.base + "/create-booking";

      const response = await this.fetch(url, {
        method: "POST",
        body: JSON.stringify({
          ...bookingData,
          location_id: locationId,
        }),
      });

      if (response.success) {
        return response.data;
      }

      throw new Error(response.error || "Failed to create booking");
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
  }

  // Hotel specific methods (placeholder for future implementation)
  async getHotelRoomTypes(locationId) {
    const url = ConfigManager.getApiUrl(locationId, "hotel", "list");
    // Implementation will be added when hotel adapter is created
    throw new Error("Hotel booking not implemented yet");
  }

  async getHotelRooms(locationId, roomTypeId) {
    const url = ConfigManager.getApiUrl(locationId, "hotel", "items", {
      typeId: roomTypeId,
    });
    // Implementation will be added when hotel adapter is created
    throw new Error("Hotel booking not implemented yet");
  }

  // UDH specific methods (placeholder for future implementation)
  async getUDHExperiences(locationId) {
    const url = ConfigManager.getApiUrl(locationId, "udh", "list");
    // Implementation will be added when UDH adapter is created
    throw new Error("UDH booking not implemented yet");
  }

  async getUDHPackages(locationId, experienceId) {
    const url = ConfigManager.getApiUrl(locationId, "udh", "items", {
      typeId: experienceId,
    });
    // Implementation will be added when UDH adapter is created
    throw new Error("UDH booking not implemented yet");
  }

  // Cache management
  getCacheKey(method, params) {
    return `${method}_${JSON.stringify(params)}`;
  }

  cacheResponse(key, data, ttl = 300000) {
    // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  getCachedResponse(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > cached.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clearCache() {
    this.cache.clear();
  }
}

export default new UniversalAPIService();
