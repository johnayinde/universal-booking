//build-widget.js
const webpack = require("webpack");
const path = require("path");
const fs = require("fs");

// Widget-specific Webpack configuration
const widgetConfig = {
  mode: "production",
  entry: "./src/widget.js",
  output: {
    path: path.resolve(__dirname, "../dist"),
    filename: "universal-booking-widget.min.js",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              ["@babel/preset-env", { targets: "defaults" }],
              ["@babel/preset-react", { runtime: "automatic" }],
            ],
            plugins: [
              "@babel/plugin-proposal-class-properties",
              "@babel/plugin-syntax-dynamic-import",
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [require("tailwindcss"), require("autoprefixer")],
              },
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production"),
      "process.env.REACT_APP_API_BASE_URL": JSON.stringify(
        process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api"
      ),
    }),
  ],
  optimization: {
    minimize: true,
  },
  externals: {
    // Don't bundle these if they're available globally
    // react: 'React',
    // 'react-dom': 'ReactDOM'
  },
};

// Create dist directory if it doesn't exist
const distDir = path.resolve(__dirname, "../dist");
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Run webpack build
console.log("🚀 Building Universal Booking Widget...");
console.log("📁 Output directory:", distDir);

webpack(widgetConfig, (err, stats) => {
  if (err || stats.hasErrors()) {
    console.error("❌ Build failed:");
    if (err) {
      console.error(err.stack || err);
      if (err.details) {
        console.error(err.details);
      }
    }

    if (stats && stats.hasErrors()) {
      const info = stats.toJson();
      console.error(info.errors);
    }

    process.exit(1);
  }

  const info = stats.toJson();

  console.log("✅ Widget built successfully!");
  console.log(`📦 Bundle size: ${(info.assets[0].size / 1024).toFixed(2)} KB`);
  console.log("📄 Generated files:");

  info.assets.forEach((asset) => {
    console.log(`   - ${asset.name}`);
  });

  // Create example HTML files
  createExampleFiles();

  console.log("\n🎉 Build complete! Widget is ready for deployment.");
  console.log("\n📖 Integration examples:");
  console.log("   - dist/examples/basic-integration.html");
  console.log("   - dist/examples/advanced-integration.html");
  console.log("\n🌐 CDN Integration:");
  console.log(
    '   <script src="https://your-cdn.com/universal-booking-widget.min.js"></script>'
  );
});

// Create example integration files
function createExampleFiles() {
  const examplesDir = path.join(distDir, "examples");
  if (!fs.existsSync(examplesDir)) {
    fs.mkdirSync(examplesDir);
  }

  // Basic integration example
  const basicExample = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Universal Booking Widget - Basic Integration</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; margin: 40px; }
        .demo-section { margin: 40px 0; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; }
        .btn { background: #3b82f6; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; margin: 8px; }
        .btn:hover { background: #2563eb; }
    </style>
</head>
<body>
    <h1>🎯 Universal Booking Widget Demo</h1>
    <p>Click the buttons below to test different business types:</p>

    <div class="demo-section">
        <h2>Event Ticketing</h2>
        <button data-event-booking="events" class="btn">Book Event Tickets</button>
        <button data-universal-booking="events" class="btn">Universal Events</button>
    </div>

    <div class="demo-section">
        <h2>Programmatic Usage</h2>
        <button onclick="openEventWidget()" class="btn">Open Event Widget</button>
        <button onclick="openCustomWidget()" class="btn">Custom Configuration</button>
        <button onclick="destroyAllWidgets()" class="btn">Close All Widgets</button>
    </div>

    <!-- Load the Universal Booking Widget -->
    <script src="../universal-booking-widget.min.js"></script>
    
    <script>
        function openEventWidget() {
            UniversalBookingWidget.init({
                businessType: 'events',
                branding: {
                    primaryColor: '#059669',
                    companyName: 'Demo Events'
                }
            }).open();
        }

        function openCustomWidget() {
            UniversalBookingWidget.init({
                businessType: 'events',
                apiBaseUrl: 'http://127.0.0.1:8000/api',
                branding: {
                    primaryColor: '#dc2626',
                    companyName: 'Custom Booking'
                }
            }).open();
        }

        function destroyAllWidgets() {
            UniversalBookingWidget.destroyAll();
        }

         // Wait for widget to be fully loaded
        if (typeof UniversalBookingWidget !== 'undefined') {
            console.log('✅ Universal Booking Widget loaded');
            console.log('📋 Available business types:', UniversalBookingWidget.getSupportedBusinessTypes());
        } else {
            console.log('⏳ Waiting for Universal Booking Widget to load...');
            window.addEventListener('load', function() {
                if (typeof UniversalBookingWidget !== 'undefined') {
                    console.log('✅ Universal Booking Widget loaded');
                    console.log('📋 Available business types:', UniversalBookingWidget.getSupportedBusinessTypes());
                }
            });
        }
    </script>
</body>
</html>`;

  // Advanced integration example
  const advancedExample = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Universal Booking Widget - Advanced Integration</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; margin: 40px; }
        .demo-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
        .demo-card { padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background: #f9fafb; }
        .btn { background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; margin: 4px; }
        .btn:hover { background: #2563eb; }
        .btn.secondary { background: #6b7280; }
        .btn.secondary:hover { background: #4b5563; }
        .code { background: #f3f4f6; padding: 12px; border-radius: 4px; font-family: monospace; font-size: 14px; margin: 8px 0; }
    </style>
</head>
<body>
    <h1>🎯 Universal Booking Widget - Advanced Demo</h1>
    
    <div class="demo-grid">
        <div class="demo-card">
            <h3>🎪 Event Ticketing</h3>
            <div class="code">businessType: 'events'</div>
            <button onclick="showDemo('events', '#3b82f6', 'EventHub')" class="btn">Demo Events</button>
        </div>

        <div class="demo-card">
            <h3>🏨 Hotel Booking</h3>
            <div class="code">businessType: 'hotel'</div>
            <button onclick="showDemo('hotel', '#10b981', 'Grand Hotel')" class="btn">Demo Hotel</button>
            <p><small>⚠️ Not implemented yet</small></p>
        </div>

        <div class="demo-card">
            <h3>🍽️ Restaurant</h3>
            <div class="code">businessType: 'restaurant'</div>
            <button onclick="showDemo('restaurant', '#f59e0b', 'Fine Dining')" class="btn">Demo Restaurant</button>
            <p><small>⚠️ Not implemented yet</small></p>
        </div>

        <div class="demo-card">
            <h3>🏠 Upside Down House</h3>
            <div class="code">businessType: 'udh'</div>
            <button onclick="showDemo('udh', '#8b5cf6', 'UDH Experience')" class="btn">Demo UDH</button>
            <p><small>⚠️ Not implemented yet</small></p>
        </div>
    </div>

    <div style="margin-top: 40px;">
        <h2>🛠️ Widget Controls</h2>
        <button onclick="getWidgetInfo()" class="btn secondary">Get Widget Info</button>
        <button onclick="destroyAll()" class="btn secondary">Destroy All</button>
    </div>

    <!-- Load the Universal Booking Widget -->
    <script src="../universal-booking-widget.min.js"></script>
    
    <script>
        function showDemo(businessType, color, companyName) {
            // Close existing widgets
            UniversalBookingWidget.destroyAll();
            
            // Open new widget
            setTimeout(() => {
                const widget = UniversalBookingWidget.init({
                    businessType: businessType,
                    branding: {
                        primaryColor: color,
                        companyName: companyName
                    },
                    apiBaseUrl: 'http://127.0.0.1:8000/api'
                });
                widget.open();
            }, 300);
        }

        function getWidgetInfo() {
            const instances = UniversalBookingWidget.getInstances();
            const config = UniversalBookingWidget.getConfig();
            
            alert(\`Active widgets: \${instances.length}
Supported types: \${UniversalBookingWidget.getSupportedBusinessTypes().join(', ')}
Current config: \${JSON.stringify(config, null, 2)}\`);
        }

        function destroyAll() {
            UniversalBookingWidget.destroyAll();
            alert('All widgets destroyed!');
        }

        console.log('✅ Advanced demo loaded');
    </script>
</body>
</html>`;

  fs.writeFileSync(
    path.join(examplesDir, "basic-integration.html"),
    basicExample
  );
  fs.writeFileSync(
    path.join(examplesDir, "advanced-integration.html"),
    advancedExample
  );

  console.log("📝 Created example files:");
  console.log("   - examples/basic-integration.html");
  console.log("   - examples/advanced-integration.html");
}
