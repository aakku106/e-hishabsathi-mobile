import React, { useState } from "react";
import {
  FlatList,
  Modal,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native";

import { Colors_SalesPage } from "@/shared/constants/colors";
import { BorderWidth, Radius } from "@/shared/constants/radius";
import { Spacing } from "@/shared/constants/spacing";
import { FontSize, FontWeight } from "@/shared/constants/typography";

export interface DropdownOption {
  label: string;
  value: string | number;
}

interface DropdownProps {
  options: DropdownOption[];
  defaultValue?: DropdownOption | DropdownOption[];
  placeholder?: string;
  maxSelectable?: number; // 1 for single-select, >1 for multi-select
  onSelect?: (selected: DropdownOption | DropdownOption[]) => void;

  // Custom Color Props
  bgColor?: string;
  textColor?: string;
  dropdownBgColor?: string;
  dropdownTextColor?: string;
  borderColor?: string;

  // Custom Style Overrides
  containerStyle?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  dropdownListStyle?: StyleProp<ViewStyle>;
}

// Simple Arrow SVG Placeholder — Swap with your custom SVG icon
const DownArrowIcon = ({ color = "#000000", isOpen = false }) => (
  <View
    style={[styles.arrow, { borderTopColor: color }, isOpen && styles.arrowUp]}
  />
);

export const Dropdown: React.FC<DropdownProps> = ({
  options = [],
  defaultValue,
  placeholder = "Select an option",
  maxSelectable = 1,
  onSelect,
  bgColor = Colors_SalesPage.surface,
  textColor = Colors_SalesPage.textPrimary,
  dropdownBgColor = Colors_SalesPage.inputBG,
  dropdownTextColor = Colors_SalesPage.textPrimary,
  borderColor = Colors_SalesPage.border,
  containerStyle,
  buttonStyle,
  textStyle,
  dropdownListStyle,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<DropdownOption[]>(() => {
    if (!defaultValue) return [];
    return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
  });

  const handleOptionPress = (option: DropdownOption) => {
    let updatedSelection: DropdownOption[];

    if (maxSelectable === 1) {
      updatedSelection = [option];
      setIsOpen(false);
    } else {
      const exists = selectedItems.some((item) => item.value === option.value);
      if (exists) {
        updatedSelection = selectedItems.filter(
          (item) => item.value !== option.value,
        );
      } else {
        if (selectedItems.length >= maxSelectable) return; // Reached selection limit
        updatedSelection = [...selectedItems, option];
      }
    }

    setSelectedItems(updatedSelection);
    onSelect?.(maxSelectable === 1 ? updatedSelection[0] : updatedSelection);
  };

  const renderDisplayText = () => {
    if (selectedItems.length === 0) return placeholder;
    if (maxSelectable === 1) return selectedItems[0].label;
    return selectedItems.map((item) => item.label).join(", ");
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Dropdown Trigger Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setIsOpen(!isOpen)}
        style={[
          styles.button,
          { backgroundColor: bgColor, borderColor: borderColor },
          buttonStyle,
        ]}>
        <Text
          numberOfLines={1}
          style={[styles.buttonText, { color: textColor }, textStyle]}>
          {renderDisplayText()}
        </Text>
        <DownArrowIcon color={textColor} isOpen={isOpen} />
      </TouchableOpacity>

      {/* Dropdown Modal List */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.dropdownList,
                { backgroundColor: dropdownBgColor, borderColor: borderColor },
                dropdownListStyle,
              ]}>
              <FlatList
                data={options}
                keyExtractor={(item) => String(item.value)}
                renderItem={({ item }) => {
                  const isSelected = selectedItems.some(
                    (s) => s.value === item.value,
                  );

                  return (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleOptionPress(item)}
                      style={[
                        styles.optionItem,
                        isSelected && styles.selectedOptionItem,
                      ]}>
                      <Text
                        style={[
                          styles.optionText,
                          { color: dropdownTextColor },
                          isSelected && styles.selectedOptionText,
                        ]}>
                        {item.label}
                      </Text>
                      {isSelected && (
                        <Text
                          style={[
                            styles.checkMark,
                            { color: dropdownTextColor },
                          ]}>
                          ✓
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: BorderWidth.base,
  },
  buttonText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    flex: 1,
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderStyle: "solid",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginLeft: Spacing.sm,
  },
  arrowUp: {
    transform: [{ rotate: "180deg" }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  dropdownList: {
    width: "100%",
    maxHeight: 280,
    borderRadius: Radius.lg,
    borderWidth: BorderWidth.base,
    paddingVertical: Spacing.xs,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  selectedOptionItem: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  optionText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
  },
  selectedOptionText: {
    fontWeight: FontWeight.bold,
  },
  checkMark: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
});

export default Dropdown;

/*  EXAMPLE USAGE
const options = [
  { label: "Retail", value: "retail" },
  { label: "Wholesale", value: "wholesale" },
  { label: "Restaurant", value: "restaurant" },
];

// Single select
<Dropdown
  options={options}
  placeholder="Select Business Type"
  defaultValue={options[0]}
  maxSelectable={1}
  bgColor={Colors_SalesPage.surface}
  textColor={Colors_SalesPage.textPrimary}
  onSelect={(selected) => console.log(selected)}
/>

// Multi select (up to 2 options)
<Dropdown
  options={options}
  placeholder="Select Types"
  maxSelectable={2}
  onSelect={(selected) => console.log(selected)}
/>

*/
