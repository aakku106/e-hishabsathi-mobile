import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  Pressable,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { APP } from "@/config/app";
import { removeSetting, setSetting, SETTING_KEYS } from "@/database/helpers/settings";
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

const COPY = {
  en: { settings: "Settings", subtitle: "Manage your shop and preferences", profile: "Business profile", manage: "Manage", preferences: "Preferences", general: "General", about: "About", inventory: "Inventory", products: "Products and stock", tax: "Tax / VAT", vat: "Monthly VAT summary", dark: "Dark mode", currently: "Currently", currency: "Currency", account: "Account", notifications: "Notifications", language: "Change Language", terms: "Terms & Conditions", privacy: "Privacy Policy", appName: "App name", version: "Version", logout: "Logout", english: "English", nepali: "नेपाली" },
  np: { settings: "सेटिङहरू", subtitle: "आफ्नो पसल र प्राथमिकता व्यवस्थापन गर्नुहोस्", profile: "व्यवसाय प्रोफाइल", manage: "व्यवस्थापन", preferences: "प्राथमिकताहरू", general: "सामान्य", about: "बारेमा", inventory: "इन्भेन्टरी", products: "उत्पादन र स्टक", tax: "कर / VAT", vat: "मासिक VAT सारांश", dark: "डार्क मोड", currently: "हाल", currency: "मुद्रा", account: "खाता", notifications: "सूचनाहरू", language: "भाषा परिवर्तन", terms: "नियम तथा सर्तहरू", privacy: "गोपनीयता नीति", appName: "एपको नाम", version: "संस्करण", logout: "लगआउट", english: "English", nepali: "नेपाली" },
} as const;

function SettingsLink({ icon, label, value }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string; value?: string }) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.rowLeading}>
        <View style={styles.smallIcon}><MaterialCommunityIcons name={icon} size={18} color={colors.primary} /></View>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      {!!value && <Text style={styles.settingValue}>{value}</Text>}
      <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textMuted} />
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { data: business } = useBusiness();
  const { themeMode, toggleTheme, currency, language, setLanguage } = useSettingsStore();
  const copy = COPY[language];
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

  const handleLanguageChange = () => {
    const nextLanguage = language === "en" ? "np" : "en";
    setLanguage(nextLanguage);
    void setSetting(SETTING_KEYS.language, nextLanguage);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          title={copy.settings}
          subtitle={copy.subtitle}
          icon="cog-outline"
          gradient={[colors.primary, colors.primaryDeep]}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{copy.profile}</Text>
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
          <Text style={styles.sectionTitle}>{copy.manage}</Text>
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
                <Text style={styles.settingLabel}>{copy.inventory}</Text>
                <Text style={styles.settingHint}>{copy.products}</Text>
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
                <Text style={styles.settingLabel}>{copy.tax}</Text>
                <Text style={styles.settingHint}>{copy.vat}</Text>
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
          <Text style={styles.sectionTitle}>{copy.preferences}</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingTextWrap}>
                <Text style={styles.settingLabel}>{copy.dark}</Text>
                <Text style={styles.settingHint}>
                  {copy.currently} {themeMode === "dark" ? "on" : "off"}
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
                <Text style={styles.settingLabel}>{copy.currency}</Text>
                <Text style={styles.settingHint}>{currency}</Text>
              </View>
              <View style={styles.currencyBadge}>
                <Text style={styles.currencyBadgeText}>{currency}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{copy.general}</Text>
          <View style={styles.card}>
            <SettingsLink icon="account-outline" label={copy.account} value={business?.name ?? "-"} />
            <View style={styles.rowDivider} />
            <SettingsLink icon="bell-outline" label={copy.notifications} />
            <View style={styles.rowDivider} />
            <Pressable style={styles.settingRow} onPress={handleLanguageChange}>
              <View style={styles.rowLeading}>
                <View style={styles.smallIcon}><MaterialCommunityIcons name="translate" size={18} color={colors.primary} /></View>
                <Text style={styles.settingLabel}>{copy.language}</Text>
              </View>
              <Text style={styles.settingValue}>{language === "en" ? copy.english : copy.nepali}</Text>
              <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textMuted} />
            </Pressable>
            <View style={styles.rowDivider} />
            <SettingsLink icon="file-document-outline" label={copy.terms} />
            <View style={styles.rowDivider} />
            <SettingsLink icon="lock-outline" label={copy.privacy} />
            <View style={styles.rowDivider} />
            <Pressable style={styles.settingRow} onPress={handleLogout}>
              <View style={styles.rowLeading}>
                <View style={styles.smallIcon}><MaterialCommunityIcons name="logout" size={18} color={colors.primary} /></View>
                <Text style={styles.settingLabel}>{copy.logout}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textMuted} />
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{copy.about}</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>{copy.appName}</Text>
              <Text style={styles.settingValue}>{APP.name}</Text>
            </View>
            <View style={styles.rowDivider} />
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>{copy.version}</Text>
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
  rowLeading: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  smallIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
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
