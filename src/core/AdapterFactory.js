// src/core/AdapterFactory.js
import EventAdapter from "../business-types/events/EventAdapter";
import EntryAdapter from "../business-types/entry/EntryAdapter";

/**
 * Factory for creating business-specific adapters
 */
class AdapterFactory {
  static adapters = {
    events: EventAdapter,
    entry: EntryAdapter,
    // Add other business types here as they are implemented
    // hotel: HotelAdapter,
    // restaurant: RestaurantAdapter,
    // udh: UDHAdapter,
    // tour: TourAdapter,
    // fitness: FitnessAdapter,
  };

  /**
   * Create an adapter instance for the specified business type
   * @param {string} businessType - The business type (e.g., 'events', 'entry', 'hotel')
   * @param {object} config - Configuration object
   * @returns {BusinessAdapter} Adapter instance
   */
  static createAdapter(businessType, config = {}) {
    const AdapterClass = this.adapters[businessType];

    if (!AdapterClass) {
      throw new Error(
        `Unsupported business type: ${businessType}. Supported types: ${Object.keys(
          this.adapters
        ).join(", ")}`
      );
    }

    return new AdapterClass(config);
  }

  /**
   * Get list of supported business types
   * @returns {string[]} Array of supported business type keys
   */
  static getSupportedBusinessTypes() {
    return Object.keys(this.adapters);
  }

  /**
   * Check if a business type is supported
   * @param {string} businessType - The business type to check
   * @returns {boolean} True if supported, false otherwise
   */
  static isSupported(businessType) {
    return businessType in this.adapters;
  }

  /**
   * Register a new business type adapter
   * @param {string} businessType - The business type key
   * @param {Class} AdapterClass - The adapter class
   */
  static registerAdapter(businessType, AdapterClass) {
    this.adapters[businessType] = AdapterClass;
  }

  /**
   * Get adapter metadata for all supported business types
   * @returns {object} Metadata for each business type
   */
  static getAdapterMetadata() {
    const metadata = {};

    Object.keys(this.adapters).forEach((businessType) => {
      try {
        const adapter = this.createAdapter(businessType);
        metadata[businessType] = {
          businessType: adapter.getBusinessType(),
          steps: adapter.getBookingSteps(),
          labels: adapter.getLabels(),
          defaultConfig: adapter.getDefaultConfig(),
        };
      } catch (error) {
        console.error(`Error getting metadata for ${businessType}:`, error);
        metadata[businessType] = {
          businessType,
          error: error.message,
        };
      }
    });

    return metadata;
  }
}

export default AdapterFactory;
