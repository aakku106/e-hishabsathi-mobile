import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import TopButton from "@/shared/components/Button/TopButton";
import LabeledInput from "@/shared/components/Input/LabledInput";
import { Colors_UdharoPage } from "@/shared/constants/colors";
import { BorderWidth, Radius } from "@/shared/constants/radius";
import { Spacing } from "@/shared/constants/spacing";
import { FontSize, FontWeight } from "@/shared/constants/typography";

import { useUdharoEntries } from "../hooks/useUdharoEntries";

export default function UdharoEntryForm() {
  const udharoEntries = useUdharoEntries();

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <TopButton
          title="UDHARO"
          style={styles.titlePill}
          textStyle={styles.titlePillText}
        />
      </View>

      <View style={styles.fieldGroup}>
        <LabeledInput
          label="Name"
          placeholder="Enter Name"
          labelColor={Colors_UdharoPage.textPrimary}
          inputBgColor={Colors_UdharoPage.inputBG}
          borderColor={Colors_UdharoPage.border}
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
          labelColor={Colors_UdharoPage.textPrimary}
          inputBgColor={Colors_UdharoPage.inputBG}
          borderColor={Colors_UdharoPage.border}
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
          color={Colors_UdharoPage.textPrimary}
        />
      </View>

      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>Recent entries</Text>

        <View style={styles.listCard}>
          {udharoEntries.map((entry, index) => (
            <View
              key={`${entry.name}-${index}`}
              style={[
                styles.entryRow,
                index !== udharoEntries.length - 1 && styles.entryDivider,
              ]}>
              <View style={styles.entryContent}>
                <Text style={styles.entryName}>{entry.name}</Text>
                <Text style={styles.entryDue}>{entry.due}</Text>
              </View>

              <View style={styles.entryRight}>
                <Text style={styles.entryAmount}>{entry.amount}</Text>
                <Text style={styles.entryStatus}>{entry.status}</Text>
              </View>
            </View>
          ))}
        </View>
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
    backgroundColor: Colors_UdharoPage.topBtn,
    borderColor: "rgba(255, 255, 255, 0.45)",
    shadowOpacity: 0.08,
    elevation: 1,
  },
  titlePillText: {
    color: Colors_UdharoPage.textPrimary,
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
    backgroundColor: Colors_UdharoPage.inputBG,
    borderColor: Colors_UdharoPage.border,
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
    color: Colors_UdharoPage.textPrimary,
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
    color: Colors_UdharoPage.textPrimary,
    fontSize: FontSize["2xl"],
    fontWeight: FontWeight.bold,
  },
  listSection: {
    marginTop: Spacing["4xl"],
    gap: Spacing.md,
  },
  sectionTitle: {
    color: Colors_UdharoPage.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  listCard: {
    backgroundColor: Colors_UdharoPage.surface,
    borderRadius: Radius.xl,
    borderWidth: BorderWidth.base,
    borderColor: Colors_UdharoPage.border,
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
    borderBottomColor: Colors_UdharoPage.border,
  },
  entryContent: {
    flex: 1,
  },
  entryName: {
    color: Colors_UdharoPage.textSecondary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  entryDue: {
    color: Colors_UdharoPage.textSecondary,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  entryRight: {
    alignItems: "flex-end",
  },
  entryAmount: {
    color: Colors_UdharoPage.textSecondary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  entryStatus: {
    color: Colors_UdharoPage.textSecondary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    marginTop: 2,
    textTransform: "uppercase",
  },
});
