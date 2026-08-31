import {
  getSetting,
  setSetting,
  SETTING_KEYS,
} from "@/database/helpers/settings";
import { useAuthStore } from "@/store/auth.store";
import { useSettingsStore } from "@/store/settings.store";
import type { ThemeMode } from "@/providers/ThemeProvider";

export async function hydrateStores(): Promise<void> {
  const [pan, username, themeMode, language] = await Promise.all([
    getSetting(SETTING_KEYS.authPan),
    getSetting(SETTING_KEYS.authUsername),
    getSetting(SETTING_KEYS.themeMode),
    getSetting(SETTING_KEYS.language),
  ]);

  useAuthStore.getState().hydrate({ pan, username });
  useSettingsStore
    .getState()
    .hydrate(
      themeMode === "dark" ? "dark" : "light",
      language === "np" ? "np" : "en",
    );
}

export async function persistThemeMode(mode: ThemeMode): Promise<void> {
  await setSetting(SETTING_KEYS.themeMode, mode);
}
