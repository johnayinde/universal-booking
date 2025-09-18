# Universal Booking Widget - Complete Setup Guide

## 📋 Prerequisites

- Node.js 16+ and npm
- React 18+
- Your existing API endpoints running

## 🚀 Step-by-Step Setup

### 1. Create New React Project

```bash
npx create-react-app universal-booking-widget
cd universal-booking-widget
```

### 2. Install Required Dependencies

```bash
# Main dependencies
npm install lucide-react axios @headlessui/react

# Development dependencies
npm install -D tailwindcss @tailwindcss/forms autoprefixer postcss
npm install -D @babel/core @babel/preset-env @babel/preset-react
npm install -D babel-loader css-loader style-loader postcss-loader
npm install -D webpack webpack-cli terser-webpack-plugin mini-css-extract-plugin
```

### 3. Initialize Tailwind CSS

```bash
npx tailwindcss init -p
```

### 4. Copy All Project Files

Copy these files from the artifacts to your project:

**Package & Config Files:**

- `package.json` (merge with existing)
- `tailwind.config.js`
- `postcss.config.js`
- `.env.example` → `.env`
- `.gitignore`

**Source Code:**

```
src/
├── core/
│   ├── BusinessAdapter.js
│   ├── AdapterFactory.js
│   ├── UniversalAPIService.js
│   ├── UniversalStateManager.js
│   └── BookingEngine.js
├── business-types/
│   └── events/
│       ├── EventAdapter.js
│       └── components/
│           ├── EventList.jsx
│           ├── EventDetails.jsx
│           ├── TicketSelection.jsx
│           ├── EventBookingForm.jsx
│           └── EventConfirmation.jsx
├── components/
│   └── UniversalBookingWidget.jsx
├── App.js
├── App.css
├── index.js
└── widget.js
```

**Build Scripts:**

- `scripts/build-widget.js`

**Documentation:**

- `README.md`
- `SETUP.md` (this file)

### 5. Update Your Environment

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your API URL:

```env
REACT_APP_API_BASE_URL=http://127.0.0.1:8000/api
REACT_APP_DEBUG=true
```

### 6. Test Development Setup

```bash
# Start development server
npm start
```

The app should open at `http://localhost:3000` with:

- Development widget automatically loaded
- Test button in top-right corner
- Console logs showing widget status

### 7. Test with Your API

Click the "Test Widget" button and verify:

- Events load from your API
- Event details display correctly
- Ticket selection works
- Booking form submits to your API

### 8. Build Production Widget

```bash
# Build the production widget
npm run build:widget
```

This creates:

- `dist/universal-booking-widget.min.js` - Main widget file
- `dist/examples/` - Integration examples

### 9. Test Integration Examples

```bash
# Serve the built files locally
npm run serve

# Or use Python
cd dist && python -m http.server 8080

# Open integration examples
# http://localhost:8080/examples/basic-integration.html
# http://localhost:8080/examples/advanced-integration.html
```

## 🔧 Troubleshooting

### Common Issues & Solutions

**1. "Module not found" errors**

```bash
# Make sure all dependencies are installed
npm install
```

**2. Tailwind styles not loading**

```bash
# Ensure postcss.config.js exists
# Check that App.css imports are correct
```

**3. API CORS issues**

```bash
# Add your domain to API CORS settings
# Or use a proxy in development
```

**4. Widget not opening**

```javascript
// Check browser console for errors
// Verify widget API is loaded
console.log(window.UniversalBookingWidget);
```

**5. Build script fails**

```bash
# Install missing webpack dependencies
npm install -D webpack webpack-cli babel-loader
```

## 🧪 Testing Checklist

### Development Testing

- [ ] `npm start` runs without errors
- [ ] Widget opens with test button
- [ ] Events load from your API
- [ ] All booking steps work
- [ ] Booking submission succeeds
- [ ] Console shows no errors

### Production Testing

- [ ] `npm run build:widget` completes successfully
- [ ] Example HTML files work
- [ ] Widget loads from built file
- [ ] All functionality works in examples
- [ ] No console errors in production

### API Integration Testing

- [ ] Events list loads correctly
- [ ] Event details fetch properly
- [ ] Tickets/sub-items load
- [ ] Categories load (if implemented)
- [ ] Booking creation works
- [ ] Error handling works for failed requests

## 📁 File Structure Verification

Your final project should look like:

```
universal-booking-widget/
├── public/
│   └── index.html
├── src/
│   ├── core/
│   │   ├── BusinessAdapter.js
│   │   ├── AdapterFactory.js
│   │   ├── UniversalAPIService.js
│   │   ├── UniversalStateManager.js
│   │   └── BookingEngine.js
│   ├── business-types/
│   │   └── events/
│   │       ├── EventAdapter.js
│   │       └── components/ (5 files)
│   ├── components/
│   │   └── UniversalBookingWidget.jsx
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── widget.js
├── scripts/
│   └── build-widget.js
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── .env
├── .env.example
├── .gitignore
├── README.md
└── SETUP.md
```

## 🎯 Next Steps After Setup

### 1. Customize for Your Brand

```javascript
// Update default configuration in src/App.js
const defaultConfig = {
  branding: {
    primaryColor: "#your-brand-color",
    companyName: "Your Company Name",
  },
};
```

### 2. Add New Business Types

```javascript
// Create new adapter in src/business-types/hotel/
// Follow the EventAdapter pattern
// Register in AdapterFactory.js
```

### 3. Deploy to Production

```bash
# Upload dist/universal-booking-widget.min.js to your CDN
# Update integration examples with your CDN URL
# Test on your target websites
```

## 🆘 Getting Help

If you run into issues:

1. **Check the console** for error messages
2. **Verify API endpoints** are working
3. **Test with the examples** first
4. **Check network tab** for failed requests
5. **Compare with working setup** in the artifacts

The setup should take about 15-30 minutes if you follow these steps exactly. The widget is designed to work immediately with your existing event API endpoints!
