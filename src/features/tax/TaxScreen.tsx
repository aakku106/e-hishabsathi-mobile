import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PageHeader } from "@/shared/components/Header/PageHeader";
import { Dropdown, type DropdownOption } from "@/shared/components/DatePicker/DropDown";
import { Colors_TaxPage } from "@/shared/constants/colors";
import { BorderWidth, Radius } from "@/shared/constants/radius";
import { Spacing } from "@/shared/constants/spacing";
import { FontSize, FontWeight } from "@/shared/constants/typography";
import { formatCurrency } from "@/shared/utils/formatter";

import { useTaxSummary } from "./hooks/useTax";
import { taxMonthOptions } from "./data/tax.repository";
import { VAT_RATE } from "./types";

const colors = Colors_TaxPage;

export default function TaxScreen() {
  const router = useRouter();
  const options = taxMonthOptions();
  const [selected, setSelected] = useState<DropdownOption>(options[options.length - 1]);

  const { data: summary, isLoading } = useTaxSummary(String(selected.value));

  const netPayable = summary?.netVatPayable ?? 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          title="Tax / VAT"
          subtitle="Monthly VAT summary for your shop"
          icon="file-percent-outline"
          gradient={[colors.primary, colors.primaryDeep]}
          onBack={() => router.back()}
        />

        <View style={styles.monthRow}>
          <Dropdown
            options={options}
            defaultValue={selected}
            placeholder="Select month"
            maxSelectable={1}
            onSelect={(option) => setSelected(option as DropdownOption)}
            bgColor={colors.surface}
            textColor={colors.textPrimary}
            borderColor={colors.border}
            dropdownBgColor={colors.surface}
            dropdownTextColor={colors.textPrimary}
            buttonStyle={styles.monthButton}
            textStyle={{ fontWeight: FontWeight.semibold }}
          />
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : (
          <>
            <LinearGradient
              colors={[colors.primary, colors.primaryDeep]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <Text style={styles.heroLabel}>
                Taxable sales · {selected.label}
              </Text>
              <Text style={styles.heroValue}>
                {formatCurrency(summary?.taxableSales ?? 0)}
              </Text>
              <Text style={styles.heroMeta}>
                {summary?.saleCount ?? 0} sale entries this month
              </Text>
            </LinearGradient>

            <View style={styles.grid}>
              <View style={styles.gridCard}>
                <View style={styles.gridIcon}>
                  <MaterialCommunityIcons
                    name="trending-up"
                    size={18}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.gridLabel}>Output VAT</Text>
                <Text style={styles.gridValue}>
                  {formatCurrency(summary?.outputVat ?? 0)}
                </Text>
                <Text style={styles.gridMeta}>
                  {Math.round(VAT_RATE * 100)}% on sales
                </Text>
              </View>
              <View style={styles.gridCard}>
                <View style={styles.gridIcon}>
                  <MaterialCommunityIcons
                    name="trending-down"
                    size={18}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.gridLabel}>Input VAT credit</Text>
                <Text style={styles.gridValue}>
                  {formatCurrency(summary?.inputVat ?? 0)}
                </Text>
                <Text style={styles.gridMeta}>
                  {Math.round(VAT_RATE * 100)}% on purchases
                </Text>
              </View>
            </View>

            <View style={[styles.netCard, netPayable < 0 && styles.netCardCredit]}>
              <View style={styles.netLeft}>
                <Text style={styles.netLabel}>Net VAT payable</Text>
                <Text style={[styles.netValue, netPayable < 0 && styles.netValueCredit]}>
                  {netPayable < 0 ? "(credit) " : ""}
                  {formatCurrency(Math.abs(netPayable))}
                </Text>
              </View>
              <View
                style={[
                  styles.netBadge,
                  netPayable < 0 ? styles.netBadgeCredit : styles.netBadgeDue,
                ]}
              >
                <Text
                  style={[
                    styles.netBadgeText,
                    netPayable < 0
                      ? styles.netBadgeTextCredit
                      : styles.netBadgeTextDue,
                  ]}
                >
                  {netPayable < 0 ? "Credit" : "Due"}
                </Text>
              </View>
            </View>

            <View style={styles.noteCard}>
              <MaterialCommunityIcons
                name="information-outline"
                size={18}
                color={colors.textSecondary}
              />
              <Text style={styles.noteText}>
                VAT is calculated at {Math.round(VAT_RATE * 100)}% on the
                selected month&apos;s sales and purchases. Values come from your
                Sales and Buy entries.
              </Text>
            </View>
          </>
        )}
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
  monthRow: {
    marginTop: Spacing.xl,
    marginHorizontal: Spacing.lg,
    alignItems: "center",
  },
  monthButton: {
    minWidth: 200,
    borderRadius: Radius.md,
    borderWidth: BorderWidth.thin,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  loader: {
    marginTop: Spacing["3xl"],
  },
  heroCard: {
    marginTop: Spacing.xl,
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    gap: Spacing.xs,
    shadowColor: colors.primaryDeep,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 5,
  },
  heroLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  heroValue: {
    color: "#FFFFFF",
    fontSize: FontSize["4xl"],
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
  },
  heroMeta: {
    color: "rgba(255,255,255,0.75)",
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
  },
  grid: {
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.lg,
    flexDirection: "row",
    gap: Spacing.md,
  },
  gridCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: Radius.lg,
    borderWidth: BorderWidth.thin,
    borderColor: colors.border,
    padding: Spacing.lg,
    gap: Spacing.xs,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  gridIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  gridLabel: {
    color: colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  gridValue: {
    color: colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  gridMeta: {
    color: colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.regular,
  },
  netCard: {
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: Radius.lg,
    borderWidth: BorderWidth.thin,
    borderColor: colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  netCardCredit: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  netLeft: {
    flex: 1,
    gap: 2,
  },
  netLabel: {
    color: colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  netValue: {
    color: colors.textPrimary,
    fontSize: FontSize["2xl"],
    fontWeight: FontWeight.bold,
  },
  netValueCredit: {
    color: "#047857",
  },
  netBadge: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  netBadgeDue: {
    backgroundColor: colors.primarySoft,
  },
  netBadgeCredit: {
    backgroundColor: "#A7F3D0",
  },
  netBadgeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  netBadgeTextDue: {
    color: colors.primaryDeep,
  },
  netBadgeTextCredit: {
    color: "#047857",
  },
  noteCard: {
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.lg,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  noteText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    lineHeight: 18,
  },
});
