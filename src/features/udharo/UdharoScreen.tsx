import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Colors_UdharoPage } from "@/shared/constants/colors";
import { BorderWidth, Radius } from "@/shared/constants/radius";
import { Spacing } from "@/shared/constants/spacing";
import {
  FontSize,
  FontWeight,
  Typography_UdharoPage,
} from "@/shared/constants/typography";
import TopButton from "@/shared/components/Button/TopButton";

const recentEntries = [
  {
    name: "Rahul Traders",
    amount: "Rs. 24,000",
    due: "Due in 3 days",
    status: "On track",
  },
  {
    name: "Sita Kirana",
    amount: "Rs. 11,500",
    due: "Due today",
    status: "Needs follow-up",
  },
  {
    name: "Maya Suppliers",
    amount: "Rs. 38,000",
    due: "Overdue 8 days",
    status: "Overdue",
  },
];

export default function UdharoScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>Debt tracking</Text>
            <Text style={styles.title}>Udharo</Text>
          </View>

          <View style={styles.badge}>
            <MaterialCommunityIcons
              name="circle-multiple"
              size={18}
              color={Colors_UdharoPage.textPrimary}
            />
            <Text style={styles.badgeText}>Live balance</Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formLabel}>Udharo amount</Text>
          <View style={styles.inputBox}>
            <Text style={styles.inputPrefix}>Rs.</Text>
            <TextInput
              placeholder="0.00"
              placeholderTextColor="rgba(31,31,31,0.35)"
              style={styles.input}
              keyboardType="numeric"
            />
          </View>

          <Text style={styles.formLabel}>By who</Text>
          <View style={styles.inputBox}>
            <Ionicons name="person-outline" size={18} color="#7a7a7a" />
            <TextInput
              placeholder="Enter person name"
              placeholderTextColor="rgba(31,31,31,0.35)"
              style={styles.input}
            />
          </View>

          <TopButton
            title="Save udharo"
            style={styles.primaryButton}
            textStyle={styles.primaryButtonText}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent udharo</Text>
            <Text style={styles.sectionLink}>View all</Text>
          </View>

          <View style={styles.listCard}>
            {recentEntries.map((entry, index) => (
              <View
                key={entry.name}
                style={[
                  styles.entryRow,
                  index !== recentEntries.length - 1 && styles.entryDivider,
                ]}
              >
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors_UdharoPage.background,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing["3xl"],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  kicker: {
    color: Colors_UdharoPage.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  title: {
    color: Colors_UdharoPage.textSecondary,
    fontSize: Typography_UdharoPage.title.fontSize,
    fontWeight: Typography_UdharoPage.title.fontWeight,
    lineHeight: Typography_UdharoPage.title.lineHeight,
    letterSpacing: Typography_UdharoPage.title.letterSpacing,
    marginTop: 2,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    backgroundColor: Colors_UdharoPage.inputBG,
  },
  badgeText: {
    color: Colors_UdharoPage.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    marginLeft: Spacing.xs,
  },
  formCard: {
    backgroundColor: Colors_UdharoPage.inputBG,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: BorderWidth.base,
    borderColor: Colors_UdharoPage.border,
    marginBottom: Spacing.lg,
  },
  formLabel: {
    color: Colors_UdharoPage.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.sm,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors_UdharoPage.surfaceAlt,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: BorderWidth.thin,
    borderColor: Colors_UdharoPage.border,
    marginBottom: Spacing.md,
  },
  inputPrefix: {
    color: Colors_UdharoPage.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    color: Colors_UdharoPage.textPrimary,
    fontSize: FontSize.lg,
    paddingVertical: 0,
  },
  primaryButton: {
    width: "100%",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors_UdharoPage.enterBtn,
    borderColor: Colors_UdharoPage.enterBtn,
  },
  primaryButtonText: {
    color: Colors_UdharoPage.textSecondary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
  section: {
    marginTop: Spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    color: Colors_UdharoPage.textSecondary,
    fontSize: Typography_UdharoPage.subtitle.fontSize,
    fontWeight: Typography_UdharoPage.subtitle.fontWeight,
  },
  sectionLink: {
    color: Colors_UdharoPage.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
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
