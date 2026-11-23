import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { tierBoxShadow } from "@/shared/constants/shadows";
import { Spacing } from "@/shared/constants/spacing";
import { FontSize, FontWeight } from "@/shared/constants/typography";
import { useDeviceTier, type DeviceTier } from "@/shared/utils/deviceTier";
import { formatCurrency } from "@/shared/utils/formatter";
import {
  hapticError,
  hapticImpact,
  hapticSelection,
  hapticSuccess,
} from "@/shared/utils/haptics";

import { ProductDetailsSheet } from "./components/ProductDetailsSheet";
import { LOW_STOCK_THRESHOLD } from "./constants";
import {
  useAdjustProductStock,
  useCreateProduct,
  usePagedProducts,
  useProductSummary,
  useUpdateProduct,
} from "./hooks/useInventory";
import type { Product } from "./types";
import { CreateProductSchema } from "./validation";

const lowStockColors = {
  light: { bg: "#FEF3C7", border: "#FDE68A", text: "#92400E" },
  dark: { bg: "#3D2A00", border: "#854D0E", text: "#FDE68A" },
};

const keyExtractor = (product: Product) => String(product.id);

export default function InventoryScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const tier = useDeviceTier();
  const colors = useMemo(
    () => getThemedColors(Colors_InventoryPage, isDark),
    [isDark],
  );
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [detailsProduct, setDetailsProduct] = useState<Product | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [stock, setStock] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [headerHeight, setHeaderHeight] = useState(0);
  const [formOffset, setFormOffset] = useState(0);
  const listRef = useRef<FlatList<Product>>(null);
  const shouldScrollToForm = useRef(false);

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
  const updateProduct = useUpdateProduct();
  const { mutate: adjustProductStock } = useAdjustProductStock();

  const styles = useMemo(
    () => createStyles(colors, isDark, tier),
    [colors, isDark, tier],
  );

  const resetForm = () => {
    setEditingProduct(null);
    setName("");
    setCategory("");
    setPrice("");
    setCostPrice("");
    setStock("");
    setErrors({});
    setShowForm(false);
  };

  const handleSubmitProduct = () => {
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
    const onSuccess = () => {
      hapticSuccess();
      resetForm();
    };

    if (editingProduct) {
      updateProduct.mutate(
        { id: editingProduct.id, input: parsed.data },
        { onSuccess, onError: hapticError },
      );
      return;
    }

    createProduct.mutate(parsed.data, {
      onSuccess,
      onError: hapticError,
    });
  };

  /**
   * Row tap (outside the +/- controls) opens the read-only detail sheet; the
   * sheet's own button starts an edit.
   */
  const handleOpenDetails = useCallback((product: Product) => {
    hapticSelection();
    setDetailsProduct(product);
    setIsDetailsOpen(true);
  }, []);

  const handleCloseDetails = useCallback(() => setIsDetailsOpen(false), []);

  /** "Edit product" inside the sheet: close it and reveal the edit form. */
  const handleEditFromDetails = useCallback((product: Product) => {
    hapticSelection();
    setIsDetailsOpen(false);
    setEditingProduct(product);
    setName(product.name);
    setCategory(product.category ?? "");
    setPrice(String(product.price));
    setCostPrice(product.costPrice !== null ? String(product.costPrice) : "");
    setStock(String(product.stockQuantity));
    setErrors({});
    shouldScrollToForm.current = true;
    setShowForm(true);
  }, []);

  /**
   * The form lives in the list header, so opening it from a scrolled list would
   * leave it off-screen. Once it has a measured offset, bring it up to sit just
   * below the glass header.
   */
  useEffect(() => {
    if (!showForm || formOffset <= 0 || !shouldScrollToForm.current) return;

    requestAnimationFrame(() => {
      shouldScrollToForm.current = false;
      listRef.current?.scrollToOffset({
        offset: Math.max(0, formOffset + Spacing.lg),
        animated: true,
      });
    });
  }, [showForm, formOffset]);

  /** Stable so the memoized product rows keep their identity. */
  const handleAdjustStock = useCallback(
    (product: Product, delta: number) => {
      adjustProductStock(
        { id: product.id, delta },
        {
          onSuccess: () => hapticImpact(),
          onError: hapticError,
        },
      );
    },
    [adjustProductStock],
  );

  const renderProduct = useCallback(
    ({ item, index }: { item: Product; index: number }) => (
      <ProductRow
        product={item}
        isFirst={index === 0}
        isLast={index === products.length - 1 && !hasNextPage}
        colors={colors}
        styles={styles}
        onOpenDetails={handleOpenDetails}
        onAdjust={handleAdjustStock}
      />
    ),
    [
      colors,
      styles,
      products.length,
      hasNextPage,
      handleOpenDetails,
      handleAdjustStock,
    ],
  );

  const renderProductSeparator = useCallback(
    () => <View style={styles.productDivider} />,
    [styles],
  );

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
        ref={listRef}
        data={products}
        keyExtractor={keyExtractor}
        renderItem={renderProduct}
        ItemSeparatorComponent={renderProductSeparator}
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
              onPress={() => {
                if (showForm) {
                  resetForm();
                } else {
                  shouldScrollToForm.current = true;
                  setShowForm(true);
                }
              }}>
              <View style={styles.toggleIcon}>
                <MaterialCommunityIcons
                  name={showForm ? "minus" : "plus"}
                  size={18}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.toggleButtonText}>
                {showForm ?
                  editingProduct ?
                    "Hide edit product"
                  : "Hide add product"
                : "Add product"}
              </Text>
              <MaterialCommunityIcons
                name={showForm ? "chevron-up" : "chevron-down"}
                size={22}
                color={colors.textMuted}
              />
            </TouchableOpacity>

            {showForm && (
              <View
                style={styles.formCard}
                onLayout={(event) =>
                  setFormOffset(event.nativeEvent.layout.y)
                }>
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
                    label={editingProduct ? "Stock" : "Initial Stock"}
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
                  title={editingProduct ? "Save changes" : "Add product"}
                  loading={
                    editingProduct ?
                      updateProduct.isPending
                    : createProduct.isPending
                  }
                  onPress={handleSubmitProduct}
                  gradient={[colors.primary, colors.primaryDeep]}
                />
                {(editingProduct ? updateProduct : createProduct).isError && (
                  <Text style={styles.errorText}>
                    {editingProduct ?
                      "Could not update the product. Please try again."
                    : "Could not add the product. Please try again."}
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

      <ProductDetailsSheet
        product={detailsProduct}
        isPresented={isDetailsOpen}
        colors={colors}
        onDismiss={handleCloseDetails}
        onEdit={handleEditFromDetails}
      />
    </SafeAreaView>
  );
}

type ProductRowProps = {
  product: Product;
  isFirst: boolean;
  isLast: boolean;
  colors: typeof Colors_InventoryPage;
  styles: ReturnType<typeof createStyles>;
  onOpenDetails: (product: Product) => void;
  onAdjust: (product: Product, delta: number) => void;
};

/**
 * Memoized so adjusting stock or opening the form doesn't re-render every
 * product row. All props are stable (`colors`/`styles` are memoized by the
 * screen and the callbacks are `useCallback`-wrapped).
 */
const ProductRow = memo(function ProductRow({
  product,
  isFirst,
  isLast,
  colors,
  styles,
  onOpenDetails,
  onAdjust,
}: ProductRowProps) {
  const lowStock = product.stockQuantity < LOW_STOCK_THRESHOLD;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={`View details for ${product.name}`}
      onPress={() => onOpenDetails(product)}
      style={[
        styles.productRow,
        isFirst && styles.productRowFirst,
        isLast && styles.productRowLast,
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
          {product.category ?? "No category"} · {formatCurrency(product.price)}
        </Text>
        <Text style={[styles.stockText, lowStock && styles.stockTextLow]}>
          Stock: {product.stockQuantity} {lowStock ? "(low)" : ""}
        </Text>
      </View>

      <View style={styles.stockControls}>
        <TouchableOpacity
          style={styles.stockButton}
          activeOpacity={0.8}
          onPress={() => onAdjust(product, -1)}
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
          onPress={() => onAdjust(product, 1)}>
          <MaterialCommunityIcons
            name="plus"
            size={16}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});

function createStyles(
  colors: typeof Colors_InventoryPage,
  isDark: boolean,
  tier: DeviceTier,
) {
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
      boxShadow: tierBoxShadow(tier, {
        y: 6,
        blur: 16,
        color: "#0F172A",
        opacity: 0.05,
      }),
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
      boxShadow: tierBoxShadow(tier, {
        y: 6,
        blur: 16,
        color: "#0F172A",
        opacity: 0.05,
      }),
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
