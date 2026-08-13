import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/shared/components/Button/PrimaryButton";
import { PageHeader } from "@/shared/components/Header/PageHeader";
import { LabeledInput } from "@/shared/components/Input/LabledInput";
import { Colors_InventoryPage } from "@/shared/constants/colors";
import { BorderWidth, Radius } from "@/shared/constants/radius";
import { Spacing } from "@/shared/constants/spacing";
import { FontSize, FontWeight } from "@/shared/constants/typography";
import { formatCurrency } from "@/shared/utils/formatter";

import {
  useAdjustProductStock,
  useCreateProduct,
  useProducts,
  useProductSummary,
} from "./hooks/useInventory";
import { CreateProductSchema } from "./validation";

const colors = Colors_InventoryPage;
const LOW_STOCK_THRESHOLD = 10;

export default function InventoryScreen() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [stock, setStock] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: products = [], isLoading } = useProducts();
  const { data: summary } = useProductSummary();
  const createProduct = useCreateProduct();
  const adjustStock = useAdjustProductStock();

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
      return;
    }

    setErrors({});
    createProduct.mutate(parsed.data, {
      onSuccess: () => {
        setName("");
        setCategory("");
        setPrice("");
        setCostPrice("");
        setStock("");
        setShowForm(false);
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          title="Inventory"
          subtitle="Products and stock levels"
          icon="package-variant-closed"
          gradient={[colors.primary, colors.primaryDeep]}
          onBack={() => router.back()}
        />

        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Products</Text>
            <Text style={styles.summaryValue}>{summary?.productCount ?? 0}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Units</Text>
            <Text style={styles.summaryValue}>{summary?.totalUnits ?? 0}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Stock value</Text>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>
              {formatCurrency(summary?.totalStockValue ?? 0)}
            </Text>
          </View>
        </View>

        {!!(summary?.lowStockCount ?? 0) && (
          <View style={styles.lowStockNote}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={16}
              color="#B45309"
            />
            <Text style={styles.lowStockNoteText}>
              {summary?.lowStockCount} product(s) have low stock (below{" "}
              {LOW_STOCK_THRESHOLD} units).
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.toggleButton}
          activeOpacity={0.85}
          onPress={() => setShowForm((v) => !v)}
        >
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
              {!!errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
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
              {!!errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
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
                <Text style={styles.errorText}>{errors.stockQuantity}</Text>
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

          {isLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <View style={styles.listCard}>
              {products.length === 0 && (
                <Text style={styles.emptyText}>
                  No products yet. Add your first product above.
                </Text>
              )}
              {products.map((product, index) => {
                const lowStock = product.stockQuantity < LOW_STOCK_THRESHOLD;
                return (
                  <View
                    key={product.id}
                    style={[
                      styles.productRow,
                      index !== products.length - 1 && styles.productDivider,
                    ]}
                  >
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
                        ]}
                      >
                        Stock: {product.stockQuantity}{" "}
                        {lowStock ? "(low)" : ""}
                      </Text>
                    </View>

                    <View style={styles.stockControls}>
                      <TouchableOpacity
                        style={styles.stockButton}
                        activeOpacity={0.8}
                        onPress={() =>
                          adjustStock.mutate({ id: product.id, delta: -1 })
                        }
                        disabled={product.stockQuantity <= 0}
                      >
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
                          adjustStock.mutate({ id: product.id, delta: 1 })
                        }
                      >
                        <MaterialCommunityIcons
                          name="plus"
                          size={16}
                          color={colors.textPrimary}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    paddingBottom: Spacing["4xl"],
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
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
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
    backgroundColor: "#FEF3C7",
    borderRadius: Radius.md,
    borderWidth: BorderWidth.thin,
    borderColor: "#FDE68A",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  lowStockNoteText: {
    flex: 1,
    color: "#92400E",
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
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
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
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  productDivider: {
    borderBottomWidth: BorderWidth.thin,
    borderBottomColor: colors.border,
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
