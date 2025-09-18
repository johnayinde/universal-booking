import EventAdapter from "../business-types/events/EventAdapter";
// Future adapters to be imported here
// import HotelAdapter from '../business-types/hotel/HotelAdapter';
// import UDHAdapter from '../business-types/udh/UDHAdapter';
// import RestaurantAdapter from '../business-types/restaurant/RestaurantAdapter';

/**
 * Factory for creating business type adapters
 */
class AdapterFactory {
  static adapters = {
    events: EventAdapter,
    ticketing: EventAdapter, // Alias for events
    // hotel: HotelAdapter,
    // udh: UDHAdapter,
    // restaurant: RestaurantAdapter,
  };

  /**
   * Create a business adapter based on the business type
   * @param {string} businessType
   * @param {object} config
   * @returns {BusinessAdapter}
   */
  static create(businessType, config = {}) {
    const AdapterClass = this.adapters[businessType];

    if (!AdapterClass) {
      throw new Error(`Unsupported business type: ${businessType}`);
    }

    return new AdapterClass(config);
  }

  /**
   * Get all available business types
   * @returns {array}
   */
  static getAvailableTypes() {
    return Object.keys(this.adapters);
  }

  /**
   * Check if a business type is supported
   * @param {string} businessType
   * @returns {boolean}
   */
  static isSupported(businessType) {
    return businessType in this.adapters;
  }

  /**
   * Register a new business adapter
   * @param {string} businessType
   * @param {class} AdapterClass
   */
  static register(businessType, AdapterClass) {
    this.adapters[businessType] = AdapterClass;
  }
}

export default AdapterFactory;
