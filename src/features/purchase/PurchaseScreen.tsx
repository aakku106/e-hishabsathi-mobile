import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/shared/components/Button/PrimaryButton";
import { PageHeader } from "@/shared/components/Header/PageHeader";
import { LabeledInput } from "@/shared/components/Input/LabledInput";
import { Colors_PurchasesPage } from "@/shared/constants/colors";
import { BorderWidth, Radius } from "@/shared/constants/radius";
import { Spacing } from "@/shared/constants/spacing";
import { FontSize, FontWeight } from "@/shared/constants/typography";
import { formatCurrency } from "@/shared/utils/formatter";

import {
  useCreatePurchaseEntry,
  usePurchaseEntries,
} from "./hooks/usePurchaseEntries";
import { CreatePurchaseEntrySchema } from "./validation";

const colors = Colors_PurchasesPage;

export default function PurchaseScreen() {
  const [quantity, setQuantity] = useState("");
  const [product, setProduct] = useState("");
  const [price, setPrice] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: entries = [], isLoading } = usePurchaseEntries();
  const createEntry = useCreatePurchaseEntry();

  const handleSubmit = () => {
    const parsed = CreatePurchaseEntrySchema.safeParse({
      product,
      quantity: quantity || "0",
      price: price || "0",
      amount: Number.parseFloat(quantity || "0") * Number.parseFloat(price || "0"),
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
    createEntry.mutate(parsed.data, {
      onSuccess: () => {
        setQuantity("");
        setProduct("");
        setPrice("");
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <PageHeader
            title="Purchases"
            subtitle="Track what you buy for your shop"
            icon="cart-outline"
            gradient={[colors.primary, colors.primaryDeep]}
          />

          <View style={styles.formCard}>
            <View style={styles.form}>
              <View style={styles.field}>
                <LabeledInput
                  label="Quantity"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="number-pad"
                  labelColor={colors.textPrimary}
                  inputBgColor={colors.inputBG}
                  borderColor={colors.border}
                  placeholderColor={colors.textMuted}
                  labelStyle={styles.inputLabel}
                  inputStyle={styles.inputText}
                  inputContainerStyle={styles.inputContainer}
                />
                {!!errors.quantity && (
                  <Text style={styles.errorText}>{errors.quantity}</Text>
                )}
              </View>

              <View style={styles.field}>
                <LabeledInput
                  label="Product"
                  placeholder="Enter product name"
                  value={product}
                  onChangeText={setProduct}
                  returnKeyType="next"
                  labelColor={colors.textPrimary}
                  inputBgColor={colors.inputBG}
                  borderColor={colors.border}
                  placeholderColor={colors.textMuted}
                  labelStyle={styles.inputLabel}
                  inputStyle={styles.inputText}
                  inputContainerStyle={styles.inputContainer}
                />
                {!!errors.product && (
                  <Text style={styles.errorText}>{errors.product}</Text>
                )}
              </View>

              <View style={styles.field}>
                <LabeledInput
                  label="Price"
                  placeholder="Enter price"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
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
            </View>

            <PrimaryButton
              title="Save entry"
              loading={createEntry.isPending}
              onPress={handleSubmit}
              gradient={[colors.primary, colors.primaryDeep]}
            />
            {createEntry.isError && (
              <Text style={styles.errorText}>
                Could not save the entry. Please try again.
              </Text>
            )}
          </View>

          <View style={styles.listSection}>
            <Text style={styles.listTitle}>Recent purchases</Text>
            {isLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : entries.length === 0 ? (
              <View style={styles.emptyCard}>
                <MaterialCommunityIcons
                  name="cart-outline"
                  size={28}
                  color={colors.textMuted}
                />
                <Text style={styles.emptyText}>
                  No purchases yet. Add your first entry above.
                </Text>
              </View>
            ) : (
              <View style={styles.listCard}>
                {entries.map((entry, index) => (
                  <View
                    key={entry.id}
                    style={[
                      styles.entryRow,
                      index !== entries.length - 1 && styles.entryDivider,
                    ]}
                  >
                    <View style={styles.entryIcon}>
                      <MaterialCommunityIcons
                        name="package-variant-closed"
                        size={18}
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.entryContent}>
                      <Text style={styles.entryName}>{entry.product}</Text>
                      <Text style={styles.entryMeta}>
                        Qty {entry.quantity} × {formatCurrency(entry.price)}
                      </Text>
                    </View>
                    <Text style={styles.entryAmount}>
                      {formatCurrency(entry.amount)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    paddingBottom: Spacing["4xl"],
  },
  formCard: {
    marginTop: Spacing.xl,
    marginHorizontal: Spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: Radius.lg,
    borderWidth: BorderWidth.thin,
    borderColor: colors.border,
    padding: Spacing.lg,
    gap: Spacing.xl,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  form: {
    gap: Spacing.lg,
  },
  field: {
    gap: Spacing.xs,
  },
  inputLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    lineHeight: 20,
  },
  inputContainer: {
    borderRadius: Radius.md,
    borderWidth: BorderWidth.thin,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minHeight: 52,
  },
  inputText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.regular,
    color: colors.textPrimary,
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
  listTitle: {
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
  entryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  entryDivider: {
    borderBottomWidth: BorderWidth.thin,
    borderBottomColor: colors.border,
  },
  entryIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  entryContent: {
    flex: 1,
    gap: 2,
  },
  entryName: {
    color: colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  entryMeta: {
    color: colors.textMuted,
    fontSize: FontSize.sm,
  },
  entryAmount: {
    color: colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: Radius.lg,
    borderWidth: BorderWidth.thin,
    borderColor: colors.border,
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing["2xl"],
    paddingHorizontal: Spacing.lg,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: FontSize.md,
    textAlign: "center",
  },
});
