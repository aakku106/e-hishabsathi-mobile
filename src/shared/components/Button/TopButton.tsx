import React from "react";
import {
  GestureResponderEvent,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

import { Colors_SalesPage } from "@/shared/constants/colors";
import { BorderWidth, Radius } from "@/shared/constants/radius";
import { Spacing } from "@/shared/constants/spacing";
import {
  FontSize,
  FontWeight,
  LetterSpacing,
} from "@/shared/constants/typography";

interface TopButtonProps {
  onPress?: (event: GestureResponderEvent) => void;
  title?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const TopButton: React.FC<TopButtonProps> = ({
  onPress,
  title = "",
  style,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.button, style]}>
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing["3xl"],
    borderRadius: Radius.pill,
    backgroundColor: Colors_SalesPage.topBtn,
    borderWidth: BorderWidth.base,
    borderColor: "rgba(255, 255, 255, 0.5)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,

    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: Colors_SalesPage.textPrimary,
    fontSize: FontSize["3xl"],
    fontWeight: FontWeight.semibold,
    letterSpacing: LetterSpacing.wider,
    textAlign: "center",
  },
});

export default TopButton;
