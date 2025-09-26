// src/business-types/group/GroupAdapter.js
import BusinessAdapter from "../../core/BusinessAdapter";

// Import components
import GroupDatePackageSelection from "./components/GroupDatePackageSelection";
import GroupPackageOptions from "./components/GroupPackageOptions";
import GroupPackageDetails from "./components/GroupPackageDetails";
import GroupPersonalInfo from "./components/GroupPersonalInfo";
import GroupConfirmation from "./components/GroupConfirmation";
import {
  Calendar,
  Ticket,
  User,
  Check,
  CheckCheck,
  Clock,
  Info,
  Package,
} from "lucide-react";

/**
 * Group Adapter for group booking system
 * Follows the same design patterns as entry and furniture booking
 */
class GroupAdapter extends BusinessAdapter {
  constructor(config = {}) {
    super(config);
    console.log("👥 GroupAdapter initialized with config:", config);

    // Set up API base URL
    this.apiBaseUrl = config.apiBaseUrl || "http://127.0.0.1:8000/api";
    this.locationId = config.locationId || config.location || 1;
  }

  getBusinessType() {
    return "group";
  }

  getComponents() {
    console.log("🧩 GroupAdapter: Getting components");
    return {
      list: GroupDatePackageSelection, // Maps to "list" step (date + package size selection)
      details: GroupPackageOptions, // Maps to "details" step (package options horizontal scroll)
      selection: GroupPackageDetails, // Maps to "selection" step (package details)
      booking: GroupPersonalInfo, // Maps to "booking" step (personal info + payment)
      confirmation: GroupConfirmation, // Maps to "confirmation" step
      // Also add the original mappings for compatibility
      datePackageSelection: GroupDatePackageSelection,
      packageOptions: GroupPackageOptions,
      packageDetails: GroupPackageDetails,
      personalInfo: GroupPersonalInfo,
    };
  }

  getAPIConfig() {
    console.log(
      `🔧 GroupAdapter: Getting API config for location ${this.locationId}`
    );

    return {
      endpoints: {
        packageSizes: `/booking/package/package-size?location_id=${this.locationId}`,
        packageOptions: `/booking/package/list?location_id=${this.locationId}`,
        booking: `/booking/package/bookings?location_id=${this.locationId}`,
      },
      baseUrl: this.apiBaseUrl,
      locationId: this.locationId,
    };
  }

  getBookingSteps() {
    return [
      {
        key: "list",
        label: "Date & Package Size",
        name: "Select Date & Package Size",
        component: "list",
        icon: Calendar,
        description: "Choose your date and group size",
      },
      {
        key: "details",
        label: "Package Options",
        name: "Package Options",
        component: "details",
        icon: Package,
        description: "Browse available package options",
      },
      {
        key: "selection",
        label: "Package Details",
        name: "Package Details",
        component: "selection",
        icon: Info,
        description: "Review package details",
      },
      {
        key: "booking",
        label: "Personal Details",
        name: "Personal Details",
        component: "booking",
        icon: User,
        description: "Enter your information and payment",
      },
      {
        key: "confirmation",
        label: "Confirmation",
        name: "Confirmation",
        component: "confirmation",
        icon: Check,
        description: "Booking confirmed",
      },
    ];
  }

  getDefaultConfig() {
    return {
      ...super.getDefaultConfig(),
      branding: {
        primaryColor: "#059669", // Green for group bookings
        companyName: "Nike Lake Resort",
        logoUrl: "",
      },
      currency: "NGN",
      currencySymbol: "₦",
      locationId: this.locationId,
    };
  }

  getLabels() {
    return {
      ...super.getLabels(),
      title: "Group Booking",
      subtitle: "Book group packages and experiences",
      bookingTitle: "Complete Your Group Booking",
      bookingSubtitle: "Enter your details to proceed",
    };
  }

  /**
   * Fetch available package sizes for the location
   */
  async fetchPackageSizes() {
    console.log(`🔍 Fetching package sizes for location ${this.locationId}...`);
    try {
      const url = `${this.apiBaseUrl}/booking/package/package-size?location_id=${this.locationId}`;
      console.log("📡 API URL:", url);

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
      console.log("📦 Raw package sizes response:", data);

      // Transform the data to a consistent format
      let packageSizes = [];
      if (data.status && Array.isArray(data.data)) {
        packageSizes = data.data.map((pkg) => ({
          id: pkg.id,
          name: pkg.name,
          size: pkg.number_of_people,
          description: `Package for ${pkg.number_of_people} people`,
          min_people: pkg.number_of_people,
          max_people: pkg.number_of_people,
          is_active: pkg.is_active === 1,
          created_at: pkg.created_at,
          updated_at: pkg.updated_at,
        }));
      } else {
        throw new Error("Invalid response format");
      }

      console.log("✅ Processed package sizes:", packageSizes);
      return {
        success: true,
        data: packageSizes,
        count: packageSizes.length,
      };
    } catch (error) {
      console.error("❌ Failed to fetch package sizes:", error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  /**
   * Fetch package options for a specific package size
   */
  // CHANGE the entire method around line 110:
  async fetchPackageOptions(packageSizeId, date) {
    try {
      const url = `${this.apiBaseUrl}/booking/package/list?location_id=${this.locationId}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          package_size_id: packageSizeId,
          data: date, // Note: API expects "data" not "date"
          platform: "web",
        }),
      });

      const data = await response.json();

      let packageOptions = [];
      if (data.status && Array.isArray(data.data)) {
        packageOptions = data.data.map((option) => ({
          id: option.id,
          name: option.title,
          description: option.description,
          price: option.price,
          image_url: option.image,
          features: option.benefits ? option.benefits.map((b) => b.name) : [],
          benefits: option.benefits || [],
          is_active: true,
        }));
      }

      return { success: true, data: packageOptions };
    } catch (error) {
      return { success: false, error: error.message, data: [] };
    }
  }

  /**
   * Fetch package details for a specific package option
   */
  async fetchPackageDetails(packageOptionId) {
    console.log(`🔍 Fetching package details for option ${packageOptionId}...`);
    try {
      const url = `${this.apiBaseUrl}/booking/group/package-details/${packageOptionId}`;
      console.log("📡 API URL:", url);

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
      console.log("📦 Raw package details response:", data);

      let packageDetails = data;
      if (data.data) {
        packageDetails = data.data;
      }

      console.log("✅ Processed package details:", packageDetails);
      return {
        success: true,
        data: packageDetails,
      };
    } catch (error) {
      console.error("❌ Failed to fetch package details:", error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  /**
   * Create group booking
   */
  async createBooking(bookingData) {
    console.log("👥 Creating group booking:", bookingData);
    try {
      const url = `${this.apiBaseUrl}/booking/package/bookings?location_id=${this.locationId}`;
      console.log("📡 Booking API URL:", url);

      // basic validation (unchanged) ...
      if (!bookingData.customer_info?.email)
        throw new Error("Valid email is required");
      if (!bookingData.customer_info?.first_name)
        throw new Error("First name is required");
      if (!bookingData.customer_info?.last_name)
        throw new Error("Last name is required");
      if (!bookingData.customer_info?.phone)
        throw new Error("Phone number is required");
      if (!bookingData.package_option_id)
        throw new Error("Package option is required");
      if (!bookingData.total_amount || bookingData.total_amount <= 0)
        throw new Error("Valid total amount is required");

      const payload = {
        date: bookingData.date,
        platform: "web",
        package_id: bookingData.package_option_id,
        package_name: bookingData.package_name || "Group Package",
        email: bookingData.customer_info.email,
        first_name: bookingData.customer_info.first_name,
        last_name: bookingData.customer_info.last_name,
        phone: bookingData.customer_info.phone,
        items: [
          {
            item_id: bookingData.package_option_id,
            item_name: bookingData.package_name || "Group Package",
            quantity: bookingData.group_size || 1,
            price: bookingData.total_amount,
          },
        ],
      };
      console.log("📤 Sending group booking payload:", payload);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Try to parse JSON safely
      let raw;
      const text = await response.text();
      try {
        raw = text ? JSON.parse(text) : {};
      } catch {
        raw = {
          status: response.ok,
          msg: text || response.statusText,
          code: response.status,
        };
      }

      // Normalize shape here 👇
      const normalized = {
        success: raw?.status === true,
        data: raw?.data ?? null,
        message: raw?.msg ?? raw?.message ?? null,
        code: raw?.code ?? response.status,
      };

      console.log("✅ Group booking created (normalized):", normalized);

      if (!response.ok || !normalized.success) {
        throw new Error(
          normalized.message ||
            `HTTP ${response.status}${raw?.msg ? `: ${raw.msg}` : ""}`
        );
      }

      return normalized;
    } catch (error) {
      console.error("❌ Group booking creation failed:", error);
      return {
        success: false,
        error: error.message || "Failed to create group booking",
        data: null,
        code: 0,
      };
    }
  }

  /**
   * Calculate total price
   */
  calculateTotal(packageOption, groupSize, additionalServices = []) {
    if (!packageOption) return 0;

    let total = parseFloat(packageOption.price || 0) * parseInt(groupSize || 1);

    // Add additional services if any
    if (additionalServices && additionalServices.length > 0) {
      additionalServices.forEach((service) => {
        if (service.selected && service.price) {
          total += parseFloat(service.price);
        }
      });
    }

    return total;
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount, options = {}) {
    const currency = options.currency || this.getDefaultConfig().currency;

    if (currency === "NGN") {
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    }

    return `${currency} ${parseFloat(amount).toLocaleString()}`;
  }

  /**
   * Validate booking data
   */
  validateBookingData(bookingData) {
    const errors = [];

    // Customer info validation
    if (!bookingData.customer_info?.first_name) {
      errors.push("First name is required");
    }
    if (!bookingData.customer_info?.last_name) {
      errors.push("Last name is required");
    }
    if (!bookingData.customer_info?.email) {
      errors.push("Email is required");
    }
    if (!bookingData.customer_info?.phone) {
      errors.push("Phone number is required");
    }

    // Booking specific validation
    if (!bookingData.package_option_id) {
      errors.push("Package option must be selected");
    }
    if (!bookingData.date) {
      errors.push("Booking date is required");
    }
    if (!bookingData.group_size || bookingData.group_size <= 0) {
      errors.push("Valid group size is required");
    }
    if (!bookingData.total_amount || bookingData.total_amount <= 0) {
      errors.push("Total amount must be greater than zero");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default GroupAdapter;
