module.exports = function (api) {
  api.cache(true);
  return {
    // Add jsxImportSource back, wrap preset in array
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // Remove nativewind/babel from plugins
    plugins: [
      "react-native-reanimated/plugin" // Keep Reanimated plugin
    ],
  };
};