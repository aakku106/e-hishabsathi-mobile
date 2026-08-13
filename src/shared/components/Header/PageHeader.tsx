import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

import { Radius } from "@/shared/constants/radius";
import { Spacing } from "@/shared/constants/spacing";
import { FontSize, FontWeight } from "@/shared/constants/typography";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  gradient?: readonly [string, string];
  onBack?: () => void;
  right?: React.ReactNode;
  children?: React.ReactNode;
  style?: ViewStyle;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon,
  gradient = ["#4F46E5", "#7C3AED"],
  onBack,
  right,
  children,
  style,
}) => {
  return (
    <LinearGradient
      colors={[...gradient]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.hero, style]}
    >
      <View style={styles.topRow}>
        {onBack ? (
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={onBack}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={22}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.sideSlot} />
        )}

        <View style={styles.titleWrap}>
          {!!icon && (
            <View style={styles.iconBadge}>
              <MaterialCommunityIcons name={icon} size={18} color="#FFFFFF" />
            </View>
          )}
          <Text style={styles.title}>{title}</Text>
        </View>

        {right ? right : <View style={styles.sideSlot} />}
      </View>

      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  hero: {
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing["2xl"],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 6,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sideSlot: {
    width: 44,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: FontSize["2xl"],
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
    lineHeight: 20,
    textAlign: "center",
    marginTop: Spacing.xs,
  },
});

export default PageHeader;
