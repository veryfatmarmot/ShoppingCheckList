const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// The Firebase JS SDK ships modern syntax (private class fields) in the ESM
// build Metro resolves via package.json "exports". Metro doesn't transpile
// node_modules by default, and Hermes rejects that syntax at runtime.
// Falling back to package.json "main" resolution avoids that build entirely.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
