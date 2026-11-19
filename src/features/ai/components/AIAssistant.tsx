import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useTheme } from "@/providers/ThemeProvider";
import { GlassSurface } from "@/shared/components/Glass/GlassSurface";
import {
  getAccentColor,
  getAccentForegroundColor,
} from "@/shared/constants/colors";
import { boxShadow, withAlpha } from "@/shared/constants/shadows";
import { Spacing } from "@/shared/constants/spacing";
import { FontWeight } from "@/shared/constants/typography";
import { useSettingsStore, type PageKey } from "@/store/settings.store";

import AIOverlay from "./AIOverlay";

type AIAssistantProps = {
  /** Page this button belongs to; the Settings page can hide it per page. */
  page: PageKey;
  /** Distance from the bottom of the screen; keeps the button above the tab bar. */
  bottomOffset?: number;
};

/**
 * Floating AI button plus the Khata Intelligence bottom sheet. Render it as a
 * sibling of the screen's ScrollView so the absolute overlay covers the page.
 * The button uses the shared theme-aware green as a translucent glass tint so
 * it matches the header without copying the page accent. Renders nothing when
 * the page's AI button is switched off in Settings.
 */
export function AIAssistant({ page, bottomOffset = 92 }: AIAssistantProps) {
  const [open, setOpen] = useState(false);
  const { isDark } = useTheme();
  const enabled = useSettingsStore((state) => state.aiAssistant[page]);
  const accent = getAccentColor(isDark);
  const foreground = getAccentForegroundColor(isDark);

  if (!enabled) return null;

  return (
    <View style={styles.overlayRoot} pointerEvents="box-none">
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Open AI Assistant"
        activeOpacity={0.85}
        onPress={() => setOpen(true)}
        style={[styles.button, { bottom: bottomOffset }]}>
        <GlassSurface
          style={styles.glass}
          tintColor={withAlpha(accent, isDark ? 0.62 : 0.76)}
          intensity={45}
        />
        <MaterialCommunityIcons
          name="creation-outline"
          size={24}
          color={foreground}
        />
        <Text style={[styles.label, { color: foreground }]}>AI</Text>
      </TouchableOpacity>

      {open && <AIOverlay visible={open} onClose={() => setOpen(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  // Full-screen layer for the AI button + bottom sheet so the overlay is
  // laid out identically on every screen regardless of host container.
  overlayRoot: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 900,
    pointerEvents: "box-none",
  },
  button: {
    position: "absolute",
    right: Spacing.lg,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: boxShadow({ y: 5, blur: 10, color: "#0F172A", opacity: 0.2 }),
    zIndex: 10,
  },
  glass: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 29,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.35)",
  },
  label: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    marginTop: -2,
  },
});

export default AIAssistant;
