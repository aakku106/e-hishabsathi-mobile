const createExpoWebpackConfigAsync = require("@expo/webpack-config");

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Add .wasm to asset/resource handling so web bundlers serve it correctly
  if (!config.module) config.module = { rules: [] };
  config.module.rules.push({
    test: /\.wasm$/,
    type: "asset/resource",
  });

  return config;
};
