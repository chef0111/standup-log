const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.maxWorkers = 2;

module.exports = withNativewind(config, {
  inlineVariables: false,
  globalClassNamePolyfill: true,
});
