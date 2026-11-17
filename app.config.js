const appConfig = require("./app.json").expo;

module.exports = () => ({
  ...appConfig,
  web: {
    ...appConfig.web,
    // Metro 57 fails to serialize worker chunks from static output in development.
    output:
      process.env.NODE_ENV === "development" ? "single" : appConfig.web.output,
  },
});
