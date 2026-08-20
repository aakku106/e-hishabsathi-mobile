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
  themeMode: "settings.themeMode",
  language: "settings.language",
} as const;
