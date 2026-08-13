const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Ensure Metro treats .wasm files as assets so imports like
// `import wasm from './wa-sqlite.wasm'` resolve correctly.
config.resolver = config.resolver || {};
config.resolver.assetExts = config.resolver.assetExts || [];
if (!config.resolver.assetExts.includes("wasm")) {
  config.resolver.assetExts.push("wasm");
}

// wa-sqlite (used by expo-sqlite on web) requires SharedArrayBuffer,
// which browsers only expose with COOP/COEP enabled.
config.server = config.server || {};
const enhanceMiddleware = config.server.enhanceMiddleware;
config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    return (enhanceMiddleware ? enhanceMiddleware(middleware) : middleware)(
      req,
      res,
      next
    );
  };
};

module.exports = config;
