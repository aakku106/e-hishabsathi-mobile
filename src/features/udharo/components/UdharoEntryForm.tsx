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
import { Colors_UdharoPage } from "@/shared/constants/colors";
import { BorderWidth, Radius } from "@/shared/constants/radius";
import { Spacing } from "@/shared/constants/spacing";
import { FontSize, FontWeight } from "@/shared/constants/typography";
import { formatCurrency } from "@/shared/utils/formatter";

import {
  useCreateUdharoEntry,
  useUdharoEntries,
  useUdharoSummary,
} from "../hooks/useUdharoEntries";
import { CreateUdharoEntrySchema } from "../validation";

const colors = Colors_UdharoPage;

const STATUS_LABELS: Record<string, string> = {
  on_track: "On track",
  overdue: "Overdue",
  paid: "Paid",
};

const STATUS_BADGE: Record<string, { bg: string; text: string }> = {
  on_track: { bg: "#D1FAE5", text: "#047857" },
  overdue: { bg: "#FFE4E6", text: "#BE123C" },
  paid: { bg: "#E2E8F0", text: "#475569" },
};

export default function UdharoEntryForm() {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: udharoEntries = [], isLoading } = useUdharoEntries();
  const { data: summary } = useUdharoSummary();
  const createEntry = useCreateUdharoEntry();

  const handleSubmit = () => {
    const parsed = CreateUdharoEntrySchema.safeParse({
      name,
      amount: amount || "0",
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
        setName("");
        setAmount("");
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
        title="Udharo"
        subtitle="Track money owed to you"
        icon="account-cash-outline"
        gradient={[colors.primary, colors.primaryDeep]}
      />

      <View style={styles.formCard}>
        <View style={styles.fieldGroup}>
          <View style={styles.inputBlock}>
            <LabeledInput
              label="Name"
              placeholder="Enter Name"
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

          <View style={styles.inputBlock}>
            <LabeledInput
              label="Amount"
              placeholder="Rs."
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              returnKeyType="done"
              labelColor={colors.textPrimary}
              inputBgColor={colors.inputBG}
              borderColor={colors.border}
              placeholderColor={colors.textMuted}
              labelStyle={styles.inputLabel}
              inputStyle={styles.inputText}
              inputContainerStyle={styles.inputContainer}
            />
            {!!errors.amount && (
              <Text style={styles.errorText}>{errors.amount}</Text>
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
          <Text style={styles.summaryLabel}>People</Text>
          <Text style={styles.summaryValue}>{summary?.entryCount ?? 0}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total udharo</Text>
          <Text style={[styles.summaryValue, { color: colors.primary }]}>
            {formatCurrency(summary?.totalAmount ?? 0)}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Overdue</Text>
          <Text style={styles.summaryValue}>{summary?.overdueCount ?? 0}</Text>
        </View>
      </View>

      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>Recent udharo</Text>

        {isLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <View style={styles.listCard}>
            {udharoEntries.length === 0 && (
              <Text style={styles.emptyText}>
                No udharo entries yet. Add your first one above.
              </Text>
            )}
            {udharoEntries.map((entry, index) => {
              const badge = STATUS_BADGE[entry.status] ?? STATUS_BADGE.on_track;
              return (
                <View
                  key={entry.id}
                  style={[
                    styles.entryRow,
                    index !== udharoEntries.length - 1 && styles.entryDivider,
                  ]}
                >
                  <View style={styles.entryIcon}>
                    <MaterialCommunityIcons
                      name="account-outline"
                      size={18}
                      color={colors.primary}
                    />
                  </View>

                  <View style={styles.entryContent}>
                    <Text style={styles.entryName}>{entry.name}</Text>
                    <View style={styles.statusBadgeWrap}>
                      <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                        <Text style={[styles.statusText, { color: badge.text }]}>
                          {STATUS_LABELS[entry.status] ?? "On track"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.entryRight}>
                    <Text style={styles.entryAmount}>
                      {formatCurrency(entry.amount)}
                    </Text>
                  </View>
                </View>
              );
            })}
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
    gap: 4,
  },
  entryName: {
    color: colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  statusBadgeWrap: {
    alignSelf: "flex-start",
  },
  statusBadge: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.4,
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
