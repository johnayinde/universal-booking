/**
 * Abstract Business Adapter
 * Defines the interface that all business type adapters must implement
 */
class BusinessAdapter {
  constructor(config = {}) {
    this.config = config;
    this.businessType = this.getBusinessType();
  }

  /**
   * Get the business type identifier
   * @returns {string}
   */
  getBusinessType() {
    throw new Error("getBusinessType must be implemented by subclass");
  }

  /**
   * Get the components for this business type
   * @returns {object}
   */
  getComponents() {
    throw new Error("getComponents must be implemented by subclass");
  }

  /**
   * Get the API configuration for this business type
   * @returns {object}
   */
  getAPIConfig() {
    throw new Error("getAPIConfig must be implemented by subclass");
  }

  /**
   * Get the booking flow steps
   * @returns {array}
   */
  getBookingSteps() {
    throw new Error("getBookingSteps must be implemented by subclass");
  }

  /**
   * Transform booking data to API format
   * @param {object} bookingData
   * @returns {object}
   */
  transformBookingData(bookingData) {
    throw new Error("transformBookingData must be implemented by subclass");
  }

  /**
   * Validate booking data
   * @param {object} bookingData
   * @returns {object} { isValid, errors }
   */
  validateBookingData(bookingData) {
    throw new Error("validateBookingData must be implemented by subclass");
  }

  /**
   * Get default configuration for this business type
   * @returns {object}
   */
  getDefaultConfig() {
    return {
      theme: "light",
      branding: {
        primaryColor: "#3b82f6",
        companyName: "Universal Booking",
      },
    };
  }

  /**
   * Get business-specific labels and text
   * @returns {object}
   */
  getLabels() {
    return {
      title: "Booking",
      subtitle: "Select your booking",
      confirmButton: "Confirm Booking",
      backButton: "Back",
      nextButton: "Next",
    };
  }
}

export default BusinessAdapter;
