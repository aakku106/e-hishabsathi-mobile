import { getDatabase } from "../sqlite";

export async function getSetting(key: string): Promise<string | null> {
  const db = getDatabase();
  if (!db) return null;

  const row = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM app_settings WHERE key = ?",
    key,
  );
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = getDatabase();
  if (!db) return;

  await db.runAsync(
    "INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    key,
    value,
  );
}

export async function removeSetting(key: string): Promise<void> {
  const db = getDatabase();
  if (!db) return;

  await db.runAsync("DELETE FROM app_settings WHERE key = ?", key);
}

export const SETTING_KEYS = {
  authPan: "auth.pan",
  authUsername: "auth.username",
  /** A guest session has no PAN/username but is still signed in. */
  authGuest: "auth.guest",
  themeMode: "settings.themeMode",
  language: "settings.language",
  /** Sales may only use products that already exist in inventory. */
  salesStrictInventory: "settings.sales.strictInventory",
  /** Per-page visibility of the floating AI assistant button. */
  aiAssistant: {
    sales: "settings.aiAssistant.sales",
    buy: "settings.aiAssistant.buy",
    udharo: "settings.aiAssistant.udharo",
    dashboard: "settings.aiAssistant.dashboard",
  },
  /** Per-page visibility of the recent-entries list. */
  recent: {
    sales: "settings.recent.sales",
    buy: "settings.recent.buy",
    udharo: "settings.recent.udharo",
  },
  /** The AI voice entry button on the Sales, Buy and Udharo forms. */
  aiVoiceEntry: "settings.aiVoiceEntry",
  /** Horizontal swipe between tab pages. */
  tabSwipe: "settings.tabSwipe",
} as const;
