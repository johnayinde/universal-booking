# Universal Booking Widget

A flexible, universal booking widget that can be embedded into any website to provide booking functionality for multiple business types including events, hotels, restaurants, tours, and more.

## 🌟 Features

- **🎯 Multi-Business Support**: Events, Hotels, Restaurants, Tours, UDH experiences
- **🔌 Easy Integration**: Simple script tag implementation
- **🎨 Customizable**: Brand colors, company name, and theming
- **📱 Responsive Design**: Works perfectly on all device sizes
- **⚡ Performance**: Optimized bundle size and loading
- **🔄 Universal API**: Adapts to different backend systems
- **🎪 Event Focus**: Starting with comprehensive event ticketing

## 🚀 Quick Start

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd universal-booking-widget

# Install dependencies
npm install

# Start development server
npm start

# Build the widget
npm run build:widget
```

### 2. Basic Integration

Add the widget to any website:

```html
<!-- Load the widget -->
<script src="https://your-cdn.com/universal-booking-widget.min.js"></script>

<!-- Add booking buttons -->
<button data-event-booking="events">Book Event Tickets</button>
<button data-universal-booking="hotel">Book Hotel Room</button>
```

### 3. Advanced Configuration

```html
<!-- With custom configuration -->
<button
  data-event-booking="events"
  data-config='{"branding": {"primaryColor": "#059669", "companyName": "Your Company"}}'
>
  Book Tickets
</button>
```

### 4. Programmatic Usage

```javascript
// Initialize widget programmatically
const widget = UniversalBookingWidget.init({
  businessType: "events",
  apiBaseUrl: "https://your-api.com/api",
  branding: {
    primaryColor: "#3b82f6",
    companyName: "Your Company",
  },
});

// Open the widget
widget.open();

// Control widget lifecycle
widget.close();
widget.destroy();
```

## 🏗️ Architecture

### Core Components

```
src/
├── core/
│   ├── BookingEngine.js          # Main orchestration engine
│   ├── BusinessAdapter.js        # Abstract adapter interface
│   ├── AdapterFactory.js         # Creates business-specific adapters
│   ├── UniversalAPIService.js    # Universal API abstraction
│   └── UniversalStateManager.js  # Global state management
├── business-types/
│   └── events/                   # Event-specific implementation
│       ├── EventAdapter.js       # Event business logic
│       └── components/           # Event-specific components
├── components/
│   └── UniversalBookingWidget.jsx # Main widget UI
└── widget.js                    # External integration API
```

### Business Adapter Pattern

Each business type implements the `BusinessAdapter` interface:

```javascript
class EventAdapter extends BusinessAdapter {
  getBusinessType() { return 'events'; }
  getComponents() { return { list, details, selection, booking }; }
  getAPIConfig() { return { endpoints: {...} }; }
  transformBookingData(data) { /* Transform for API */ }
  validateBookingData(data) { /* Validate booking */ }
}
```

## 🎪 Event Booking Flow

The widget currently implements a comprehensive event booking system:

1. **Event List** - Browse and filter available events
2. **Event Details** - View comprehensive event information
3. **Ticket Selection** - Select ticket types and quantities
4. **Booking Form** - Capture customer information
5. **Confirmation** - Display booking confirmation and details

### Event API Integration

The widget integrates with these API endpoints:

```
GET  /lca/events/list              # Get events list
GET  /lca/events/detail/{id}       # Get event details
GET  /lca/events/seat-tickets/{id} # Get event tickets
GET  /lca/events/categories        # Get categories
POST /lca/create-booking           # Create booking
```

## 🔧 Configuration

### Script Tag Configuration

```html
<script
  src="universal-booking-widget.min.js"
  data-business-type="events"
  data-primary-color="#3b82f6"
  data-company-name="Your Company"
  data-api-base-url="https://api.yourcompany.com"
></script>
```

### JavaScript Configuration

```javascript
UniversalBookingWidget.configure({
  businessType: "events",
  apiBaseUrl: "https://api.yourcompany.com",
  branding: {
    primaryColor: "#3b82f6",
    companyName: "Your Company",
    logoUrl: "https://your-logo.png",
  },
  theme: "light",
});
```

## 🎨 Customization

### Brand Colors

The widget supports custom brand colors:

```javascript
UniversalBookingWidget.init({
  branding: {
    primaryColor: "#059669", // Your brand color
    companyName: "Your Company",
  },
});
```

### Theme Support

```javascript
// Light theme (default)
{
  theme: "light";
}

// Dark theme (coming soon)
{
  theme: "dark";
}
```

## 🛠️ Development

### Adding New Business Types

1. **Create Adapter**:

```javascript
// src/business-types/hotel/HotelAdapter.js
class HotelAdapter extends BusinessAdapter {
  getBusinessType() {
    return "hotel";
  }
  // Implement required methods...
}
```

2. **Register Adapter**:

```javascript
// src/core/AdapterFactory.js
import HotelAdapter from '../business-types/hotel/HotelAdapter';

static adapters = {
  events: EventAdapter,
  hotel: HotelAdapter,  // Add here
  // ...
};
```

3. **Create Components**:

```javascript
// src/business-types/hotel/components/
├── HotelList.jsx
├── HotelDetails.jsx
├── RoomSelection.jsx
├── HotelBookingForm.jsx
└── HotelConfirmation.jsx
```

### Development Scripts

```bash
# Start development server
npm start

# Build production widget
npm run build:widget

# Run tests
npm test

# Lint code
npm run lint

# Serve built widget locally
npm run serve
```

### API Development

The widget expects consistent API responses:

```javascript
// Success response
{
  "success": true,
  "data": [...],
  "meta": { ... }
}

// Error response
{
  "success": false,
  "error": "Error message",
  "status": 400
}
```

## 📦 Building & Deployment

### Build Widget

```bash
npm run build:widget
```

This creates:

- `dist/universal-booking-widget.min.js` - Main widget bundle
- `dist/examples/` - Integration examples

### CDN Deployment

1. Upload `universal-booking-widget.min.js` to your CDN
2. Update integration examples with your CDN URL
3. Test with the example HTML files

### Integration Examples

After building, check the examples:

- `dist/examples/basic-integration.html`
- `dist/examples/advanced-integration.html`

## 🎯 Business Types Roadmap

### ✅ Implemented

- **Events** - Full event ticketing system

### 🚧 Planned

- **Hotels** - Room booking and reservations
- **Restaurants** - Table reservations
- **UDH (Upside Down House)** - Experience bookings
- **Tours** - Tour and travel bookings
- **Fitness** - Class and trainer bookings

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/hotel-booking`
3. **Add business adapter**: Implement `BusinessAdapter` interface
4. **Create components**: Build booking flow components
5. **Update factory**: Register adapter in `AdapterFactory`
6. **Test integration**: Use example files to test
7. **Submit PR**: Include documentation and examples

### Code Style

- Use functional React components with hooks
- Follow adapter pattern for business types
- Implement comprehensive error handling
- Add proper TypeScript types (future enhancement)
- Write tests for critical functionality

## 📋 API Requirements

For new business types, implement these endpoints:

```
GET  /api/{business}/list           # Get available items
GET  /api/{business}/detail/{id}    # Get item details
GET  /api/{business}/sub-items/{id} # Get sub-items (tickets, rooms, etc.)
GET  /api/{business}/categories     # Get categories (optional)
POST /api/{business}/booking        # Create booking
```

## 🔍 Browser Support

- **Chrome**: 60+
- **Firefox**: 60+
- **Safari**: 12+
- **Edge**: 79+
- **Mobile Safari**: 12+
- **Chrome Mobile**: 60+

### Polyfills

For older browsers, include polyfills:

```html
<!-- For IE11 support -->
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6,array-includes,promise,fetch"></script>
<script src="universal-booking-widget.min.js"></script>
```

## 📊 Bundle Information

- **Main bundle**: ~150KB minified + gzipped
- **Dependencies**: React, Axios, Lucide Icons
- **Loading**: Asynchronous, won't block page render
- **Performance**: Optimized with code splitting

## 🔐 Security

- **Input validation**: All form inputs are validated
- **XSS protection**: Proper data sanitization
- **HTTPS**: Requires HTTPS in production
- **API security**: Supports authentication headers

## 🧪 Testing

### Manual Testing

```bash
# Build widget
npm run build:widget

# Test with examples
open dist/examples/basic-integration.html
open dist/examples/advanced-integration.html
```

### API Testing

Test with your API endpoints:

```javascript
// Test API connectivity
UniversalBookingWidget.configure({
  apiBaseUrl: "https://your-api.com/api",
});

const widget = UniversalBookingWidget.init({
  businessType: "events",
});
```

## 🚀 Production Deployment

### Environment Setup

```bash
# Set production API URL
REACT_APP_API_BASE_URL=https://api.yourcompany.com npm run build:widget

# Deploy to CDN
aws s3 cp dist/universal-booking-widget.min.js s3://your-cdn-bucket/
```

### Integration Checklist

- [ ] Upload widget to CDN
- [ ] Test API endpoints
- [ ] Verify CORS configuration
- [ ] Test on target websites
- [ ] Monitor error logging
- [ ] Setup analytics tracking

## 📈 Analytics & Events

The widget emits custom events for tracking:

```javascript
// Listen for booking events
document.addEventListener("ubw:booking-completed", (event) => {
  console.log("Booking completed:", event.detail);
  // Send to your analytics
});

// Available events:
// - ubw:widget-opened
// - ubw:widget-closed
// - ubw:item-selected
// - ubw:booking-started
// - ubw:booking-completed
// - ubw:error
```

## 🤖 API Reference

### Widget API Methods

```javascript
// Initialize widget
UniversalBookingWidget.init(config);

// Control widgets
widget.open();
widget.close();
widget.destroy();

// Global controls
UniversalBookingWidget.destroyAll();
UniversalBookingWidget.configure(config);
UniversalBookingWidget.getConfig();

// Information
UniversalBookingWidget.getSupportedBusinessTypes();
UniversalBookingWidget.isBusinessTypeSupported(type);
UniversalBookingWidget.getInstances();
```

### Configuration Options

```javascript
{
  businessType: 'events',           // Business type
  apiBaseUrl: 'https://api...',     // API base URL
  theme: 'light',                   // Theme (light/dark)
  autoShow: false,                  // Auto-open widget
  position: 'bottom-right',         // Position (future)
  branding: {
    primaryColor: '#3b82f6',        // Brand color
    companyName: 'Your Company',    // Company name
    logoUrl: 'https://logo.png'     // Logo URL (future)
  },
  locale: 'en-US',                  // Locale (future)
  currency: 'USD'                   // Currency (future)
}
```

## 🐛 Debugging

### Enable Debug Mode

```javascript
// Enable console logging
UniversalBookingWidget.configure({
  debug: true,
});

// Check widget status
console.log(UniversalBookingWidget.getInstances());
console.log(UniversalBookingWidget.getConfig());
```

### Common Issues

1. **Widget not opening**: Check console for errors
2. **API errors**: Verify endpoint URLs and CORS
3. **Styling issues**: Check CSS conflicts
4. **Loading errors**: Verify script URL and network

## 📞 Support

For technical support and questions:

- **GitHub Issues**: Create an issue for bugs/features
- **Documentation**: Check README and code comments
- **Examples**: Use integration examples as reference
- **API**: Ensure your API matches expected format

## 🎉 Conclusion

The Universal Booking Widget provides a solid foundation for multi-business booking functionality. Starting with comprehensive event ticketing, it's designed to easily extend to hotels, restaurants, tours, and other booking types.

The clean adapter pattern architecture ensures each business type can have customized logic while sharing common functionality like state management, API integration, and UI components.

**Ready to get started?**

1. Run `npm install && npm start` for development
2. Run `npm run build:widget` for production
3. Check `dist/examples/` for integration examples
4. Implement your business adapter following the `EventAdapter` pattern

Happy booking! 🎫✨
