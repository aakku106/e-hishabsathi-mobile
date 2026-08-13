import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { APP } from "@/config/app";
import { removeSetting, SETTING_KEYS } from "@/database/helpers/settings";
import { persistThemeMode } from "@/lib/hydration";
import { useBusiness } from "@/features/business/hooks/useBusiness";
import { useAuthStore } from "@/store/auth.store";
import { useSettingsStore } from "@/store/settings.store";
import { PageHeader } from "@/shared/components/Header/PageHeader";
import { Colors_SettingsPage } from "@/shared/constants/colors";
import { BorderWidth, Radius } from "@/shared/constants/radius";
import { Spacing } from "@/shared/constants/spacing";
import { FontSize, FontWeight } from "@/shared/constants/typography";

const colors = Colors_SettingsPage;

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  retail: "Retail",
  wholesale: "Wholesale",
  restaurant: "Restaurant",
  service: "Service",
  other: "Other",
};

export default function SettingsScreen() {
  const router = useRouter();
  const { data: business } = useBusiness();
  const { themeMode, toggleTheme, currency } = useSettingsStore();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    removeSetting(SETTING_KEYS.authPan);
    removeSetting(SETTING_KEYS.authUsername);
    logout();
    router.replace("/(auth)/login");
  };

  const handleToggleTheme = () => {
    toggleTheme();
    const nextMode = themeMode === "dark" ? "light" : "dark";
    persistThemeMode(nextMode);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          title="Settings"
          subtitle="Manage your shop and preferences"
          icon="cog-outline"
          gradient={[colors.primary, colors.primaryDeep]}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business profile</Text>
          <View style={styles.card}>
            <View style={styles.profileRow}>
              <LinearGradient
                colors={[colors.primary, colors.primaryDeep]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {(business?.name ?? "?").charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
              <View style={styles.profileText}>
                <Text style={styles.profileName}>{business?.name ?? "Not set up"}</Text>
                <Text style={styles.profileMeta}>
                  {business
                    ? BUSINESS_TYPE_LABELS[business.type] ?? "Other"
                    : "Set up your business in onboarding"}
                </Text>
              </View>
            </View>

            {!!business?.pan && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>PAN</Text>
                <Text style={styles.detailValue}>{business.pan}</Text>
              </View>
            )}
            {!!business?.phone && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone</Text>
                <Text style={styles.detailValue}>{business.phone}</Text>
              </View>
            )}
            {!!business?.address && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Address</Text>
                <Text style={styles.detailValue}>{business.address}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manage</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.linkRow}
              activeOpacity={0.8}
              onPress={() => router.push("/inventory")}
            >
              <View style={styles.linkIcon}>
                <MaterialCommunityIcons
                  name="package-variant-closed"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={styles.linkTextWrap}>
                <Text style={styles.settingLabel}>Inventory</Text>
                <Text style={styles.settingHint}>Products and stock</Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={22}
                color={colors.textMuted}
              />
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            <TouchableOpacity
              style={styles.linkRow}
              activeOpacity={0.8}
              onPress={() => router.push("/tax")}
            >
              <View style={styles.linkIcon}>
                <MaterialCommunityIcons
                  name="file-percent-outline"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={styles.linkTextWrap}>
                <Text style={styles.settingLabel}>Tax / VAT</Text>
                <Text style={styles.settingHint}>Monthly VAT summary</Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={22}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingTextWrap}>
                <Text style={styles.settingLabel}>Dark mode</Text>
                <Text style={styles.settingHint}>
                  Currently {themeMode === "dark" ? "on" : "off"}
                </Text>
              </View>
              <Switch
                value={themeMode === "dark"}
                onValueChange={handleToggleTheme}
                trackColor={{ false: "#CBD5E1", true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.rowDivider} />

            <View style={styles.settingRow}>
              <View style={styles.settingTextWrap}>
                <Text style={styles.settingLabel}>Currency</Text>
                <Text style={styles.settingHint}>{currency}</Text>
              </View>
              <View style={styles.currencyBadge}>
                <Text style={styles.currencyBadgeText}>{currency}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>App name</Text>
              <Text style={styles.settingValue}>{APP.name}</Text>
            </View>
            <View style={styles.rowDivider} />
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Version</Text>
              <Text style={styles.settingValue}>{APP.version}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          <MaterialCommunityIcons name="logout" size={18} color={colors.danger} />
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>
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
  section: {
    marginTop: Spacing.xl,
    marginHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: Radius.lg,
    borderWidth: BorderWidth.thin,
    borderColor: colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: FontSize["2xl"],
    fontWeight: FontWeight.bold,
  },
  profileText: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    color: colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  profileMeta: {
    color: colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  detailLabel: {
    color: colors.textMuted,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  detailValue: {
    color: colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  rowDivider: {
    height: BorderWidth.thin,
    backgroundColor: colors.border,
  },
  linkTextWrap: {
    flex: 1,
    gap: 2,
  },
  settingTextWrap: {
    flex: 1,
    gap: 2,
  },
  settingLabel: {
    color: colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  settingHint: {
    color: colors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
  },
  settingValue: {
    color: colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  currencyBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  currencyBadgeText: {
    color: colors.primaryDeep,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  logoutButton: {
    marginTop: Spacing["2xl"],
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing["2xl"],
    borderRadius: Radius.pill,
    borderWidth: BorderWidth.thin,
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
  },
  logoutText: {
    color: colors.danger,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
});
