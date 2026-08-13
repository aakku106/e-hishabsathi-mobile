export const APP = {
  name: "E-HishabSathi",
  version: "0.0.1-alpha.1",
  dbName: "e_hishab.sqlite",
  currency: "Rs.",
  defaultBusinessType: "retail",
  aiAssistantName: "Khata Intelligence",
} as const;

export const APP_DB_NAME = APP.dbName;

/**
 * Seeds the SQLite database with demo records on first launch.
 * Turn off before shipping to production.
 */
export const SEED_DEMO_DATA = true;
