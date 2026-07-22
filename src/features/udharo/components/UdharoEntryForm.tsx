import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import TopButton from "@/shared/components/Button/TopButton";
import LabeledInput from "@/shared/components/Input/LabledInput";
import { Colors_UdharoPage } from "@/shared/constants/colors";
import { Spacing } from "@/shared/constants/spacing";
import { FontSize, FontWeight } from "@/shared/constants/typography";

export default function UdharoEntryForm() {
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
});
