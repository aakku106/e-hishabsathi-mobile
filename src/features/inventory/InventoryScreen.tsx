import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/providers/ThemeProvider";
import { PrimaryButton } from "@/shared/components/Button/PrimaryButton";
import { AppHeader } from "@/shared/components/Header/AppHeader";
import { LabeledInput } from "@/shared/components/Input/LabledInput";
import {
  Colors_InventoryPage,
  getThemedColors,
} from "@/shared/constants/colors";
import { BorderWidth, Radius } from "@/shared/constants/radius";
import { boxShadow } from "@/shared/constants/shadows";
import { Spacing } from "@/shared/constants/spacing";
import { FontSize, FontWeight } from "@/shared/constants/typography";
import { formatCurrency } from "@/shared/utils/formatter";
import {
  hapticError,
  hapticImpact,
  hapticSuccess,
} from "@/shared/utils/haptics";

import {
  useAdjustProductStock,
  useCreateProduct,
  usePagedProducts,
  useProductSummary,
} from "./hooks/useInventory";
import { CreateProductSchema } from "./validation";

const LOW_STOCK_THRESHOLD = 10;

const lowStockColors = {
  light: { bg: "#FEF3C7", border: "#FDE68A", text: "#92400E" },
  dark: { bg: "#3D2A00", border: "#854D0E", text: "#FDE68A" },
};

export default function InventoryScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const colors = useMemo(
    () => getThemedColors(Colors_InventoryPage, isDark),
    [isDark],
  );
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [stock, setStock] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [headerHeight, setHeaderHeight] = useState(0);

  const {
    products,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    error: productsError,
    refetch: refetchProducts,
  } = usePagedProducts();
  const {
    data: summary,
    isLoading: isSummaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useProductSummary();
  const dataError = productsError ?? summaryError;
  const createProduct = useCreateProduct();
  const adjustStock = useAdjustProductStock();

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const handleAddProduct = () => {
    const parsed = CreateProductSchema.safeParse({
      name,
      category: category || null,
      price: price || "0",
      costPrice: costPrice || null,
      stockQuantity: stock || "0",
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      hapticError();
      return;
    }

    setErrors({});
    createProduct.mutate(parsed.data, {
      onSuccess: () => {
        hapticSuccess();
        setName("");
        setCategory("");
        setPrice("");
        setCostPrice("");
        setStock("");
        setShowForm(false);
      },
      onError: hapticError,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <View style={styles.headerOverlay} onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)}>
        <AppHeader
          title="Inventory"
          colors={colors}
          onBack={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/(tabs)/05-settings");
            }
          }}
          edgeToEdge
        />
      </View>

      <FlatList
        data={products}
        keyExtractor={(product) => String(product.id)}
        renderItem={({ item: product, index }) => {
          const lowStock = product.stockQuantity < LOW_STOCK_THRESHOLD;
          return (
            <View
              style={[
                styles.productRow,
                index === 0 && styles.productRowFirst,
                index === products.length - 1 &&
                  !hasNextPage &&
                  styles.productRowLast,
              ]}>
              <View style={styles.productIcon}>
                <MaterialCommunityIcons
                  name="package-variant-closed"
                  size={18}
                  color={colors.primary}
                />
              </View>
              <View style={styles.productContent}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productMeta}>
                  {product.category ?? "No category"} ·{" "}
                  {formatCurrency(product.price)}
                </Text>
                <Text
                  style={[
                    styles.stockText,
                    lowStock && styles.stockTextLow,
                  ]}>
                  Stock: {product.stockQuantity} {lowStock ? "(low)" : ""}
                </Text>
              </View>

              <View style={styles.stockControls}>
                <TouchableOpacity
                  style={styles.stockButton}
                  activeOpacity={0.8}
                  onPress={() =>
                    adjustStock.mutate(
                      { id: product.id, delta: -1 },
                      {
                        onSuccess: () => hapticImpact(),
                        onError: hapticError,
                      },
                    )
                  }
                  disabled={product.stockQuantity <= 0}>
                  <MaterialCommunityIcons
                    name="minus"
                    size={16}
                    color={colors.textPrimary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.stockButton}
                  activeOpacity={0.8}
                  onPress={() =>
                    adjustStock.mutate(
                      { id: product.id, delta: 1 },
                      {
                        onSuccess: () => hapticImpact(),
                        onError: hapticError,
                      },
                    )
                  }>
                  <MaterialCommunityIcons
                    name="plus"
                    size={16}
                    color={colors.textPrimary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ItemSeparatorComponent={() => (
          <View style={styles.productDivider} />
        )}
        contentContainerStyle={[styles.content, { paddingTop: headerHeight + Spacing.lg }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={7}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            void fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <>
            <View style={styles.summaryCard}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Products</Text>
                <Text style={styles.summaryValue}>
                  {isSummaryLoading ? "…" : (summary?.productCount ?? 0)}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Units</Text>
                <Text style={styles.summaryValue}>
                  {isSummaryLoading ? "…" : (summary?.totalUnits ?? 0)}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Stock value</Text>
                <Text style={[styles.summaryValue, { color: colors.primary }]}>
                  {isSummaryLoading ?
                    "…"
                  : formatCurrency(summary?.totalStockValue ?? 0)}
                </Text>
              </View>
            </View>

            {!!(summary?.lowStockCount ?? 0) && (
              <View
                style={[
                  styles.lowStockNote,
                  {
                    backgroundColor:
                      isDark ?
                        lowStockColors.dark.bg
                      : lowStockColors.light.bg,
                    borderColor:
                      isDark ?
                        lowStockColors.dark.border
                      : lowStockColors.light.border,
                  },
                ]}>
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={16}
                  color={
                    isDark ?
                      lowStockColors.dark.text
                    : lowStockColors.light.text
                  }
                />
                <Text
                  style={[
                    styles.lowStockNoteText,
                    {
                      color:
                        isDark ?
                          lowStockColors.dark.text
                        : lowStockColors.light.text,
                    },
                  ]}>
                  {summary?.lowStockCount} product(s) have low stock (below{" "}
                  {LOW_STOCK_THRESHOLD} units).
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.toggleButton}
              activeOpacity={0.85}
              onPress={() => setShowForm((v) => !v)}>
              <View style={styles.toggleIcon}>
                <MaterialCommunityIcons
                  name={showForm ? "minus" : "plus"}
                  size={18}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.toggleButtonText}>
                {showForm ? "Hide add product" : "Add product"}
              </Text>
              <MaterialCommunityIcons
                name={showForm ? "chevron-up" : "chevron-down"}
                size={22}
                color={colors.textMuted}
              />
            </TouchableOpacity>

            {showForm && (
              <View style={styles.formCard}>
                <View style={styles.field}>
                  <LabeledInput
                    label="Product Name"
                    placeholder="e.g. Black Pants"
                    value={name}
                    onChangeText={setName}
                    labelColor={colors.textPrimary}
                    inputBgColor={colors.inputBG}
                    borderColor={colors.border}
                    placeholderColor={colors.textMuted}
                    labelStyle={styles.inputLabel}
                    inputStyle={styles.inputText}
                    inputContainerStyle={styles.inputContainer}
                  />
                  {!!errors.name && (
                    <Text style={styles.errorText}>{errors.name}</Text>
                  )}
                </View>

                <View style={styles.field}>
                  <LabeledInput
                    label="Category (optional)"
                    placeholder="e.g. Clothing"
                    value={category}
                    onChangeText={setCategory}
                    labelColor={colors.textPrimary}
                    inputBgColor={colors.inputBG}
                    borderColor={colors.border}
                    placeholderColor={colors.textMuted}
                    labelStyle={styles.inputLabel}
                    inputStyle={styles.inputText}
                    inputContainerStyle={styles.inputContainer}
                  />
                </View>

                <View style={styles.field}>
                  <LabeledInput
                    label="Selling Price"
                    placeholder="Rs."
                    keyboardType="decimal-pad"
                    value={price}
                    onChangeText={setPrice}
                    labelColor={colors.textPrimary}
                    inputBgColor={colors.inputBG}
                    borderColor={colors.border}
                    placeholderColor={colors.textMuted}
                    labelStyle={styles.inputLabel}
                    inputStyle={styles.inputText}
                    inputContainerStyle={styles.inputContainer}
                  />
                  {!!errors.price && (
                    <Text style={styles.errorText}>{errors.price}</Text>
                  )}
                </View>

                <View style={styles.field}>
                  <LabeledInput
                    label="Cost Price (optional)"
                    placeholder="Rs."
                    keyboardType="decimal-pad"
                    value={costPrice}
                    onChangeText={setCostPrice}
                    labelColor={colors.textPrimary}
                    inputBgColor={colors.inputBG}
                    borderColor={colors.border}
                    placeholderColor={colors.textMuted}
                    labelStyle={styles.inputLabel}
                    inputStyle={styles.inputText}
                    inputContainerStyle={styles.inputContainer}
                  />
                </View>

                <View style={styles.field}>
                  <LabeledInput
                    label="Initial Stock"
                    placeholder="0"
                    keyboardType="number-pad"
                    value={stock}
                    onChangeText={setStock}
                    labelColor={colors.textPrimary}
                    inputBgColor={colors.inputBG}
                    borderColor={colors.border}
                    placeholderColor={colors.textMuted}
                    labelStyle={styles.inputLabel}
                    inputStyle={styles.inputText}
                    inputContainerStyle={styles.inputContainer}
                  />
                  {!!errors.stockQuantity && (
                    <Text style={styles.errorText}>
                      {errors.stockQuantity}
                    </Text>
                  )}
                </View>

                <PrimaryButton
                  title="Add product"
                  loading={createProduct.isPending}
                  onPress={handleAddProduct}
                  gradient={[colors.primary, colors.primaryDeep]}
                />
                {createProduct.isError && (
                  <Text style={styles.errorText}>
                    Could not add the product. Please try again.
                  </Text>
                )}
              </View>
            )}

            <View style={styles.listSection}>
              <Text style={styles.sectionTitle}>Products</Text>
            </View>
            {!!dataError && (
              <View style={styles.dataError}>
                <Text style={styles.errorText}>
                  Could not load inventory data: {dataError.message}
                </Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={() => {
                    void refetchProducts();
                    void refetchSummary();
                  }}>
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          isLoading ?
            <ActivityIndicator
              color={colors.primary}
              style={styles.listLoading}
            />
          : <View style={styles.listCard}>
              <Text style={styles.emptyText}>
                {productsError ?
                  "Products could not be loaded."
                : "No products yet. Add your first product above."}
              </Text>
          </View>
        }
        ListFooterComponent={
          isFetchingNextPage ?
            <ActivityIndicator
              color={colors.primary}
              style={styles.listLoading}
            />
          : undefined
        }
      />
    </SafeAreaView>
  );
}

function createStyles(colors: typeof Colors_InventoryPage, isDark: boolean) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flexGrow: 1,
      paddingBottom: Spacing["4xl"],
    },
    headerOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 20,
      pointerEvents: "box-none",
    },
    summaryCard: {
      marginTop: Spacing.xl,
      marginHorizontal: Spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: Radius.lg,
      borderWidth: BorderWidth.thin,
      borderColor: colors.border,
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.sm,
      boxShadow: boxShadow({ y: 6, blur: 16, color: "#0F172A", opacity: 0.05 }),
    },
    summaryItem: {
      flex: 1,
      alignItems: "center",
      gap: Spacing.xxs,
    },
    summaryLabel: {
      color: colors.textMuted,
      fontSize: FontSize.xs,
      fontWeight: FontWeight.semibold,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    summaryValue: {
      color: colors.textPrimary,
      fontSize: FontSize.xl,
      fontWeight: FontWeight.bold,
      textAlign: "center",
    },
    summaryDivider: {
      width: BorderWidth.thin,
      alignSelf: "stretch",
      backgroundColor: colors.border,
    },
    lowStockNote: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.sm,
      marginTop: Spacing.lg,
      marginHorizontal: Spacing.lg,
      borderRadius: Radius.md,
      borderWidth: BorderWidth.thin,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
    },
    lowStockNoteText: {
      flex: 1,
      fontSize: FontSize.sm,
      fontWeight: FontWeight.medium,
    },
    toggleButton: {
      marginTop: Spacing.lg,
      marginHorizontal: Spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing.sm,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.pill,
      backgroundColor: colors.surface,
      borderWidth: BorderWidth.thin,
      borderColor: colors.border,
    },
    toggleIcon: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: colors.primarySoft,
      alignItems: "center",
      justifyContent: "center",
    },
    toggleButtonText: {
      color: colors.textPrimary,
      fontSize: FontSize.md,
      fontWeight: FontWeight.semibold,
    },
    formCard: {
      marginTop: Spacing.lg,
      marginHorizontal: Spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: Radius.lg,
      borderWidth: BorderWidth.thin,
      borderColor: colors.border,
      padding: Spacing.lg,
      gap: Spacing.lg,
      boxShadow: boxShadow({ y: 6, blur: 16, color: "#0F172A", opacity: 0.05 }),
    },
    field: {
      gap: Spacing.xs,
    },
    inputContainer: {
      borderRadius: Radius.md,
      borderWidth: BorderWidth.thin,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      minHeight: 52,
    },
    inputLabel: {
      fontSize: FontSize.md,
      fontWeight: FontWeight.semibold,
      lineHeight: 20,
    },
    inputText: {
      color: colors.textPrimary,
      fontSize: FontSize.lg,
      fontWeight: FontWeight.regular,
    },
    errorText: {
      color: colors.danger,
      fontSize: FontSize.sm,
      fontWeight: FontWeight.medium,
    },
    listSection: {
      marginTop: Spacing["2xl"],
      marginHorizontal: Spacing.lg,
      gap: Spacing.md,
    },
    sectionTitle: {
      color: colors.textPrimary,
      fontSize: FontSize.lg,
      fontWeight: FontWeight.bold,
    },
    listCard: {
      backgroundColor: colors.surface,
      borderRadius: Radius.lg,
      borderWidth: BorderWidth.thin,
      borderColor: colors.border,
      overflow: "hidden",
    },
    dataError: {
      marginTop: Spacing.md,
      marginHorizontal: Spacing.lg,
      padding: Spacing.md,
      gap: Spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: Radius.md,
      borderWidth: BorderWidth.thin,
      borderColor: colors.danger,
    },
    retryText: {
      color: colors.primary,
      fontSize: FontSize.sm,
      fontWeight: FontWeight.semibold,
    },
    listLoading: {
      marginVertical: Spacing.xl,
    },
    productRow: {
      marginHorizontal: Spacing.lg,
      backgroundColor: colors.surface,
      borderLeftWidth: BorderWidth.thin,
      borderRightWidth: BorderWidth.thin,
      borderColor: colors.border,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      gap: Spacing.md,
    },
    productRowFirst: {
      borderTopWidth: BorderWidth.thin,
      borderTopLeftRadius: Radius.lg,
      borderTopRightRadius: Radius.lg,
    },
    productRowLast: {
      borderBottomWidth: BorderWidth.thin,
      borderBottomLeftRadius: Radius.lg,
      borderBottomRightRadius: Radius.lg,
    },
    productDivider: {
      borderBottomWidth: BorderWidth.thin,
      borderBottomColor: colors.border,
      marginHorizontal: Spacing.lg,
    },
    productIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: colors.primarySoft,
      alignItems: "center",
      justifyContent: "center",
    },
    productContent: {
      flex: 1,
      gap: 2,
    },
    productName: {
      color: colors.textPrimary,
      fontSize: FontSize.md,
      fontWeight: FontWeight.semibold,
    },
    productMeta: {
      color: colors.textMuted,
      fontSize: FontSize.sm,
    },
    stockText: {
      color: colors.textSecondary,
      fontSize: FontSize.sm,
      fontWeight: FontWeight.semibold,
    },
    stockTextLow: {
      color: colors.danger,
    },
    stockControls: {
      flexDirection: "row",
      gap: Spacing.sm,
    },
    stockButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.primarySoft,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyText: {
      color: colors.textMuted,
      fontSize: FontSize.md,
      textAlign: "center",
      paddingVertical: Spacing.xl,
      paddingHorizontal: Spacing.lg,
    },
  });
}
