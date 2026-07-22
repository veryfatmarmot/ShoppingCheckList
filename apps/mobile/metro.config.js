const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// The Firebase JS SDK ships modern syntax (private class fields) in the ESM
// build Metro resolves via package.json "exports". Metro doesn't transpile
// node_modules by default, and Hermes rejects that syntax at runtime.
// Falling back to package.json "main" resolution avoids that build entirely.
config.resolver.unstable_enablePackageExports = false;

// Monorepo Android release-build fix (R1-T1). The Android native bundler runs
// `export:embed` and the React Native Gradle plugin relativizes `--entry-file`
// against this app dir (apps/mobile), producing `../../node_modules/expo-router
// /entry.js`. But Metro auto-detects its server root to the repo root (hoisted
// node_modules), so it resolves that path OUTSIDE the repo and fails. Pinning
// the server root to this app dir makes the two agree AND keeps the project
// root at apps/mobile, so `.env` and Expo Router's `app/` directory resolve
// correctly (a repo-root project root silently drops both from the bundle).
//
// Scoped to `export:embed` ONLY. The web exporter (`expo export --platform web`)
// and the dev server auto-resolve their own entry relative to the server root,
// so they need the DEFAULT repo-root server root to find the hoisted
// `expo-router/entry`; pinning it there would break them.
const isEmbedExport = process.argv.some((arg) => arg.includes('export:embed'));
if (isEmbedExport) {
  config.server = { ...config.server, unstable_serverRoot: __dirname };
}

module.exports = config;
