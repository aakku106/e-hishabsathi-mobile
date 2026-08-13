import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { PrimaryButton } from "@/shared/components/Button/PrimaryButton";
import { PageHeader } from "@/shared/components/Header/PageHeader";
import { LabeledInput } from "@/shared/components/Input/LabledInput";
import { Colors_SalesPage } from "@/shared/constants/colors";
import { BorderWidth, Radius } from "@/shared/constants/radius";
import { Spacing } from "@/shared/constants/spacing";
import { FontSize, FontWeight } from "@/shared/constants/typography";
import { formatCurrency } from "@/shared/utils/formatter";

import {
  useCreateSalesEntry,
  useSalesEntries,
  useSalesSummary,
} from "../hooks/useSalesEntries";
import { CreateSalesEntrySchema } from "../validation";

const colors = Colors_SalesPage;

export default function SalesEntryForm() {
  const [quantity, setQuantity] = useState("");
  const [product, setProduct] = useState("");
  const [price, setPrice] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: entries = [], isLoading } = useSalesEntries();
  const { data: summary } = useSalesSummary();
  const createEntry = useCreateSalesEntry();

  const handleSubmit = () => {
    const parsed = CreateSalesEntrySchema.safeParse({
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <PageHeader
        title="Sales"
        subtitle="Record what you sold today"
        icon="cash-multiple"
        gradient={[colors.primary, colors.primaryDeep]}
      />

      <View style={styles.formCard}>
        <View style={styles.fieldGroup}>
          <View style={styles.inputBlock}>
            <LabeledInput
              label="Quantity"
              placeholder="Enter Quantity"
              keyboardType="number-pad"
              value={quantity}
              onChangeText={setQuantity}
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

          <View style={styles.inputBlock}>
            <LabeledInput
              label="Product"
              placeholder="Enter Product name"
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

          <View style={styles.inputBlock}>
            <LabeledInput
              label="Price"
              placeholder="Rs."
              keyboardType="decimal-pad"
              value={price}
              onChangeText={setPrice}
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

      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Entries</Text>
          <Text style={styles.summaryValue}>{summary?.entryCount ?? 0}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Quantity</Text>
          <Text style={styles.summaryValue}>
            {summary?.totalQuantity ?? 0}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={[styles.summaryValue, { color: colors.primary }]}>
            {formatCurrency(summary?.totalAmount ?? 0)}
          </Text>
        </View>
      </View>

      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>Recent sales</Text>

        {isLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <View style={styles.listCard}>
            {entries.length === 0 && (
              <Text style={styles.emptyText}>
                No sales yet. Add your first entry above.
              </Text>
            )}
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
                    name="shopping-outline"
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

                <View style={styles.entryRight}>
                  <Text style={styles.entryAmount}>
                    {formatCurrency(entry.amount)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  fieldGroup: {
    gap: Spacing.lg,
  },
  inputBlock: {
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
  entryRight: {
    alignItems: "flex-end",
  },
  entryAmount: {
    color: colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: FontSize.md,
    textAlign: "center",
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
});
