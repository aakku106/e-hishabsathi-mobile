import { useMemo, useState, type ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { LabeledInput } from "@/shared/components/Input/LabledInput";
import { BorderWidth, Radius } from "@/shared/constants/radius";
import { boxShadow, withAlpha } from "@/shared/constants/shadows";
import { Spacing } from "@/shared/constants/spacing";
import { FontSize, FontWeight } from "@/shared/constants/typography";

/**
 * The minimum a product needs to be for the picker. Keeping it local avoids a
 * `shared → features` import; `Product` from inventory is structurally
 * compatible.
 */
export type PickerProduct = {
  id: number;
  name: string;
  price: number;
  costPrice: number | null;
  stockQuantity: number;
};

type ProductPickerProps = ComponentProps<typeof LabeledInput> & {
  products: PickerProduct[];
  onSelectProduct: (product: PickerProduct) => void;
  /** Stock of the linked product, shown under the field. */
  stockQuantity?: number | null;
  /** Quantity being sold/purchased, used to warn when it exceeds stock. */
  requestedQuantity?: number;
  /** Colour for the helper text. Defaults to a muted version of the label. */
  mutedColor?: string;
  dangerColor?: string;
};

/**
 * Product name field with inventory suggestions. Picking a suggestion links the
 * entry to the product; typing a new name keeps it free text and the data layer
 * creates the product on save.
 */
export function ProductPicker({
  products,
  onSelectProduct,
  stockQuantity,
  requestedQuantity = 0,
  mutedColor,
  dangerColor = "#DC2626",
  value,
  onChangeText,
  onFocus,
  onBlur,
  labelColor = "#0F172A",
  inputBgColor = "#FFFFFF",
  borderColor = "#E2E8F0",
  ...inputProps
}: ProductPickerProps) {
  const [focused, setFocused] = useState(false);
  const query = (value ?? "").trim().toLowerCase();

  const matches = useMemo(() => {
    const pool =
      query ?
        products.filter((product) => product.name.toLowerCase().includes(query))
      : products;
    return pool.slice(0, 4);
  }, [products, query]);

  const helperColor = mutedColor ?? withAlpha(labelColor, 0.65);
  const overStock =
    stockQuantity != null && requestedQuantity > stockQuantity;

  return (
    <View>
      <LabeledInput
        {...inputProps}
        value={value}
        onChangeText={onChangeText}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        labelColor={labelColor}
        inputBgColor={inputBgColor}
        borderColor={borderColor}
      />

      {stockQuantity != null && (
        <Text
          style={[
            styles.hint,
            { color: overStock ? dangerColor : helperColor },
          ]}>
          {overStock ?
            `Only ${stockQuantity} in stock`
          : `${stockQuantity} in stock`}
        </Text>
      )}

      {focused && matches.length > 0 && (
        <View
          style={[
            styles.suggestions,
            { backgroundColor: inputBgColor, borderColor },
          ]}>
          {matches.map((product) => (
            <Pressable
              key={product.id}
              onPressIn={() => {
                onChangeText?.(product.name);
                onSelectProduct(product);
                setFocused(false);
              }}
              style={({ pressed }) => [
                styles.suggestion,
                pressed && styles.suggestionPressed,
              ]}>
              <Text
                numberOfLines={1}
                style={[styles.suggestionName, { color: labelColor }]}>
                {product.name}
              </Text>
              <Text style={[styles.suggestionMeta, { color: helperColor }]}>
                {product.stockQuantity} in stock · Rs. {product.price}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hint: {
    marginTop: Spacing.xs,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  suggestions: {
    marginTop: Spacing.xs,
    borderRadius: Radius.md,
    borderWidth: BorderWidth.thin,
    overflow: "hidden",
    boxShadow: boxShadow({ y: 4, blur: 10, color: "#0F172A", opacity: 0.1 }),
  },
  suggestion: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: 2,
  },
  suggestionPressed: {
    opacity: 0.6,
  },
  suggestionName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  suggestionMeta: {
    fontSize: FontSize.sm,
  },
});

export default ProductPicker;
