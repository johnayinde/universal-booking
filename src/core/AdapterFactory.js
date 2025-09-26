// src/core/AdapterFactory.js
import EntryAdapter from "../business-types/entry/EntryAdapter";
import FurnitureAdapter from "../business-types/furniture/FurnitureAdapter";
import GroupAdapter from "../business-types/group/GroupAdapter"; // NEW: Import GroupAdapter
/**
 * AdapterFactory - Creates business-specific adapters
 * Follows the Factory Pattern to provide consistent interface
 */
class AdapterFactory {
  static adapters = {
    entry: EntryAdapter,
    events: EntryAdapter, // Backward compatibility
    furniture: FurnitureAdapter, // ADD THIS LINE
    group: GroupAdapter,
    // udh: UDHAdapter,         // Coming soon
    // restaurant: RestaurantAdapter, // Future
    // tours: ToursAdapter,     // Future
  };

  /**
   * Create an adapter for the specified business type
   * @param {string} businessType - The type of business (entry, hotel, udh, etc.)
   * @param {object} config - Configuration options
   * @returns {BusinessAdapter} The adapter instance
   */
  static createAdapter(businessType, config = {}) {
    console.log(`🏭 AdapterFactory: Creating adapter for "${businessType}"`);

    const AdapterClass = this.adapters[businessType];
    if (!AdapterClass) {
      const supportedTypes = Object.keys(this.adapters).join(", ");
      throw new Error(
        `Unsupported business type: "${businessType}". Supported types: ${supportedTypes}`
      );
    }

    const adapter = new AdapterClass(config);
    console.log(
      `✅ AdapterFactory: Created ${businessType} adapter successfully`
    );
    return adapter;
  }

  // Update the business type configuration
  static getBusinessTypeConfig() {
    return {
      entry: {
        name: "Entry Tickets",
        description: "Book entry tickets and passes",
        icon: "ticket",
        color: "blue",
        steps: ["list", "booking", "confirmation"],
      },
      furniture: {
        // Add this configuration
        name: "Furniture Booking",
        description: "Reserve furniture and time slots",
        icon: "armchair",
        color: "orange",
        steps: ["dateSelection", "sessionSelection", "booking", "confirmation"],
      },
      group: {
        // NEW: Group booking configuration
        name: "Group Booking",
        description: "Book group packages and experiences",
        icon: "users",
        color: "emerald",
        steps: ["list", "details", "selection", "booking", "confirmation"],
      },
      events: {
        name: "Event Tickets",
        description: "Book event tickets and experiences",
        icon: "calendar",
        color: "purple",
        steps: ["list", "details", "selection", "booking", "confirmation"],
      },
    };
  }

  /**
   * Get list of supported business types
   * @returns {string[]} Array of supported business type names
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
   * Register a new adapter
   * @param {string} businessType - The business type identifier
   * @param {class} AdapterClass - The adapter class
   */
  static registerAdapter(businessType, AdapterClass) {
    console.log(`📝 AdapterFactory: Registering ${businessType} adapter`);
    this.adapters[businessType] = AdapterClass;
  }

  /**
   * Get metadata for all adapters
   * @returns {object} Metadata object with information about each adapter
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
          implemented: true,
        };
      } catch (error) {
        console.error(`Error getting metadata for ${businessType}:`, error);
        metadata[businessType] = {
          businessType,
          error: error.message,
          implemented: false,
        };
      }
    });

    return metadata;
  }

  /**
   * Get adapter capabilities
   * @param {string} businessType - The business type
   * @returns {object} Capabilities object
   */
  static getAdapterCapabilities(businessType) {
    if (!this.isSupported(businessType)) {
      return {
        supported: false,
        capabilities: [],
      };
    }

    try {
      const adapter = this.createAdapter(businessType);
      return {
        supported: true,
        capabilities: {
          hasListView: !!adapter.getComponents().list,
          hasDetailsView: !!adapter.getComponents().details,
          hasSelection: !!adapter.getComponents().selection,
          hasBookingForm: !!adapter.getComponents().booking,
          hasConfirmation: !!adapter.getComponents().confirmation,
          apiEndpoints: adapter.getAPIConfig().endpoints,
          bookingSteps: adapter.getBookingSteps().length,
          customLabels: Object.keys(adapter.getLabels()).length > 0,
        },
      };
    } catch (error) {
      return {
        supported: false,
        error: error.message,
        capabilities: [],
      };
    }
  }

  /**
   * Validate adapter implementation
   * @param {string} businessType - The business type to validate
   * @returns {object} Validation result
   */
  static validateAdapter(businessType) {
    const validation = {
      isValid: false,
      errors: [],
      warnings: [],
    };

    if (!this.isSupported(businessType)) {
      validation.errors.push(
        `Business type "${businessType}" is not supported`
      );
      return validation;
    }

    try {
      const adapter = this.createAdapter(businessType);

      // Check required methods
      const requiredMethods = [
        "getBusinessType",
        "getComponents",
        "getAPIConfig",
        "getBookingSteps",
        "getLabels",
      ];

      requiredMethods.forEach((method) => {
        if (typeof adapter[method] !== "function") {
          validation.errors.push(`Missing required method: ${method}`);
        }
      });

      // Check components
      const components = adapter.getComponents();
      const requiredComponents = [
        "list",
        "details",
        "selection",
        "booking",
        "confirmation",
      ];

      requiredComponents.forEach((component) => {
        if (!components[component]) {
          validation.warnings.push(`Missing component: ${component}`);
        }
      });

      // Check API config
      const apiConfig = adapter.getAPIConfig();
      if (!apiConfig.endpoints) {
        validation.errors.push("Missing API endpoints configuration");
      }

      // Check booking steps
      const steps = adapter.getBookingSteps();
      if (!Array.isArray(steps) || steps.length === 0) {
        validation.errors.push("No booking steps defined");
      }

      validation.isValid = validation.errors.length === 0;
    } catch (error) {
      validation.errors.push(`Adapter validation failed: ${error.message}`);
    }

    return validation;
  }

  /**
   * NEW: Get booking flow information for group booking
   * @param {string} businessType - The business type
   * @returns {object} Booking flow details
   */
  static getBookingFlowInfo(businessType) {
    const flowInfo = {
      entry: {
        title: "Entry Booking Flow",
        steps: [
          "Select ticket type and quantity",
          "Enter personal details and pay",
          "Receive confirmation",
        ],
        features: [
          "Quick booking",
          "Multiple ticket types",
          "Instant confirmation",
        ],
      },
      furniture: {
        title: "Furniture Booking Flow",
        steps: [
          "Select date and furniture type",
          "Choose available time slot",
          "Enter personal details and pay",
          "Receive confirmation",
        ],
        features: ["Date selection", "Time slots", "Furniture types"],
      },
      group: {
        // NEW: Group booking flow details
        title: "Group Booking Flow",
        steps: [
          "Select date and package size",
          "Browse package options (horizontal scroll)",
          "View detailed package information",
          "Enter personal details and pay",
          "Receive confirmation",
        ],
        features: [
          "Package size selection",
          "Horizontal scrolling options",
          "Detailed package views",
          "Group-specific pricing",
          "Special requirements support",
        ],
      },
    };

    return (
      flowInfo[businessType] || {
        title: `${businessType} Booking Flow`,
        steps: ["Select options", "Enter details", "Complete booking"],
        features: ["Standard booking flow"],
      }
    );
  }
}

export default AdapterFactory;
