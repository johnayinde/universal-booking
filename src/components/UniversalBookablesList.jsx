// src/components/UniversalBookablesList.jsx
import React, { useState, useEffect } from "react";
import { useUniversalBooking } from "../core/UniversalStateManager";
import { ActionTypes } from "../core/UniversalStateManager";
import {
  Ticket,
  Hotel,
  UtensilsCrossed,
  Camera,
  Ship,
  Dumbbell,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Search,
  Filter,
  Star,
} from "lucide-react";

const UniversalBookablesList = () => {
  const { state, dispatch, apiService, setError, setLoading } =
    useUniversalBooking();

  const [bookables, setBookables] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredBookables, setFilteredBookables] = useState([]);

  // Load all bookables on component mount
  useEffect(() => {
    loadAllBookables();
  }, []);

  // Filter bookables when search or category changes
  useEffect(() => {
    filterBookables();
  }, [bookables, searchTerm, selectedCategory]);

  const loadAllBookables = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.get("/api/bookables/list");

      if (response.success && response.data) {
        setBookables(response.data.bookables || response.data);
      } else {
        // Fallback to default bookables if API fails
        setBookables(getDefaultBookables());
      }
    } catch (error) {
      console.error("Error loading bookables:", error);
      // Fallback to default bookables
      setBookables(getDefaultBookables());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultBookables = () => [
    {
      id: "entry",
      type: "entry",
      name: "Entry Tickets",
      description:
        "Access to Nike Lake Resort with beautiful waterfront views and recreational facilities.",
      price: 2000,
      currency: "NGN",
      category: "tickets",
      image: "/api/placeholder/300/200",
      rating: 4.8,
      duration: "Full Day",
      availability: "Available Daily",
      popular: true,
      features: [
        "Waterfront Access",
        "Recreational Facilities",
        "Photo Opportunities",
        "Peaceful Environment",
      ],
    },
    {
      id: "udh",
      type: "udh",
      name: "Upside Down House Experience",
      description:
        "Unique upside-down house experience with guided tours and interactive photo sessions.",
      price: 3500,
      currency: "NGN",
      category: "experiences",
      image: "/api/placeholder/300/200",
      rating: 4.9,
      duration: "45 minutes",
      availability: "Every 30 mins",
      popular: true,
      features: [
        "Guided Tour",
        "Photo Session",
        "Interactive Experience",
        "Unique Architecture",
      ],
    },
    {
      id: "hotel",
      type: "hotel",
      name: "Hotel Accommodation",
      description:
        "Comfortable rooms with lake views, modern amenities, and peaceful waterfront setting.",
      price: 25000,
      currency: "NGN",
      category: "accommodation",
      image: "/api/placeholder/300/200",
      rating: 4.7,
      duration: "Per Night",
      availability: "Check Availability",
      features: ["Lake View", "Modern Amenities", "Room Service", "WiFi"],
    },
    {
      id: "restaurant",
      type: "restaurant",
      name: "Restaurant Reservations",
      description:
        "Fine dining experience with local and international cuisine overlooking the lake.",
      price: 8000,
      currency: "NGN",
      category: "dining",
      image: "/api/placeholder/300/200",
      rating: 4.5,
      duration: "2-3 hours",
      availability: "Daily 7AM-10PM",
      features: [
        "Lake View Dining",
        "Local Cuisine",
        "International Menu",
        "Outdoor Seating",
      ],
    },
    {
      id: "tours",
      type: "tours",
      name: "Guided Tours",
      description:
        "Explore the resort and surrounding areas with knowledgeable local guides.",
      price: 5000,
      currency: "NGN",
      category: "experiences",
      image: "/api/placeholder/300/200",
      rating: 4.4,
      duration: "2 hours",
      availability: "Daily 9AM-5PM",
      features: [
        "Professional Guide",
        "Local Knowledge",
        "Group Tours",
        "Photo Stops",
      ],
    },
  ];

  const filterBookables = () => {
    let filtered = bookables;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.features?.some((feature) =>
            feature.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    setFilteredBookables(filtered);
  };

  const getBookableIcon = (type) => {
    const icons = {
      entry: Ticket,
      udh: Camera,
      hotel: Hotel,
      restaurant: UtensilsCrossed,
      tours: Ship,
      fitness: Dumbbell,
    };
    return icons[type] || Ticket;
  };

  const formatCurrency = (amount, currency = "NGN") => {
    const symbol = currency === "NGN" ? "₦" : currency;
    return `${symbol}${parseFloat(amount).toLocaleString()}`;
  };

  const handleBookNow = (bookable) => {
    // Create a new widget instance for the specific business type
    try {
      // Close current widget first
      if (window.UniversalBookingWidget) {
        window.UniversalBookingWidget.destroyAll();
      }

      // Create new widget with specific business type
      setTimeout(() => {
        const widget = window.UniversalBookingWidget.init({
          businessType: bookable.type,
          apiBaseUrl: state.config.apiBaseUrl,
          branding: {
            ...state.config.branding,
            companyName: `${state.config.branding.companyName} - ${bookable.name}`,
          },
          autoShow: true,
        });

        console.log(`Opening ${bookable.type} booking for:`, bookable.name);
      }, 100);
    } catch (error) {
      console.error("Error opening specific booking:", error);
      setError(`Failed to open ${bookable.name} booking. Please try again.`);
    }
  };

  const categories = [
    { key: "all", label: "All Categories", count: bookables.length },
    {
      key: "tickets",
      label: "Entry Tickets",
      count: bookables.filter((b) => b.category === "tickets").length,
    },
    {
      key: "experiences",
      label: "Experiences",
      count: bookables.filter((b) => b.category === "experiences").length,
    },
    {
      key: "accommodation",
      label: "Accommodation",
      count: bookables.filter((b) => b.category === "accommodation").length,
    },
    {
      key: "dining",
      label: "Dining",
      count: bookables.filter((b) => b.category === "dining").length,
    },
  ];

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading available bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-72 bg-white border-r border-gray-200 p-6">
        <div className="mb-8">
          <img
            src="/api/placeholder/80/60"
            alt="Nike Lake Resort"
            className="w-20 h-15 rounded-lg object-cover mb-4"
          />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Nike Lake Resort, Enugu
          </h2>
          <p className="text-gray-600 text-sm">
            Enjoy the perfect blend of business and leisure with peaceful
            waterfront setting.
          </p>
        </div>

        {/* Categories Filter */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  selectedCategory === category.key
                    ? "bg-orange-100 text-orange-700 border-l-4 border-orange-500"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{category.label}</span>
                  <span className="text-sm bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                    {category.count}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Why Choose Us?</h4>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Waterfront location</li>
            <li>• Professional service</li>
            <li>• Flexible booking options</li>
            <li>• 24/7 customer support</li>
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              What would you like to book today?
            </h1>
            <p className="text-gray-600 text-lg">
              Choose from our range of experiences, accommodation, and services
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search bookings..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Bookables Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookables.map((bookable) => {
              const Icon = getBookableIcon(bookable.type);

              return (
                <BookableCard
                  key={bookable.id}
                  bookable={bookable}
                  icon={Icon}
                  onBook={() => handleBookNow(bookable)}
                  formatCurrency={formatCurrency}
                />
              );
            })}
          </div>

          {/* No Results */}
          {filteredBookables.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No bookings found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search terms or selected category
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Bookable Card Component
const BookableCard = ({ bookable, icon: Icon, onBook, formatCurrency }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {/* Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        <img
          src={bookable.image}
          alt={bookable.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Popular Badge */}
        {bookable.popular && (
          <div className="absolute top-3 left-3">
            <div className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
              <Star size={14} />
              <span>Popular</span>
            </div>
          </div>
        )}

        {/* Price Badge */}
        <div className="absolute top-3 right-3">
          <div className="bg-white bg-opacity-95 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="font-bold text-gray-900">
              {formatCurrency(bookable.price, bookable.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
            <Icon size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg group-hover:text-orange-600 transition-colors">
              {bookable.name}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              {bookable.rating && (
                <div className="flex items-center space-x-1">
                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                  <span>{bookable.rating}</span>
                </div>
              )}
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Clock size={14} />
                <span>{bookable.duration}</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {bookable.description}
        </p>

        {/* Features */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {bookable.features?.slice(0, 2).map((feature, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {feature}
              </span>
            ))}
            {bookable.features?.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                +{bookable.features.length - 2} more
              </span>
            )}
          </div>
        </div>

        {/* Availability */}
        <div className="flex items-center space-x-2 mb-4 text-sm text-gray-600">
          <MapPin size={14} />
          <span>{bookable.availability}</span>
        </div>

        {/* Book Button */}
        <button
          onClick={onBook}
          className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2 group"
        >
          <span>Book Now</span>
          <ArrowRight
            size={16}
            className="group-hover:translate-x-1 transition-transform"
          />
        </button>
      </div>
    </div>
  );
};

export default UniversalBookablesList;
