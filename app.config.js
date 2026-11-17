const appConfig = require("./app.json").expo;

const isDevServer = process.argv.includes("start");

// `expo start` is always a development bundle. An inherited NODE_ENV=production
// makes Metro bundle every route eagerly and can push memory past 1 GB.
if (isDevServer) {
  process.env.NODE_ENV = "development";
  process.env.BABEL_ENV = "development";
}

const requestedOutput = process.env.EXPO_WEB_OUTPUT;
const isWebExport =
  !isDevServer &&
  (requestedOutput === "static" ||
    (requestedOutput !== "single" && process.argv.includes("export")));

module.exports = () => ({
  ...appConfig,
  web: {
    ...appConfig.web,
    // `expo start --web` must use the single-page output: Metro 57 cannot
    // serialize the expo-sqlite web worker chunk from the static output.
    // `expo export --platform web` still needs the static multi-route output.
    output: isWebExport ? "static" : "single",
  },
});
