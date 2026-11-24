import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomSheet, RNHostView } from "@expo/ui";
import { memo, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { PrimaryButton } from "@/shared/components/Button/PrimaryButton";
import { Colors_InventoryPage } from "@/shared/constants/colors";
import { BorderWidth, Radius } from "@/shared/constants/radius";
import { withAlpha } from "@/shared/constants/shadows";
import { Spacing } from "@/shared/constants/spacing";
import { FontSize, FontWeight } from "@/shared/constants/typography";
import { formatCurrency } from "@/shared/utils/formatter";

import { LOW_STOCK_THRESHOLD } from "../constants";
import type { Product } from "../types";

type ProductDetailsSheetProps = {
  /**
   * Product currently shown. Kept after dismissal so the sheet still has
   * content while its native close animation runs.
   */
  product: Product | null;
  isPresented: boolean;
  colors: typeof Colors_InventoryPage;
  onDismiss: () => void;
  onEdit: (product: Product) => void;
  /** Confirmation and the actual delete live in the screen. */
  onDelete: (product: Product) => void;
};

type DetailRow = {
  label: string;
  value: string;
  /** Optional accent for values that carry a good/bad meaning (profit). */
  color?: string;
};

function getStockStatus(stock: number, colors: typeof Colors_InventoryPage) {
  if (stock <= 0) {
    return { label: "Out of stock", color: colors.danger };
  }
  if (stock < LOW_STOCK_THRESHOLD) {
    return { label: "Low stock", color: colors.warning };
  }
  return { label: "In stock", color: colors.success };
}

/**
 * Product summary opened by tapping a row on the inventory list.
 *
 * The presentation is the native `@expo/ui` bottom sheet (a SwiftUI sheet on
 * iOS, a Material `ModalBottomSheet` on Android, a dialog on web) so the drag
 * indicator, backdrop, and dismiss gestures are the platform's own. The sheet's
 * children are regular React Native views, which keeps the content on the
 * inventory page tokens instead of a second design language.
 */
export const ProductDetailsSheet = memo(function ProductDetailsSheet({
  product,
  isPresented,
  colors,
  onDismiss,
  onEdit,
  onDelete,
}: ProductDetailsSheetProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const status = product ? getStockStatus(product.stockQuantity, colors) : null;

  const profit =
    product && product.costPrice !== null ?
      product.price - product.costPrice
    : null;
  const margin =
    profit !== null && product && product.price > 0 ?
      Math.round((profit / product.price) * 100)
    : null;

  const rows: DetailRow[] = [];
  if (product) {
    rows.push(
      { label: "Selling price", value: formatCurrency(product.price) },
      {
        label: "Cost price",
        value:
          product.costPrice !== null ?
            formatCurrency(product.costPrice)
          : "Not set",
      },
      {
        label: "Stock on hand",
        value: `${product.stockQuantity} ${product.stockQuantity === 1 ? "unit" : "units"}`,
      },
      {
        label: "Stock value",
        value: formatCurrency(product.price * product.stockQuantity),
      },
    );

    if (profit !== null && margin !== null) {
      rows.push({
        label: "Profit per unit",
        value: `${profit >= 0 ? "" : "-"}${formatCurrency(Math.abs(profit))} · ${margin}%`,
        color: profit >= 0 ? colors.success : colors.danger,
      });
    }
  }

  return (
    <BottomSheet
      isPresented={isPresented}
      onDismiss={onDismiss}
      containerColor={colors.surface}
      showDragIndicator>
      {product && status && (
        <RNHostView matchContents={{ vertical: true }}>
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.iconBadge}>
                <MaterialCommunityIcons
                  name="package-variant-closed"
                  size={22}
                  color={colors.primary}
                />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.name} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={styles.category}>
                  {product.category ?? "No category"}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: withAlpha(status.color, 0.14) },
                ]}>
                <Text style={[styles.statusText, { color: status.color }]}>
                  {status.label}
                </Text>
              </View>
            </View>

            <View style={styles.detailCard}>
              {rows.map((row, index) => (
                <View key={row.label}>
                  {index > 0 && <View style={styles.divider} />}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{row.label}</Text>
                    <Text
                      style={[
                        styles.detailValue,
                        row.color ? { color: row.color } : null,
                      ]}>
                      {row.value}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <PrimaryButton
              title="Edit product"
              onPress={() => onEdit(product)}
              gradient={[colors.primary, colors.primaryDeep]}
              style={styles.editButton}
            />

            <View style={styles.footerRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`Delete ${product.name}`}
                hitSlop={8}
                onPress={() => onDelete(product)}
                style={styles.footerButton}>
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={18}
                  color={colors.danger}
                />
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Close product details"
                hitSlop={8}
                onPress={onDismiss}
                style={styles.footerButton}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </RNHostView>
      )}
    </BottomSheet>
  );
});

function createStyles(colors: typeof Colors_InventoryPage) {
  return StyleSheet.create({
    content: {
      gap: Spacing.lg,
      paddingBottom: Spacing.lg,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.md,
    },
    iconBadge: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: colors.primarySoft,
      alignItems: "center",
      justifyContent: "center",
    },
    headerText: {
      flex: 1,
      gap: 2,
    },
    name: {
      color: colors.textPrimary,
      fontSize: FontSize.xl,
      fontWeight: FontWeight.bold,
    },
    category: {
      color: colors.textMuted,
      fontSize: FontSize.sm,
      fontWeight: FontWeight.medium,
    },
    statusBadge: {
      borderRadius: Radius.pill,
      paddingHorizontal: Spacing.md,
      paddingVertical: 4,
    },
    statusText: {
      fontSize: FontSize.sm,
      fontWeight: FontWeight.bold,
    },
    detailCard: {
      borderRadius: Radius.lg,
      borderWidth: BorderWidth.thin,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
      paddingHorizontal: Spacing.lg,
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: Spacing.md,
      paddingVertical: Spacing.md,
    },
    detailLabel: {
      color: colors.textSecondary,
      fontSize: FontSize.md,
      fontWeight: FontWeight.medium,
    },
    detailValue: {
      color: colors.textPrimary,
      fontSize: FontSize.md,
      fontWeight: FontWeight.semibold,
    },
    divider: {
      height: BorderWidth.thin,
      backgroundColor: colors.border,
    },
    editButton: {
      marginTop: Spacing.xs,
    },
    footerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing.xl,
    },
    footerButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.xs,
      paddingVertical: Spacing.xs,
      paddingHorizontal: Spacing.sm,
    },
    deleteText: {
      color: colors.danger,
      fontSize: FontSize.md,
      fontWeight: FontWeight.semibold,
    },
    closeText: {
      color: colors.textMuted,
      fontSize: FontSize.md,
      fontWeight: FontWeight.semibold,
    },
  });
}
