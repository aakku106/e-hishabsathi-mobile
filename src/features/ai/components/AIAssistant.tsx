import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

import { boxShadow } from "@/shared/constants/shadows";
import { Spacing } from "@/shared/constants/spacing";
import { FontWeight } from "@/shared/constants/typography";

import AIOverlay from "./AIOverlay";

type AIAssistantProps = {
  /** Page accent used for the floating button. */
  accentColor: string;
  /** Distance from the bottom of the screen; keeps the button above the tab bar. */
  bottomOffset?: number;
};

/**
 * Floating AI button plus the Khata Intelligence bottom sheet. Render it as a
 * sibling of the screen's ScrollView so the absolute overlay covers the page.
 */
export function AIAssistant({
  accentColor,
  bottomOffset = 92,
}: AIAssistantProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Open AI Assistant"
        activeOpacity={0.85}
        onPress={() => setOpen(true)}
        style={[
          styles.button,
          { backgroundColor: accentColor, bottom: bottomOffset },
        ]}>
        <MaterialCommunityIcons
          name="creation-outline"
          size={24}
          color="#FFFFFF"
        />
        <Text style={styles.label}>AI</Text>
      </TouchableOpacity>

      {open && <AIOverlay visible={open} onClose={() => setOpen(false)} />}
    </>
  );
}

const styles = StyleSheet.create({
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
  label: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: FontWeight.bold,
    marginTop: -2,
  },
});

export default AIAssistant;
