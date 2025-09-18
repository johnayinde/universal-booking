const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    entry: "./src/widget.js", // Widget entry point
    mode: isProduction ? "production" : "development",

    output: {
      path: path.resolve(__dirname, "dist"),
      filename: isProduction
        ? "event-booking-widget.min.js"
        : "event-booking-widget.js",
      library: "EventBookingWidget",
      libraryTarget: "umd",
      umdNamedDefine: true,
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
                [
                  "@babel/preset-env",
                  {
                    targets: {
                      browsers: ["> 1%", "last 2 versions", "not ie <= 11"],
                    },
                  },
                ],
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
            isProduction ? MiniCssExtractPlugin.loader : "style-loader",
            {
              loader: "css-loader",
              options: {
                importLoaders: 1,
              },
            },
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
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          type: "asset/resource",
          generator: {
            filename: "images/[name][ext]",
          },
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: "asset/resource",
          generator: {
            filename: "fonts/[name][ext]",
          },
        },
      ],
    },

    resolve: {
      extensions: [".js", ".jsx"],
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },

    plugins: [
      ...(isProduction
        ? [
            new MiniCssExtractPlugin({
              filename: "event-booking-widget.min.css",
            }),
          ]
        : []),
    ],

    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true,
              drop_debugger: true,
            },
            mangle: true,
            format: {
              comments: false,
            },
          },
          extractComments: false,
        }),
      ],
    },

    externals: {
      // Don't bundle React if it's already available on the page
      // Comment out these lines if you want to bundle React
      // react: {
      //   commonjs: 'react',
      //   commonjs2: 'react',
      //   amd: 'React',
      //   root: 'React'
      // },
      // 'react-dom': {
      //   commonjs: 'react-dom',
      //   commonjs2: 'react-dom',
      //   amd: 'ReactDOM',
      //   root: 'ReactDOM'
      // }
    },

    devtool: isProduction ? false : "source-map",

    performance: {
      hints: isProduction ? "warning" : false,
      maxEntrypointSize: 500000,
      maxAssetSize: 500000,
    },
  };
};
