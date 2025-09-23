// src/core/ConfigManager.js
export class ConfigManager {
  constructor() {
    this.locations = {
      1: {
        id: 1,
        name: "Lagos",
        displayName: "Nike Lake Resort, Lagos",
        endpoints: {
          entry: {
            base: "http://entry.landmarkafrica.com/api/booking",
            list: "/entry/type?landmark_location_id={locationId}",
            items: "/entry/items?type_id={typeId}&platform=web",
          },
          hotel: {
            base: "http://hotel.landmarkafrica.com/api/booking",
            list: "/rooms/types?location_id={locationId}",
            items: "/rooms/available?type_id={typeId}&location_id={locationId}",
          },
          udh: {
            base: "http://udh.landmarkafrica.com/api/booking",
            list: "/experiences?location_id={locationId}",
            items: "/packages?experience_id={typeId}&location_id={locationId}",
          },
        },
      },
      2: {
        id: 2,
        name: "Enugu",
        displayName: "Nike Lake Resort, Enugu",
        endpoints: {
          entry: {
            base: "http://entry.landmarkafrica.com/api/booking",
            list: "/entry/type?landmark_location_id={locationId}",
            items: "/entry/items?type_id={typeId}&platform=web",
          },
          hotel: {
            base: "http://hotel.landmarkafrica.com/api/booking",
            list: "/rooms/types?location_id={locationId}",
            items: "/rooms/available?type_id={typeId}&location_id={locationId}",
          },
          udh: {
            base: "http://udh.landmarkafrica.com/api/booking",
            list: "/experiences?location_id={locationId}",
            items: "/packages?experience_id={typeId}&location_id={locationId}",
          },
        },
      },
    };

    this.bookableTypes = {
      entry: {
        id: "entry",
        name: "Entry Ticket",
        description: "Access to facilities and grounds",
        implemented: true,
      },
      hotel: {
        id: "hotel",
        name: "Hotel",
        description: "Accommodation and room bookings",
        implemented: false,
      },
      udh: {
        id: "udh",
        name: "Upside Down House",
        description: "Unique upside-down house experience",
        implemented: false,
      },
    };
  }

  getLocation(locationId) {
    return this.locations[locationId];
  }

  getBookableConfig(locationId, bookableType) {
    const location = this.getLocation(locationId);
    if (!location || !location.endpoints[bookableType]) {
      throw new Error(
        `No configuration found for ${bookableType} at location ${locationId}`
      );
    }

    return {
      ...location.endpoints[bookableType],
      locationId,
      bookableType,
    };
  }

  getApiUrl(locationId, bookableType, endpoint, params = {}) {
    const config = this.getBookableConfig(locationId, bookableType);
    let url = config.base + config[endpoint];

    // Replace placeholders with actual values
    url = url.replace("{locationId}", locationId);
    Object.keys(params).forEach((key) => {
      url = url.replace(`{${key}}`, params[key]);
    });

    return url;
  }

  getAvailableBookables(locationId) {
    const location = this.getLocation(locationId);
    if (!location) return [];

    return Object.keys(location.endpoints).map((type) => ({
      ...this.bookableTypes[type],
      available: true,
    }));
  }
}

export default new ConfigManager();
