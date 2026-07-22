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

import { Colors_SalesPage } from "@/shared/constants/colors";
import { BorderWidth, Radius } from "@/shared/constants/radius";
import { Spacing } from "@/shared/constants/spacing";
import { FontWeight } from "@/shared/constants/typography";

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
  labelColor = Colors_SalesPage.textPrimary,
  inputBgColor = Colors_SalesPage.inputBG,
  borderColor = Colors_SalesPage.border,
  placeholderColor = "#9CA3AF", // Default muted placeholder
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
          style={[styles.input, inputStyle]}
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
    fontSize: Colors_SalesPage.font_size.inputLabelSize, // 24
    fontWeight: FontWeight.bold,
  },
  inputWrapper: {
    borderRadius: Radius.lg, // 16
    borderWidth: BorderWidth.base,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    // Soft shadow like in the design
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  input: {
    fontSize: Colors_SalesPage.font_size.inputPlaceHolder, // 20
    fontWeight: FontWeight.regular,
    color: "#000000",
    padding: 0, // Eliminates default Android padding
  },
});

export default LabeledInput;

/* HOW TO USE THIS
// Example on Sales Page
<LabeledInput
  label="Quantity"
  placeholder="Enter Quantity"
  labelColor={Colors_SalesPage.textPrimary}
  inputBgColor={Colors_SalesPage.inputBG}
/>

// Example on Udharo Page
<LabeledInput
  label="Amount"
  placeholder="Enter Amount"
  labelColor={Colors_UdharoPage.textPrimary}
  borderColor={Colors_UdharoPage.border}
/>
*/
