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
  console.log("\n🔧 Testing Instructions:");
  console.log("   1. cd dist");
  console.log("   2. python -m http.server 8080");
  console.log(
    "   3. Open http://localhost:8080/examples/basic-integration.html"
  );
  console.log("   4. Click any button to test the widget");
});

// Create example integration files
function createExampleFiles() {
  const examplesDir = path.join(distDir, "examples");
  if (!fs.existsSync(examplesDir)) {
    fs.mkdirSync(examplesDir);
  }

  // Basic integration example - WORKING VERSION
  const basicExample = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Universal Booking Widget - Basic Integration</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; 
            margin: 40px; 
            background-color: #f9fafb;
            line-height: 1.6;
        }
        .demo-section { 
            margin: 30px 0; 
            padding: 25px; 
            border: 1px solid #e5e7eb; 
            border-radius: 12px; 
            background: white;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .demo-section h2 {
            margin-top: 0;
            color: #1f2937;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
        }
        .btn { 
            background: #3b82f6; 
            color: white; 
            padding: 12px 24px; 
            border: none; 
            border-radius: 8px; 
            cursor: pointer; 
            margin: 8px; 
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s ease;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
        .btn:hover { 
            background: #2563eb; 
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .btn.secondary {
            background: #6b7280;
        }
        .btn.secondary:hover {
            background: #4b5563;
        }
        .btn.success {
            background: #10b981;
        }
        .btn.success:hover {
            background: #059669;
        }
        .btn.danger {
            background: #ef4444;
        }
        .btn.danger:hover {
            background: #dc2626;
        }
        .status-bar {
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
            background: #f0f9ff;
            border-left: 4px solid #0ea5e9;
            color: #0369a1;
            font-weight: 500;
        }
        .console-output {
            background: #1f2937;
            color: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Courier New', monospace;
            font-size: 13px;
            margin: 15px 0;
            max-height: 300px;
            overflow-y: auto;
            border: 1px solid #374151;
        }
        .console-output .timestamp {
            color: #9ca3af;
        }
        .console-output .success {
            color: #10b981;
        }
        .console-output .error {
            color: #ef4444;
        }
        .console-output .info {
            color: #3b82f6;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 12px;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5rem;
            font-weight: 700;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 1.1rem;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 Universal Booking Widget</h1>
        <p>Basic Integration Testing Environment</p>
    </div>

    <div class="demo-section">
        <h2>📝 Data Attribute Triggers (Auto-initialized)</h2>
        <p>These buttons use data attributes and are automatically initialized when the page loads:</p>
        <button data-event-booking="events" class="btn">📅 Book Event Tickets</button>
        <button data-universal-booking="events" class="btn">🎪 Universal Events</button>
        <button 
            data-universal-booking="events" 
            data-config='{"branding": {"primaryColor": "#059669", "companyName": "Green Events"}}' 
            class="btn success">
            🌿 Custom Green Events
        </button>
    </div>

    <div class="demo-section">
        <h2>⚙️ Programmatic Usage</h2>
        <p>These buttons use JavaScript to initialize and open the widget programmatically:</p>
        <button onclick="openEventWidget()" class="btn">🎫 Open Event Widget</button>
        <button onclick="openCustomWidget()" class="btn danger">🔥 Custom Configuration</button>
        <button onclick="openWidgetWithAutoShow()" class="btn secondary">⚡ Widget with AutoShow</button>
        <button onclick="testMultipleInstances()" class="btn">🔄 Test Multiple Instances</button>
    </div>

    <div class="demo-section">
        <h2>🛠️ Widget Management</h2>
        <button onclick="getWidgetInfo()" class="btn secondary">📊 Get Widget Info</button>
        <button onclick="destroyAllWidgets()" class="btn secondary">🗑️ Close All Widgets</button>
        <button onclick="testWidgetEvents()" class="btn secondary">📡 Test Events</button>
        <button onclick="clearConsole()" class="btn secondary">🧹 Clear Console</button>
    </div>

    <div class="status-bar" id="statusBar">
        Widget Status: Initializing...
    </div>

    <div class="demo-section">
        <h2>🖥️ Console Output</h2>
        <div class="console-output" id="consoleOutput">
            <div class="timestamp">[${new Date().toLocaleTimeString()}]</div>
            <div class="info">🔄 Initializing Universal Booking Widget demo...</div>
        </div>
    </div>

    <!-- Load the Universal Booking Widget -->
    <script src="../universal-booking-widget.min.js"></script>
    
    <script>
        // Enhanced logging system
        function log(message, type = 'info') {
            console.log(message);
            const consoleEl = document.getElementById('consoleOutput');
            const timestamp = new Date().toLocaleTimeString();
            const typeClass = type === 'error' ? 'error' : type === 'success' ? 'success' : 'info';
            
            consoleEl.innerHTML += \`
                <div class="timestamp">[\${timestamp}]</div>
                <div class="\${typeClass}">\${message}</div>
            \`;
            consoleEl.scrollTop = consoleEl.scrollHeight;
        }

        function updateStatus(message, type = 'info') {
            const statusEl = document.getElementById('statusBar');
            statusEl.textContent = \`Widget Status: \${message}\`;
            statusEl.style.background = type === 'error' ? '#fef2f2' : 
                                       type === 'success' ? '#f0fdf4' : '#f0f9ff';
            statusEl.style.borderLeftColor = type === 'error' ? '#ef4444' : 
                                            type === 'success' ? '#10b981' : '#0ea5e9';
            statusEl.style.color = type === 'error' ? '#dc2626' : 
                                  type === 'success' ? '#059669' : '#0369a1';
        }

        function openEventWidget() {
            log('🚀 Initializing Event Widget...', 'info');
            updateStatus('Initializing Event Widget...', 'info');
            
            try {
                const widget = UniversalBookingWidget.init({
                    businessType: 'events',
                    branding: {
                        primaryColor: '#059669',
                        companyName: 'Demo Events Co.'
                    },
                    apiBaseUrl: 'http://127.0.0.1:8000/api'
                });
                
                log(\`✅ Widget initialized successfully with ID: \${widget.id}\`, 'success');
                log('🔓 Opening widget modal...', 'info');
                
                widget.open();
                updateStatus('Event Widget Active', 'success');
                log('🎉 Event widget opened successfully!', 'success');
                
            } catch (error) {
                log(\`❌ Error initializing widget: \${error.message}\`, 'error');
                updateStatus('Widget Error', 'error');
            }
        }

        function openCustomWidget() {
            log('🚀 Initializing Custom Widget with red theme...', 'info');
            updateStatus('Creating Custom Widget...', 'info');
            
            try {
                const widget = UniversalBookingWidget.init({
                    businessType: 'events',
                    apiBaseUrl: 'http://127.0.0.1:8000/api',
                    branding: {
                        primaryColor: '#dc2626',
                        companyName: 'Premium Booking System'
                    },
                    theme: 'light'
                });
                
                log('✅ Custom widget initialized with premium branding', 'success');
                widget.open();
                updateStatus('Custom Widget Active', 'success');
                log('🔥 Custom widget opened with red theme!', 'success');
                
            } catch (error) {
                log(\`❌ Custom widget error: \${error.message}\`, 'error');
                updateStatus('Custom Widget Error', 'error');
            }
        }

        function openWidgetWithAutoShow() {
            log('🚀 Creating widget with autoShow enabled...', 'info');
            updateStatus('Creating Auto-Show Widget...', 'info');
            
            try {
                const widget = UniversalBookingWidget.init({
                    businessType: 'events',
                    autoShow: true,
                    branding: {
                        primaryColor: '#7c3aed',
                        companyName: 'Auto-Show Demo'
                    }
                });
                
                log('⚡ Auto-show widget created - should open automatically!', 'success');
                updateStatus('Auto-Show Widget Active', 'success');
                
            } catch (error) {
                log(\`❌ Auto-show widget error: \${error.message}\`, 'error');
                updateStatus('Auto-Show Error', 'error');
            }
        }

        function testMultipleInstances() {
            log('🔄 Testing multiple widget instances...', 'info');
            updateStatus('Creating Multiple Instances...', 'info');
            
            const configs = [
                { 
                    businessType: 'events', 
                    branding: { primaryColor: '#ef4444', companyName: 'Red Events Inc.' }
                },
                { 
                    businessType: 'events', 
                    branding: { primaryColor: '#10b981', companyName: 'Green Bookings LLC' }
                },
                { 
                    businessType: 'events', 
                    branding: { primaryColor: '#3b82f6', companyName: 'Blue Tickets Co.' }
                }
            ];
            
            let created = 0;
            configs.forEach((config, index) => {
                setTimeout(() => {
                    try {
                        const widget = UniversalBookingWidget.init(config);
                        created++;
                        log(\`✅ Created instance \${index + 1}: \${config.branding.companyName}\`, 'success');
                        
                        if (created === configs.length) {
                            updateStatus(\`\${created} Instances Active\`, 'success');
                            log(\`🎯 All \${created} widget instances created successfully!\`, 'success');
                        }
                    } catch (error) {
                        log(\`❌ Failed to create instance \${index + 1}: \${error.message}\`, 'error');
                    }
                }, index * 200);
            });
        }

        function getWidgetInfo() {
            log('📊 Gathering widget system information...', 'info');
            
            try {
                const instances = UniversalBookingWidget.getInstances();
                const config = UniversalBookingWidget.getConfig();
                const supportedTypes = UniversalBookingWidget.getSupportedBusinessTypes();
                
                log(\`📈 Active widget instances: \${instances.length}\`, 'info');
                log(\`🏢 Supported business types: \${supportedTypes.join(', ')}\`, 'info');
                log(\`🌐 Default API URL: \${config.apiBaseUrl}\`, 'info');
                log(\`🎨 Default theme: \${config.theme}\`, 'info');
                log(\`🎯 Default primary color: \${config.branding.primaryColor}\`, 'info');
                
                updateStatus(\`\${instances.length} Active Instances\`, 'info');
                
                // Show detailed info in alert
                alert(\`📊 Widget System Information:

🔢 Active instances: \${instances.length}
🏢 Supported types: \${supportedTypes.join(', ')}
🌐 API Base URL: \${config.apiBaseUrl}
🎨 Theme: \${config.theme}
🎯 Primary Color: \${config.branding.primaryColor}
🏛️ Company: \${config.branding.companyName}

Check console for detailed instance information.\`);
                
                // Log instance details
                instances.forEach((instance, i) => {
                    log(\`   Instance \${i + 1}: \${instance.id} (\${instance.config.branding.companyName})\`, 'info');
                });
                
            } catch (error) {
                log(\`❌ Error getting widget info: \${error.message}\`, 'error');
                updateStatus('Info Error', 'error');
            }
        }

        function destroyAllWidgets() {
            log('🗑️ Destroying all active widget instances...', 'info');
            updateStatus('Destroying Widgets...', 'info');
            
            try {
                const count = UniversalBookingWidget.getInstances().length;
                UniversalBookingWidget.destroyAll();
                
                log(\`✅ Successfully destroyed \${count} widget instance(s)\`, 'success');
                updateStatus('All Widgets Destroyed', 'success');
                
            } catch (error) {
                log(\`❌ Error destroying widgets: \${error.message}\`, 'error');
                updateStatus('Destroy Error', 'error');
            }
        }

        function testWidgetEvents() {
            log('📡 Testing widget event system...', 'info');
            updateStatus('Testing Events...', 'info');
            
            // Create temporary event listeners
            const openListener = (e) => {
                log(\`📢 OPEN EVENT: Widget \${e.detail.widgetId} opened\`, 'success');
            };
            
            const closeListener = (e) => {
                log(\`📢 CLOSE EVENT: Widget \${e.detail.widgetId} closed\`, 'success');
            };
            
            document.addEventListener('ubw:open-widget', openListener);
            document.addEventListener('ubw:close-widget', closeListener);
            
            // Test the events
            const widget = UniversalBookingWidget.init({
                businessType: 'events',
                branding: { companyName: 'Event Test Widget' }
            });
            
            log('🧪 Opening test widget to trigger events...', 'info');
            widget.open();
            
            setTimeout(() => {
                log('🧪 Closing test widget...', 'info');
                widget.close();
                
                setTimeout(() => {
                    widget.destroy();
                    document.removeEventListener('ubw:open-widget', openListener);
                    document.removeEventListener('ubw:close-widget', closeListener);
                    log('✅ Event test completed and cleaned up', 'success');
                    updateStatus('Event Test Complete', 'success');
                }, 1000);
            }, 2000);
        }

        function clearConsole() {
            document.getElementById('consoleOutput').innerHTML = \`
                <div class="timestamp">[\${new Date().toLocaleTimeString()}]</div>
                <div class="info">🧹 Console cleared by user</div>
            \`;
            log('Console output cleared', 'info');
            updateStatus('Console Cleared', 'info');
        }

        // Global event listeners for all widget events
        document.addEventListener('ubw:open-widget', function(e) {
            log(\`📢 Global Event: Widget opened (\${e.detail.widgetId})\`, 'success');
        });

        document.addEventListener('ubw:close-widget', function(e) {
            log(\`📢 Global Event: Widget closed (\${e.detail.widgetId})\`, 'success');
        });

        // Initialize the demo environment
        window.addEventListener('load', function() {
            log('🔄 Page loaded, checking widget system...', 'info');
            
            setTimeout(() => {
                if (typeof UniversalBookingWidget !== 'undefined') {
                    log('✅ Universal Booking Widget system loaded successfully!', 'success');
                    log(\`📋 Available business types: \${UniversalBookingWidget.getSupportedBusinessTypes().join(', ')}\`, 'info');
                    log('🎯 Demo environment ready for testing!', 'success');
                    updateStatus('Ready for Testing', 'success');
                    
                    // Log system capabilities
                    const config = UniversalBookingWidget.getConfig();
                    log(\`⚙️ System configured with API: \${config.apiBaseUrl}\`, 'info');
                    
                } else {
                    log('❌ Failed to load Universal Booking Widget system', 'error');
                    updateStatus('Widget System Failed to Load', 'error');
                    log('🔧 Please check the console for detailed error information', 'error');
                }
            }, 200);
        });

        // Handle any uncaught errors
        window.addEventListener('error', function(e) {
            log(\`❌ JavaScript Error: \${e.message} (Line: \${e.lineno})\`, 'error');
            updateStatus('JavaScript Error Detected', 'error');
        });

        // Initial setup
        log('🚀 Universal Booking Widget Demo Environment Starting...', 'info');
        updateStatus('Loading...', 'info');
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
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; 
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            color: white;
            margin-bottom: 30px;
        }
        .header h1 {
            font-size: 3rem;
            margin: 0;
            font-weight: 800;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .header p {
            font-size: 1.2rem;
            margin: 10px 0;
            opacity: 0.9;
        }
        .demo-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .demo-card {
            background: white;
            border-radius: 16px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .demo-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        .demo-card h3 {
            margin: 0 0 15px 0;
            color: #1f2937;
            font-size: 1.4rem;
            font-weight: 700;
        }
        .demo-card .code {
            background: #1f2937;
            color: #10b981;
            padding: 12px 16px;
            border-radius: 8px;
            font-family: 'SF Mono', 'Monaco', monospace;
            font-size: 13px;
            margin: 15px 0;
            border: 1px solid #374151;
        }
        .demo-card .description {
            color: #6b7280;
            font-size: 14px;
            margin: 10px 0;
            line-height: 1.5;
        }
        .demo-card .status {
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin: 10px 0;
        }
        .status.implemented {
            background: #dcfce7;
            color: #166534;
        }
        .status.planned {
            background: #fef3c7;
            color: #92400e;
        }
        .btn {
            background: #3b82f6;
            color: white;
            padding: 12px 20px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.2s;
            margin: 5px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .btn:hover {
            background: #2563eb;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        .btn.secondary {
            background: #6b7280;
        }
        .btn.secondary:hover {
            background: #4b5563;
        }
        .control-panel {
            background: rgba(255,255,255,0.95);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            padding: 30px;
            margin: 20px 0;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .event-log {
            background: #111827;
            color: #f9fafb;
            padding: 25px;
            border-radius: 12px;
            max-height: 400px;
            overflow-y: auto;
            font-family: 'SF Mono', 'Monaco', monospace;
            font-size: 13px;
            line-height: 1.5;
            border: 1px solid #374151;
        }
        .log-entry {
            margin: 8px 0;
        }
        .log-timestamp {
            color: #9ca3af;
        }
        .log-success {
            color: #10b981;
        }
        .log-error {
            color: #ef4444;
        }
        .log-info {
            color: #3b82f6;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .stat-card {
            background: #f8fafc;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            border: 1px solid #e2e8f0;
        }
        .stat-value {
            font-size: 2rem;
            font-weight: 800;
            color: #1f2937;
            margin: 0;
        }
        .stat-label {
            color: #6b7280;
            font-size: 14px;
            margin: 5px 0 0 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Advanced Widget Demo</h1>
            <p>Comprehensive testing environment for Universal Booking Widget</p>
        </div>

        <div class="demo-grid">
            <div class="demo-card">
                <h3>🎫 Event Ticketing</h3>
                <div class="code">businessType: 'events'</div>
                <div class="description">Complete event booking system with ticket selection, pricing, and checkout flow.</div>
                <div class="status implemented">✅ Fully Implemented</div>
                <button onclick="showDemo('events', '#059669', 'Event Ticketing Pro')" class="btn">Demo Events</button>
            </div>

            <div class="demo-card">
                <h3>🏨 Hotel Booking</h3>
                <div class="code">businessType: 'hotel'</div>
                <div class="description">Hotel room reservations with availability checking and amenity selection.</div>
                <div class="status planned">⚠️ Coming Soon</div>
                <button onclick="showDemo('hotel', '#dc2626', 'Hotel Reservations')" class="btn">Demo Hotel</button>
            </div>

            <div class="demo-card">
                <h3>🍽️ Restaurant</h3>
                <div class="code">businessType: 'restaurant'</div>
                <div class="description">Table reservations with party size, time slots, and special requests.</div>
                <div class="status planned">⚠️ Coming Soon</div>
                <button onclick="showDemo('restaurant', '#f59e0b', 'Restaurant Booking')" class="btn">Demo Restaurant</button>
            </div>

            <div class="demo-card">
                <h3>🎪 Tour Booking</h3>
                <div class="code">businessType: 'tour'</div>
                <div class="description">Adventure tours and experiences with group sizes and date selection.</div>
                <div class="status planned">⚠️ Coming Soon</div>
                <button onclick="showDemo('tour', '#10b981', 'Tour Adventures')" class="btn">Demo Tour</button>
            </div>

            <div class="demo-card">
                <h3>💪 Fitness Classes</h3>
                <div class="code">businessType: 'fitness'</div>
                <div class="description">Gym classes, personal training sessions, and membership management.</div>
                <div class="status planned">⚠️ Coming Soon</div>
                <button onclick="showDemo('fitness', '#8b5cf6', 'Fitness Studio')" class="btn">Demo Fitness</button>
            </div>

            <div class="demo-card">
                <h3>🏠 Upside Down House</h3>
                <div class="code">businessType: 'udh'</div>
                <div class="description">Unique experience booking for the Upside Down House attraction.</div>
                <div class="status planned">⚠️ Coming Soon</div>
                <button onclick="showDemo('udh', '#ec4899', 'UDH Experience')" class="btn">Demo UDH</button>
            </div>
        </div>

        <div class="control-panel">
            <h2>🛠️ Widget Control Center</h2>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value" id="activeInstances">0</div>
                    <div class="stat-label">Active Instances</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="totalCreated">0</div>
                    <div class="stat-label">Total Created</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="eventsTriggered">0</div>
                    <div class="stat-label">Events Triggered</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="systemStatus">Loading</div>
                    <div class="stat-label">System Status</div>
                </div>
            </div>

            <div style="text-align: center; margin: 20px 0;">
                <button onclick="getWidgetInfo()" class="btn secondary">📊 System Info</button>
                <button onclick="destroyAll()" class="btn secondary">🗑️ Destroy All</button>
                <button onclick="testMultipleWidgets()" class="btn secondary">🔄 Multi-Test</button>
                <button onclick="stressTest()" class="btn secondary">⚡ Stress Test</button>
                <button onclick="clearLog()" class="btn secondary">🧹 Clear Log</button>
            </div>
        </div>

        <div class="control-panel">
            <h3>📡 System Event Log</h3>
            <div class="event-log" id="eventLog">
                <div class="log-entry">
                    <span class="log-timestamp">[${new Date().toLocaleTimeString()}]</span>
                    <span class="log-info">🔄 Advanced demo system initializing...</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Load the Universal Booking Widget -->
    <script src="../universal-booking-widget.min.js"></script>
    
    <script>
        let totalCreated = 0;
        let eventsTriggered = 0;

        function logEvent(message, type = 'info') {
            console.log(message);
            const log = document.getElementById('eventLog');
            const timestamp = new Date().toLocaleTimeString();
            const typeClass = type === 'error' ? 'log-error' : 
                             type === 'success' ? 'log-success' : 'log-info';
            
            const entry = document.createElement('div');
            entry.className = 'log-entry';
            entry.innerHTML = \`
                <span class="log-timestamp">[\${timestamp}]</span>
                <span class="\${typeClass}">\${message}</span>
            \`;
            
            log.appendChild(entry);
            log.scrollTop = log.scrollHeight;
            
            // Keep only last 100 entries
            if (log.children.length > 100) {
                log.removeChild(log.firstChild);
            }
        }

        function updateStats() {
            const instances = UniversalBookingWidget ? UniversalBookingWidget.getInstances() : [];
            document.getElementById('activeInstances').textContent = instances.length;
            document.getElementById('totalCreated').textContent = totalCreated;
            document.getElementById('eventsTriggered').textContent = eventsTriggered;
            
            const status = instances.length > 0 ? 'Active' : 'Ready';
            document.getElementById('systemStatus').textContent = status;
        }

        function showDemo(businessType, color, companyName) {
            logEvent(\`🚀 Initializing \${businessType} widget with \${companyName}...\`, 'info');
            
            // Close existing widgets first
            const existingCount = UniversalBookingWidget.getInstances().length;
            if (existingCount > 0) {
                UniversalBookingWidget.destroyAll();
                logEvent(\`🧹 Cleaned up \${existingCount} existing widget(s)\`, 'info');
            }
            
            // Create new widget with delay for clean state
            setTimeout(() => {
                try {
                    const widget = UniversalBookingWidget.init({
                        businessType: businessType,
                        branding: {
                            primaryColor: color,
                            companyName: companyName
                        },
                        apiBaseUrl: 'http://127.0.0.1:8000/api'
                    });
                    
                    totalCreated++;
                    logEvent(\`✅ \${businessType} widget created (ID: \${widget.id.substring(0, 8)}...)\`, 'success');
                    
                    widget.open();
                    logEvent(\`🔓 Widget opened for \${companyName}\`, 'success');
                    
                    updateStats();
                    
                } catch (error) {
                    logEvent(\`❌ Failed to create \${businessType} widget: \${error.message}\`, 'error');
                }
            }, 300);
        }

        function getWidgetInfo() {
            logEvent('📊 Gathering comprehensive system information...', 'info');
            
            try {
                const instances = UniversalBookingWidget.getInstances();
                const config = UniversalBookingWidget.getConfig();
                const supportedTypes = UniversalBookingWidget.getSupportedBusinessTypes();
                
                logEvent(\`📈 Active instances: \${instances.length}\`, 'info');
                logEvent(\`🏢 Supported types: \${supportedTypes.join(', ')}\`, 'info');
                logEvent(\`🌐 API Base URL: \${config.apiBaseUrl}\`, 'info');
                logEvent(\`🎨 Default theme: \${config.theme}\`, 'info');
                logEvent(\`🎯 Primary color: \${config.branding.primaryColor}\`, 'info');
                logEvent(\`🏛️ Company name: \${config.branding.companyName}\`, 'info');
                
                // Detailed instance information
                instances.forEach((instance, i) => {
                    logEvent(\`   Instance \${i + 1}: \${instance.config.branding.companyName} (\${instance.config.businessType})\`, 'info');
                });
                
                updateStats();
                
                alert(\`📊 Universal Booking Widget System Info:

🔢 Active Instances: \${instances.length}
🏗️ Total Created: \${totalCreated}
📡 Events Triggered: \${eventsTriggered}
🏢 Supported Types: \${supportedTypes.length} (\${supportedTypes.join(', ')})

🌐 Configuration:
   API URL: \${config.apiBaseUrl}
   Theme: \${config.theme}
   Primary Color: \${config.branding.primaryColor}
   Company: \${config.branding.companyName}

Check the event log for detailed instance information.\`);
                
            } catch (error) {
                logEvent(\`❌ Error gathering system info: \${error.message}\`, 'error');
            }
        }

        function destroyAll() {
            logEvent('🗑️ Initiating destruction of all widget instances...', 'info');
            
            try {
                const count = UniversalBookingWidget.getInstances().length;
                
                if (count === 0) {
                    logEvent('ℹ️ No active widgets to destroy', 'info');
                    return;
                }
                
                UniversalBookingWidget.destroyAll();
                logEvent(\`✅ Successfully destroyed \${count} widget instance(s)\`, 'success');
                
                updateStats();
                
            } catch (error) {
                logEvent(\`❌ Error during widget destruction: \${error.message}\`, 'error');
            }
        }

        function testMultipleWidgets() {
            logEvent('🧪 Starting multiple widget instance test...', 'info');
            
            const testConfigs = [
                { 
                    businessType: 'events', 
                    branding: { primaryColor: '#ef4444', companyName: 'Red Events Corp.' }
                },
                { 
                    businessType: 'events', 
                    branding: { primaryColor: '#10b981', companyName: 'Green Bookings Ltd.' }
                },
                { 
                    businessType: 'events', 
                    branding: { primaryColor: '#3b82f6', companyName: 'Blue Tickets Inc.' }
                },
                { 
                    businessType: 'events', 
                    branding: { primaryColor: '#8b5cf6', companyName: 'Purple Events LLC' }
                }
            ];
            
            let created = 0;
            const targetCount = testConfigs.length;
            
            testConfigs.forEach((config, index) => {
                setTimeout(() => {
                    try {
                        const widget = UniversalBookingWidget.init(config);
                        totalCreated++;
                        created++;
                        
                        logEvent(\`✅ Multi-test instance \${created}/\${targetCount}: \${config.branding.companyName}\`, 'success');
                        
                        if (created === targetCount) {
                            logEvent(\`🎯 Multi-widget test complete! Created \${created} instances successfully.\`, 'success');
                            updateStats();
                        }
                        
                    } catch (error) {
                        logEvent(\`❌ Multi-test failed for instance \${index + 1}: \${error.message}\`, 'error');
                    }
                }, index * 300);
            });
        }

        function stressTest() {
            logEvent('⚡ Initiating widget stress test (10 rapid instances)...', 'info');
            
            const stressCount = 10;
            let successCount = 0;
            let errorCount = 0;
            
            for (let i = 0; i < stressCount; i++) {
                setTimeout(() => {
                    try {
                        const widget = UniversalBookingWidget.init({
                            businessType: 'events',
                            branding: {
                                primaryColor: \`hsl(\${Math.floor(Math.random() * 360)}, 70%, 50%)\`,
                                companyName: \`Stress Test Widget \${i + 1}\`
                            }
                        });
                        
                        totalCreated++;
                        successCount++;
                        
                        if (i === stressCount - 1) {
                            setTimeout(() => {
                                logEvent(\`⚡ Stress test complete: \${successCount} created, \${errorCount} failed\`, successCount === stressCount ? 'success' : 'info');
                                updateStats();
                            }, 100);
                        }
                        
                    } catch (error) {
                        errorCount++;
                        logEvent(\`❌ Stress test error \${i + 1}: \${error.message}\`, 'error');
                    }
                }, i * 50); // Very rapid creation
            }
        }

        function clearLog() {
            const log = document.getElementById('eventLog');
            log.innerHTML = \`
                <div class="log-entry">
                    <span class="log-timestamp">[\${new Date().toLocaleTimeString()}]</span>
                    <span class="log-info">🧹 Event log cleared by user</span>
                </div>
            \`;
            logEvent('Log cleared', 'info');
        }

        // Global event listeners with enhanced tracking
        document.addEventListener('ubw:open-widget', function(e) {
            eventsTriggered++;
            logEvent(\`📢 OPEN EVENT: Widget \${e.detail.widgetId.substring(0, 8)}... opened\`, 'success');
            updateStats();
        });

        document.addEventListener('ubw:close-widget', function(e) {
            eventsTriggered++;
            logEvent(\`📢 CLOSE EVENT: Widget \${e.detail.widgetId.substring(0, 8)}... closed\`, 'success');
            updateStats();
        });

        // Initialize the advanced demo environment
        window.addEventListener('load', function() {
            logEvent('🔄 Advanced demo environment loading...', 'info');
            
            setTimeout(() => {
                if (typeof UniversalBookingWidget !== 'undefined') {
                    logEvent('✅ Universal Booking Widget system loaded successfully!', 'success');
                    logEvent(\`📋 Detected \${UniversalBookingWidget.getSupportedBusinessTypes().length} supported business types\`, 'info');
                    logEvent(\`🏢 Types: \${UniversalBookingWidget.getSupportedBusinessTypes().join(', ')}\`, 'info');
                    
                    const config = UniversalBookingWidget.getConfig();
                    logEvent(\`⚙️ System configured with API: \${config.apiBaseUrl}\`, 'info');
                    logEvent('🎯 Advanced testing environment ready!', 'success');
                    
                    document.getElementById('systemStatus').textContent = 'Ready';
                    updateStats();
                    
                } else {
                    logEvent('❌ CRITICAL: Universal Booking Widget system failed to load', 'error');
                    document.getElementById('systemStatus').textContent = 'Error';
                    logEvent('🔧 Please check browser console for detailed error information', 'error');
                }
            }, 300);
        });

        // Enhanced error handling
        window.addEventListener('error', function(e) {
            logEvent(\`❌ JavaScript Error: \${e.message} at line \${e.lineno}\`, 'error');
        });

        window.addEventListener('unhandledrejection', function(e) {
            logEvent(\`❌ Unhandled Promise Rejection: \${e.reason}\`, 'error');
        });

        // Performance monitoring
        if ('performance' in window) {
            window.addEventListener('load', function() {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    const loadTime = Math.round(perfData.loadEventEnd - perfData.fetchStart);
                    logEvent(\`⚡ Page loaded in \${loadTime}ms\`, 'info');
                }, 100);
            });
        }

        // Initial system startup
        logEvent('🚀 Advanced Universal Booking Widget Demo starting...', 'info');
        updateStats();
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

  // Create a simple test file
  const testExample = `<!DOCTYPE html>
<html>
<head>
    <title>Quick Widget Test</title>
    <style>
        body { 
            font-family: system-ui, sans-serif; 
            max-width: 800px; 
            margin: 50px auto; 
            padding: 20px; 
            background: #f8fafc;
        }
        .test-button { 
            background: #3b82f6; 
            color: white; 
            padding: 15px 25px; 
            border: none; 
            border-radius: 8px; 
            font-size: 16px; 
            cursor: pointer; 
            margin: 10px;
            transition: background 0.2s;
        }
        .test-button:hover { 
            background: #2563eb; 
        }
        .status { 
            padding: 15px; 
            margin: 20px 0; 
            border-radius: 8px; 
            background: #f0f9ff; 
            border-left: 4px solid #3b82f6;
        }
    </style>
</head>
<body>
    <h1>🧪 Quick Widget Test</h1>
    <p>Simple test page to verify widget functionality</p>
    
    <div class="status" id="status">Status: Loading...</div>
    
    <button onclick="quickTest()" class="test-button">🚀 Quick Test</button>
    <button onclick="testEvents()" class="test-button">📡 Test Events</button>
    <button onclick="cleanup()" class="test-button">🧹 Cleanup</button>

    <script src="../universal-booking-widget.min.js"></script>
    <script>
        function updateStatus(msg) {
            document.getElementById('status').textContent = 'Status: ' + msg;
            console.log('Status:', msg);
        }

        function quickTest() {
            updateStatus('Creating widget...');
            try {
                const widget = UniversalBookingWidget.init({
                    businessType: 'events',
                    branding: { companyName: 'Quick Test' }
                });
                widget.open();
                updateStatus('Widget opened successfully!');
            } catch (error) {
                updateStatus('Error: ' + error.message);
                console.error('Widget error:', error);
            }
        }

        function testEvents() {
            updateStatus('Testing events...');
            
            document.addEventListener('ubw:open-widget', () => {
                updateStatus('Open event received!');
            });
            
            const widget = UniversalBookingWidget.init({
                businessType: 'events',
                branding: { companyName: 'Event Test' }
            });
            widget.open();
        }

        function cleanup() {
            const count = UniversalBookingWidget.getInstances().length;
            UniversalBookingWidget.destroyAll();
            updateStatus(\`Cleaned up \${count} widgets\`);
        }

        // Check if widget loaded
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (typeof UniversalBookingWidget !== 'undefined') {
                    updateStatus('Widget system ready!');
                } else {
                    updateStatus('ERROR: Widget failed to load');
                }
            }, 100);
        });
    </script>
</body>
</html>`;

  fs.writeFileSync(path.join(examplesDir, "quick-test.html"), testExample);

  console.log("📝 Created example files:");
  console.log("   - examples/basic-integration.html (Full featured demo)");
  console.log(
    "   - examples/advanced-integration.html (Comprehensive testing)"
  );
  console.log("   - examples/quick-test.html (Simple functionality test)");
}
