// widget.js
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./App.css";

/**
 * Universal Booking Widget API for external websites
 */
class UniversalBookingWidgetAPI {
  constructor() {
    this.instances = new Map();
    this.globalConfig = {
      businessType: "events", // Default business type
      apiBaseUrl: "http://127.0.0.1:8000/api",
      theme: "light",
      branding: {
        primaryColor: "#3b82f6",
        companyName: "Universal Booking",
      },
      autoShow: false,
      position: "bottom-right",
    };
    this.autoInitialized = false;
  }

  /**
   * Initialize widget with configuration
   * @param {object} config - Widget configuration
   * @returns {object} Widget instance
   */
  init(config = {}) {
    const widgetId = `ubw-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const mergedConfig = { ...this.globalConfig, ...config };

    // Detect business type from identifier if provided
    if (config.identifier && !config.businessType) {
      mergedConfig.businessType = this.mapIdentifierToBusinessType(
        config.identifier
      );
    }

    // Create container
    const container = document.createElement("div");
    container.id = widgetId;
    container.style.cssText = "position: relative; z-index: 9999;";
    document.body.appendChild(container);

    // Create React root and render
    const root = createRoot(container);
    root.render(React.createElement(App, { config: mergedConfig }));

    // Auto-open widget if autoShow is true
    if (mergedConfig.autoShow) {
      setTimeout(() => {
        this.openWidget(widgetId);
      }, 100);
    }

    // Store instance
    const instance = {
      id: widgetId,
      container,
      root,
      config: mergedConfig,
      destroy: () => this.destroy(widgetId),
      open: () => this.openWidget(widgetId),
      close: () => this.closeWidget(widgetId),
    };

    this.instances.set(widgetId, instance);
    return instance;
  }

  /**
   * Map legacy identifiers to business types
   * @param {string} identifier
   * @returns {string}
   */
  mapIdentifierToBusinessType(identifier) {
    const mapping = {
      events: "events",
      ticketing: "events",
      hotel: "hotel",
      restaurant: "restaurant",
      udh: "udh",
      tour: "tour",
      conference: "events", // Map to events for now
      fitness: "fitness",
    };

    return mapping[identifier] || "events";
  }

  /**
   * Auto-initialize widget (for backward compatibility)
   * @param {object} config
   * @returns {object}
   */
  autoInit(config = {}) {
    if (this.autoInitialized) {
      return;
    }

    const mergedConfig = { ...this.globalConfig, ...config, autoShow: true };
    this.autoInitialized = true;
    return this.init(mergedConfig);
  }

  /**
   * Open a specific widget instance
   * @param {string} widgetId
   */
  openWidget(widgetId) {
    const instance = this.instances.get(widgetId);
    if (instance) {
      // Dispatch custom event to open widget
      const event = new CustomEvent("ubw:open-widget", {
        detail: { widgetId },
      });
      instance.container.dispatchEvent(event);
    }
  }

  /**
   * Close a specific widget instance
   * @param {string} widgetId
   */
  closeWidget(widgetId) {
    const instance = this.instances.get(widgetId);
    if (instance) {
      // Dispatch custom event to close widget
      const event = new CustomEvent("ubw:close-widget", {
        detail: { widgetId },
      });
      instance.container.dispatchEvent(event);
    }
  }

  /**
   * Destroy specific widget instance
   * @param {string} widgetId
   * @returns {boolean}
   */
  destroy(widgetId) {
    const instance = this.instances.get(widgetId);
    if (instance) {
      instance.root.unmount();
      if (instance.container.parentNode) {
        instance.container.parentNode.removeChild(instance.container);
      }
      this.instances.delete(widgetId);
      return true;
    }
    return false;
  }

  /**
   * Destroy all widget instances
   */
  destroyAll() {
    this.instances.forEach((instance, widgetId) => {
      this.destroy(widgetId);
    });
  }

  /**
   * Get all active instances
   * @returns {array}
   */
  getInstances() {
    return Array.from(this.instances.values());
  }

  /**
   * Update global configuration
   * @param {object} config
   */
  configure(config) {
    this.globalConfig = { ...this.globalConfig, ...config };
  }

  /**
   * Get current configuration
   * @returns {object}
   */
  getConfig() {
    return { ...this.globalConfig };
  }

  /**
   * Get supported business types
   * @returns {array}
   */
  getSupportedBusinessTypes() {
    return ["events", "hotel", "restaurant", "udh", "tour", "fitness"];
  }

  /**
   * Check if business type is supported
   * @param {string} businessType
   * @returns {boolean}
   */
  isBusinessTypeSupported(businessType) {
    return this.getSupportedBusinessTypes().includes(businessType);
  }
}

// Create global instance
const widgetAPI = new UniversalBookingWidgetAPI();

// Expose API globally
if (typeof window !== "undefined") {
  window.UniversalBookingWidget = widgetAPI;

  // Backward compatibility
  window.EventBookingWidget = widgetAPI;

  // Auto-initialize on DOM ready
  const initializeWidget = () => {
    // Get config from script tag attributes
    const scriptTag = document.querySelector(
      'script[src*="universal-booking-widget"], script[src*="event-booking-widget"]'
    );

    let autoConfig = {};

    if (scriptTag) {
      const configAttrs = {};
      Array.from(scriptTag.attributes).forEach((attr) => {
        if (attr.name.startsWith("data-")) {
          const key = attr.name
            .replace("data-", "")
            .replace(/-([a-z])/g, (g) => g[1].toUpperCase());
          configAttrs[key] = attr.value;
        }
      });

      // Parse complex config
      if (configAttrs.config) {
        try {
          autoConfig = { ...autoConfig, ...JSON.parse(configAttrs.config) };
        } catch (e) {
          console.warn(
            "UniversalBookingWidget: Invalid config in script data-config"
          );
        }
      }

      // Simple attributes
      if (configAttrs.identifier) {
        autoConfig.businessType = widgetAPI.mapIdentifierToBusinessType(
          configAttrs.identifier
        );
        autoConfig.identifier = configAttrs.identifier;
      }
      if (configAttrs.businessType)
        autoConfig.businessType = configAttrs.businessType;
      if (configAttrs.theme) autoConfig.theme = configAttrs.theme;
      if (configAttrs.primaryColor) {
        autoConfig.branding = {
          ...autoConfig.branding,
          primaryColor: configAttrs.primaryColor,
        };
      }
      if (configAttrs.companyName) {
        autoConfig.branding = {
          ...autoConfig.branding,
          companyName: configAttrs.companyName,
        };
      }
      if (configAttrs.apiBaseUrl)
        autoConfig.apiBaseUrl = configAttrs.apiBaseUrl;
      if (configAttrs.position) autoConfig.position = configAttrs.position;
      if (configAttrs.autoShow === "true") autoConfig.autoShow = true;
    }

    // Look for trigger elements with data attributes
    const triggers = document.querySelectorAll(
      "[data-event-booking], [data-universal-booking]"
    );

    triggers.forEach((trigger) => {
      if (trigger.hasAttribute("data-ubw-initialized")) {
        return;
      }

      const identifier =
        trigger.getAttribute("data-event-booking") ||
        trigger.getAttribute("data-universal-booking");
      const configAttr = trigger.getAttribute("data-config");

      let config = {
        identifier,
        businessType: widgetAPI.mapIdentifierToBusinessType(identifier),
        autoShow: false,
      };

      // Parse config if provided
      if (configAttr) {
        try {
          config = { ...config, ...JSON.parse(configAttr) };
        } catch (e) {
          console.warn(
            "UniversalBookingWidget: Invalid config JSON in data-config attribute:",
            e
          );
        }
      }

      // Initialize widget on click
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        const widget = widgetAPI.init(config);
        widget.open();
      });

      // Mark as initialized
      trigger.setAttribute("data-ubw-initialized", "true");
    });

    // Auto-initialize if autoShow is enabled
    if (autoConfig.autoShow) {
      widgetAPI.autoInit(autoConfig);
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeWidget);
  } else {
    initializeWidget();
  }
}

export default widgetAPI;
