import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import TopButton from "@/shared/components/Button/TopButton";
import LabeledInput from "@/shared/components/Input/LabledInput";
import { Colors_SalesPage } from "@/shared/constants/colors";
import { BorderWidth, Radius } from "@/shared/constants/radius";
import { Spacing } from "@/shared/constants/spacing";
import { FontSize, FontWeight } from "@/shared/constants/typography";

import { useSalesEntries } from "../hooks/useSalesEntries";

export default function SalesEntryForm() {
  const salesEntries = useSalesEntries();

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.hero}>
        <TopButton
          title="SALES"
          style={styles.titlePill}
          textStyle={styles.titlePillText}
        />
      </View>

      <View style={styles.fieldGroup}>
        <LabeledInput
          label="Quantity"
          placeholder="Enter Quantity"
          labelColor={Colors_SalesPage.textPrimary}
          inputBgColor={Colors_SalesPage.inputBG}
          borderColor={Colors_SalesPage.border}
          placeholderColor="rgba(31,31,31,0.55)"
          containerStyle={styles.inputBlock}
          labelStyle={styles.inputLabel}
          inputStyle={styles.inputText}
          inputContainerStyle={styles.inputContainer}
        />

        <LabeledInput
          label="Product"
          placeholder="Enter Product name"
          labelColor={Colors_SalesPage.textPrimary}
          inputBgColor={Colors_SalesPage.inputBG}
          borderColor={Colors_SalesPage.border}
          placeholderColor="rgba(31,31,31,0.55)"
          containerStyle={styles.inputBlock}
          labelStyle={styles.inputLabel}
          inputStyle={styles.inputText}
          inputContainerStyle={styles.inputContainer}
        />

        <LabeledInput
          label="Price"
          placeholder="Rs."
          keyboardType="numeric"
          labelColor={Colors_SalesPage.textPrimary}
          inputBgColor={Colors_SalesPage.inputBG}
          borderColor={Colors_SalesPage.border}
          placeholderColor="rgba(31,31,31,0.55)"
          containerStyle={styles.inputBlock}
          labelStyle={styles.inputLabel}
          inputStyle={styles.inputText}
          inputContainerStyle={styles.inputContainer}
        />
      </View>

      <View style={styles.moreRow}>
        <Text style={styles.moreText}>More</Text>
        <MaterialCommunityIcons
          name="chevron-down"
          size={24}
          color={Colors_SalesPage.textPrimary}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing["3xl"],
  },
  hero: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  titlePill: {
    minWidth: 148,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors_SalesPage.topBtn,
    borderColor: "rgba(255, 255, 255, 0.45)",
    shadowOpacity: 0.08,
    elevation: 1,
  },
  titlePillText: {
    color: Colors_SalesPage.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    letterSpacing: 1.2,
  },
  fieldGroup: {
    gap: Spacing["2xl"],
  },
  inputBlock: {
    gap: Spacing.sm,
  },
  inputContainer: {
    backgroundColor: Colors_SalesPage.inputBG,
    borderColor: Colors_SalesPage.border,
    shadowOpacity: 0,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
    elevation: 0,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  inputLabel: {
    fontSize: FontSize["3xl"],
    fontWeight: FontWeight.bold,
    lineHeight: 36,
  },
  inputText: {
    color: Colors_SalesPage.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.regular,
  },
  moreRow: {
    marginTop: Spacing["3xl"],
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  moreText: {
    color: Colors_SalesPage.textPrimary,
    fontSize: FontSize["2xl"],
    fontWeight: FontWeight.bold,
  },
  scrollRevealSpacer: {
    height: Spacing["4xl"],
  },
  summarySection: {
    gap: Spacing.md,
  },
  sectionTitle: {
    color: Colors_SalesPage.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors_SalesPage.surface,
    borderRadius: Radius.xl,
    borderWidth: BorderWidth.base,
    borderColor: Colors_SalesPage.border,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    gap: Spacing.xxs,
  },
  summaryLabel: {
    color: Colors_SalesPage.textPrimary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  summaryValue: {
    color: Colors_SalesPage.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    textAlign: "center",
  },
  summaryDivider: {
    width: BorderWidth.thin,
    alignSelf: "stretch",
    backgroundColor: Colors_SalesPage.border,
  },
  listSection: {
    marginTop: Spacing["4xl"],
    gap: Spacing.md,
  },
  listCard: {
    backgroundColor: Colors_SalesPage.inputBG,
    borderRadius: Radius.xl,
    borderWidth: BorderWidth.base,
    borderColor: Colors_SalesPage.border,
    overflow: "hidden",
  },
  entryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  entryDivider: {
    borderBottomWidth: BorderWidth.thin,
    borderBottomColor: Colors_SalesPage.border,
  },
  entryContent: {
    flex: 1,
  },
  entryName: {
    color: Colors_SalesPage.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  entryMeta: {
    color: Colors_SalesPage.textPrimary,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  entryRight: {
    alignItems: "flex-end",
  },
  entryAmount: {
    color: Colors_SalesPage.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  entryStatus: {
    color: Colors_SalesPage.textPrimary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    marginTop: 2,
    textTransform: "uppercase",
  },
});
