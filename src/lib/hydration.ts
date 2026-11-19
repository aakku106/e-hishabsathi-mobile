import {
  getSetting,
  setSetting,
  SETTING_KEYS,
} from "@/database/helpers/settings";
import { useAuthStore } from "@/store/auth.store";
import {
  DEFAULT_AI_ASSISTANT,
  useSettingsStore,
  type AiAssistantSettings,
  type PageKey,
} from "@/store/settings.store";
import type { ThemeMode } from "@/providers/ThemeProvider";

/** Stored booleans are `"true"` / `"false"`; anything else falls back. */
function parseFlag(value: string | null, fallback: boolean): boolean {
  if (value === null) return fallback;
  return value === "true";
}

export async function hydrateStores(): Promise<void> {
  const [
    pan,
    username,
    themeMode,
    language,
    strictInventory,
    aiSales,
    aiBuy,
    aiUdharo,
    aiDashboard,
  ] = await Promise.all([
    getSetting(SETTING_KEYS.authPan),
    getSetting(SETTING_KEYS.authUsername),
    getSetting(SETTING_KEYS.themeMode),
    getSetting(SETTING_KEYS.language),
    getSetting(SETTING_KEYS.salesStrictInventory),
    getSetting(SETTING_KEYS.aiAssistant.sales),
    getSetting(SETTING_KEYS.aiAssistant.buy),
    getSetting(SETTING_KEYS.aiAssistant.udharo),
    getSetting(SETTING_KEYS.aiAssistant.dashboard),
  ]);

  useAuthStore.getState().hydrate({ pan, username });
  const storedTheme: ThemeMode =
    themeMode === "dark" || themeMode === "system" ? themeMode : "light";

  const aiAssistant: AiAssistantSettings = {
    sales: parseFlag(aiSales, DEFAULT_AI_ASSISTANT.sales),
    buy: parseFlag(aiBuy, DEFAULT_AI_ASSISTANT.buy),
    udharo: parseFlag(aiUdharo, DEFAULT_AI_ASSISTANT.udharo),
    dashboard: parseFlag(aiDashboard, DEFAULT_AI_ASSISTANT.dashboard),
  };

  useSettingsStore.getState().hydrate(
    storedTheme,
    language === "np" ? "np" : "en",
    {
      salesStrictInventory: parseFlag(strictInventory, true),
      aiAssistant,
    },
  );
}

export async function persistThemeMode(mode: ThemeMode): Promise<void> {
  await setSetting(SETTING_KEYS.themeMode, mode);
}

export async function persistSalesStrictInventory(
  enabled: boolean,
): Promise<void> {
  await setSetting(SETTING_KEYS.salesStrictInventory, String(enabled));
}

export async function persistAiAssistant(
  page: PageKey,
  enabled: boolean,
): Promise<void> {
  await setSetting(SETTING_KEYS.aiAssistant[page], String(enabled));
}
