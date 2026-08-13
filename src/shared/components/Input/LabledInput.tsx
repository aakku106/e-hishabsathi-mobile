import React from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

import { BorderWidth, Radius } from "@/shared/constants/radius";
import { Spacing } from "@/shared/constants/spacing";
import { FontSize, FontWeight } from "@/shared/constants/typography";

interface LabeledInputProps extends TextInputProps {
  label: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelColor?: string;
  inputBgColor?: string;
  borderColor?: string;
  placeholderColor?: string;
}

export const LabeledInput: React.FC<LabeledInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder = "Enter text",
  containerStyle,
  inputContainerStyle,
  labelStyle,
  inputStyle,
  labelColor = "#0F172A",
  inputBgColor = "#FFFFFF",
  borderColor = "#E2E8F0",
  placeholderColor = "#94A3B8",
  keyboardType = "default",
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.label, { color: labelColor }, labelStyle]}>
        {label}
      </Text>
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: inputBgColor,
            borderColor: borderColor,
          },
          inputContainerStyle,
        ]}>
        <TextInput
          style={[styles.input, { color: "#0F172A" }, inputStyle]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          keyboardType={keyboardType}
          {...props}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: Spacing.xs,
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    borderRadius: Radius.md,
    borderWidth: BorderWidth.thin,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minHeight: 52,
    justifyContent: "center",
  },
  input: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.regular,
    padding: 0,
  },
});

export default LabeledInput;
