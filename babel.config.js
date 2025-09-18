module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          browsers: ["> 1%", "last 2 versions", "not ie <= 11"],
        },
        useBuiltIns: "entry",
        corejs: 3,
      },
    ],
    [
      "@babel/preset-react",
      {
        runtime: "automatic",
        development: process.env.NODE_ENV === "development",
      },
    ],
  ],
  plugins: [
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-syntax-dynamic-import",
    ...(process.env.NODE_ENV === "production"
      ? [
          [
            "babel-plugin-transform-remove-console",
            { exclude: ["error", "warn"] },
          ],
        ]
      : []),
  ],
  env: {
    test: {
      presets: [
        ["@babel/preset-env", { targets: { node: "current" } }],
        ["@babel/preset-react", { runtime: "automatic" }],
      ],
    },
  },
};
