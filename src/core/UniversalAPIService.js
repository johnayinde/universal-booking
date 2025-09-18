import axios from "axios";

/**
 * Universal API Service that adapts to different business types
 */
class UniversalAPIService {
  constructor(adapter, baseUrl) {
    this.adapter = adapter;
    this.baseUrl = baseUrl || "http://127.0.0.1:8000/api";
    this.apiConfig = adapter.getAPIConfig();

    // Create axios instance with default config
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Setup response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error("API Error:", error);
        return Promise.reject(this.formatError(error));
      }
    );
  }

  /**
   * Format API errors consistently
   * @param {object} error
   * @returns {object}
   */
  formatError(error) {
    if (error.response) {
      return {
        success: false,
        error: error.response.data.message || "An error occurred",
        status: error.response.status,
        data: error.response.data,
      };
    } else if (error.request) {
      return {
        success: false,
        error: "Network error - please check your connection",
        status: 0,
      };
    } else {
      return {
        success: false,
        error: error.message || "An unexpected error occurred",
        status: 0,
      };
    }
  }

  /**
   * Get available items (events, rooms, tours, etc.)
   * @param {object} filters
   * @returns {Promise}
   */
  async getAvailableItems(filters = {}) {
    try {
      const endpoint = this.apiConfig.endpoints.list;
      const response = await this.client.get(endpoint, { params: filters });

      return {
        success: true,
        data: response.data.data || response.data,
        meta: response.data.meta || {},
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  /**
   * Get item details
   * @param {string|number} id
   * @returns {Promise}
   */
  async getItemDetails(id) {
    try {
      const endpoint = this.apiConfig.endpoints.details.replace("{id}", id);
      const response = await this.client.get(endpoint);

      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  /**
   * Get sub-items (tickets, room types, etc.)
   * @param {string|number} id
   * @returns {Promise}
   */
  async getSubItems(id) {
    try {
      if (!this.apiConfig.endpoints.subItems) {
        return { success: true, data: [] };
      }

      const endpoint = this.apiConfig.endpoints.subItems.replace("{id}", id);
      const response = await this.client.get(endpoint);

      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  /**
   * Get categories
   * @returns {Promise}
   */
  async getCategories() {
    try {
      if (!this.apiConfig.endpoints.categories) {
        return { success: true, data: [] };
      }

      const response = await this.client.get(
        this.apiConfig.endpoints.categories
      );

      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  /**
   * Create a booking
   * @param {object} bookingData
   * @returns {Promise}
   */
  async createBooking(bookingData) {
    try {
      // Transform data using the adapter
      const transformedData = this.adapter.transformBookingData(bookingData);

      const response = await this.client.post(
        this.apiConfig.endpoints.booking,
        transformedData
      );

      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  /**
   * Update booking
   * @param {string|number} id
   * @param {object} updateData
   * @returns {Promise}
   */
  async updateBooking(id, updateData) {
    try {
      if (!this.apiConfig.endpoints.updateBooking) {
        throw new Error("Update booking endpoint not configured");
      }

      const endpoint = this.apiConfig.endpoints.updateBooking.replace(
        "{id}",
        id
      );
      const response = await this.client.put(endpoint, updateData);

      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  /**
   * Cancel booking
   * @param {string|number} id
   * @returns {Promise}
   */
  async cancelBooking(id) {
    try {
      if (!this.apiConfig.endpoints.cancelBooking) {
        throw new Error("Cancel booking endpoint not configured");
      }

      const endpoint = this.apiConfig.endpoints.cancelBooking.replace(
        "{id}",
        id
      );
      const response = await this.client.delete(endpoint);

      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  /**
   * Format date for API
   * @param {Date|string} date
   * @returns {string}
   */
  formatDate(date) {
    if (!date) return "";

    const d = new Date(date);
    return d.toISOString().split("T")[0];
  }

  /**
   * Format datetime for API
   * @param {Date|string} datetime
   * @returns {string}
   */
  formatDateTime(datetime) {
    if (!datetime) return "";

    const d = new Date(datetime);
    return d.toISOString();
  }
}

export default UniversalAPIService;
