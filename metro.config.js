// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Explicitly ensure 'ttf' and 'otf' are in assetExtensions for vector icons
if (!config.resolver.assetExts.includes("ttf")) {
  config.resolver.assetExts.push("ttf");
}
if (!config.resolver.assetExts.includes("otf")) {
  config.resolver.assetExts.push("otf");
}

module.exports = withNativewind(config, {
  input: "src/global.css",
  // inline variables break PlatformColor in CSS variables
  inlineVariables: false,
  // We add className support manually
  globalClassNamePolyfill: false,
});
