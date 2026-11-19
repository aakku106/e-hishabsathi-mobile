import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  Pressable,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMemo, useState } from "react";

import { APP } from "@/config/app";
import { setSetting, SETTING_KEYS } from "@/database/helpers/settings";
import {
  persistAiAssistant,
  persistSalesStrictInventory,
  persistThemeMode,
} from "@/lib/hydration";
import { useBusiness } from "@/features/business/hooks/useBusiness";
import { useTheme, type ThemeMode } from "@/providers/ThemeProvider";
import { useSettingsStore, type PageKey } from "@/store/settings.store";
import { AppHeader } from "@/shared/components/Header/AppHeader";
import { Colors_NavBar, Colors_SettingsPage, getThemedColors } from "@/shared/constants/colors";
import { BorderWidth, Radius } from "@/shared/constants/radius";
import { boxShadow, withAlpha } from "@/shared/constants/shadows";
import { Spacing } from "@/shared/constants/spacing";
import { FontSize, FontWeight } from "@/shared/constants/typography";
import { hapticSelection } from "@/shared/utils/haptics";

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  retail: "Retail",
  wholesale: "Wholesale",
  restaurant: "Restaurant",
  service: "Service",
  other: "Other",
};

const COPY = {
  en: {
    settings: "Settings",
    subtitle: "Manage your shop and preferences",
    profile: "Business profile",
    manage: "Manage",
    preferences: "Preferences",
    general: "General",
    about: "About",
    inventory: "Inventory",
    products: "Products and stock",
    tax: "Tax / VAT",
    vat: "Monthly VAT summary",
    pages: "Pages",
    sales: "Sales",
    buy: "Buy",
    udharo: "Udharo",
    dashboard: "Dashboard",
    strictInventory: "Only sell inventory items",
    strictInventoryHint: "Sales must use products that already exist in Inventory",
    aiAssistant: "AI assistant",
    aiAssistantHint: "Show the floating AI button on this page",
    appearance: "Appearance",
    appearanceHint: "Choose how the app looks",
    system: "System",
    dark: "Dark",
    light: "Light",
    currency: "Currency",
    notifications: "Notifications",
    language: "Change Language",
    terms: "Terms & Conditions",
    privacy: "Privacy Policy",
    appName: "App name",
    version: "Version",
    english: "English",
    nepali: "नेपाली",
  },
  np: {
    settings: "सेटिङहरू",
    subtitle: "आफ्नो पसल र प्राथमिकता व्यवस्थापन गर्नुहोस्",
    profile: "व्यवसाय प्रोफाइल",
    manage: "व्यवस्थापन",
    preferences: "प्राथमिकताहरू",
    general: "सामान्य",
    about: "बारेमा",
    inventory: "इन्भेन्टरी",
    products: "उत्पादन र स्टक",
    tax: "कर / VAT",
    vat: "मासिक VAT सारांश",
    pages: "पृष्ठहरू",
    sales: "बिक्री",
    buy: "खरिद",
    udharo: "उधारो",
    dashboard: "ड्यासबोर्ड",
    strictInventory: "इन्भेन्टरीका सामान मात्र बेच्नुहोस्",
    strictInventoryHint: "बिक्री गर्न इन्भेन्टरीमा रहेका उत्पादन मात्र प्रयोग गर्नुपर्छ",
    aiAssistant: "AI सहायक",
    aiAssistantHint: "यो पृष्ठमा तैरने AI सहायक बटन देखाउनुहोस्",
    appearance: "देखावट",
    appearanceHint: "एप कस्तो देखिने छान्नुहोस्",
    system: "सिस्टम",
    dark: "गाढा",
    light: "उज्यालो",
    currency: "मुद्रा",
    notifications: "सूचनाहरू",
    language: "भाषा परिवर्तन",
    terms: "नियम तथा सर्तहरू",
    privacy: "गोपनीयता नीति",
    appName: "एपको नाम",
    version: "संस्करण",
    english: "English",
    nepali: "नेपाली",
  },
} as const;

const THEME_OPTIONS: {
  mode: ThemeMode;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}[] = [
  { mode: "system", icon: "theme-light-dark" },
  { mode: "dark", icon: "weather-night" },
  { mode: "light", icon: "white-balance-sunny" },
];

type SettingsLinkProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value?: string;
  colors: typeof Colors_SettingsPage;
  styles: ReturnType<typeof createStyles>;
};

function SettingsLink({
  icon,
  label,
  value,
  colors,
  styles,
}: SettingsLinkProps) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.rowLeading}>
        <View style={styles.smallIcon}>
          <MaterialCommunityIcons
            name={icon}
            size={18}
            color={colors.primary}
          />
        </View>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      {!!value && <Text style={styles.settingValue}>{value}</Text>}
      <MaterialCommunityIcons
        name="chevron-right"
        size={22}
        color={colors.textMuted}
      />
    </View>
  );
}

type PageSettingEntry = {
  key: PageKey;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  accent: string;
};

const PAGE_SETTINGS: PageSettingEntry[] = [
  {
    key: "sales",
    icon: "cash-register",
    accent: Colors_NavBar.selected.sales,
  },
  {
    key: "buy",
    icon: "cart-outline",
    accent: Colors_NavBar.selected.buy,
  },
  {
    key: "udharo",
    icon: "account-cash-outline",
    accent: Colors_NavBar.selected.udharo,
  },
  {
    key: "dashboard",
    icon: "view-dashboard-outline",
    accent: Colors_NavBar.selected.dashBoard,
  },
];

type ToggleRowProps = {
  label: string;
  hint: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  colors: typeof Colors_SettingsPage;
  styles: ReturnType<typeof createStyles>;
};

function ToggleRow({
  label,
  hint,
  value,
  onValueChange,
  colors,
  styles,
}: ToggleRowProps) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingTextWrap}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingHint}>{hint}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        accessibilityRole="switch"
        accessibilityLabel={label}
        accessibilityState={{ checked: value }}
        trackColor={{ false: colors.border, true: colors.primary }}
        ios_backgroundColor={colors.border}
      />
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { data: business } = useBusiness();
  const {
    themeMode,
    setThemeMode,
    currency,
    language,
    setLanguage,
    salesStrictInventory,
    aiAssistant,
    setSalesStrictInventory,
    setAiAssistant,
  } = useSettingsStore();
  const copy = COPY[language];
  const { isDark } = useTheme();
  const colors = useMemo(
    () => getThemedColors(Colors_SettingsPage, isDark),
    [isDark],
  );
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [headerHeight, setHeaderHeight] = useState(0);

  const handleThemeChange = (mode: ThemeMode) => {
    hapticSelection();
    setThemeMode(mode);
    void persistThemeMode(mode);
  };

  const handleSalesStrictInventoryChange = (enabled: boolean) => {
    hapticSelection();
    setSalesStrictInventory(enabled);
    void persistSalesStrictInventory(enabled);
  };

  const handleAiAssistantToggle = (page: PageKey, enabled: boolean) => {
    hapticSelection();
    setAiAssistant(page, enabled);
    void persistAiAssistant(page, enabled);
  };

  const handleLanguageChange = () => {
    hapticSelection();
    const nextLanguage = language === "en" ? "np" : "en";
    setLanguage(nextLanguage);
    void setSetting(SETTING_KEYS.language, nextLanguage);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <View style={styles.headerOverlay} onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)}>
        <AppHeader title={copy.settings} colors={colors} edgeToEdge />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: headerHeight + Spacing.lg }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{copy.profile}</Text>
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.85}
            onPress={() => router.push("/account")}
            style={styles.card}>
            <View style={styles.profileRow}>
              <LinearGradient
                colors={[colors.primary, colors.primaryDeep]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(business?.name ?? "?").charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
              <View style={styles.profileText}>
                <Text style={styles.profileName}>
                  {business?.name ?? "Not set up"}
                </Text>
                <Text style={styles.profileMeta}>
                  {business ?
                    (BUSINESS_TYPE_LABELS[business.type] ?? "Other")
                  : "Set up your business in onboarding"}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={22}
                color={colors.textMuted}
              />
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
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{copy.manage}</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.linkRow}
              activeOpacity={0.8}
              onPress={() => router.push("/inventory")}>
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
              onPress={() => router.push("/tax")}>
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
                <Text style={styles.settingLabel}>{copy.appearance}</Text>
                <Text style={styles.settingHint}>{copy.appearanceHint}</Text>
              </View>
            </View>

            <View style={styles.themeOptions}>
              {THEME_OPTIONS.map((option) => {
                const selected = themeMode === option.mode;
                return (
                  <Pressable
                    key={option.mode}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    onPress={() => handleThemeChange(option.mode)}
                    style={[
                      styles.themeOption,
                      selected && styles.themeOptionActive,
                    ]}>
                    <MaterialCommunityIcons
                      name={option.icon}
                      size={17}
                      color={selected ? colors.onPrimary : colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.themeOptionLabel,
                        selected && styles.themeOptionLabelActive,
                      ]}>
                      {copy[option.mode]}
                    </Text>
                  </Pressable>
                );
              })}
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
          <Text style={styles.sectionTitle}>{copy.pages}</Text>
          {PAGE_SETTINGS.map((page) => (
            <View key={page.key} style={styles.card}>
              <View style={styles.pageRow}>
                <View
                  style={[
                    styles.smallIcon,
                    {
                      backgroundColor: withAlpha(
                        page.accent,
                        isDark ? 0.22 : 0.14,
                      ),
                    },
                  ]}>
                  <MaterialCommunityIcons
                    name={page.icon}
                    size={18}
                    color={page.accent}
                  />
                </View>
                <Text style={styles.settingLabel}>{copy[page.key]}</Text>
              </View>

              {page.key === "sales" && (
                <>
                  <ToggleRow
                    label={copy.strictInventory}
                    hint={copy.strictInventoryHint}
                    value={salesStrictInventory}
                    onValueChange={handleSalesStrictInventoryChange}
                    colors={colors}
                    styles={styles}
                  />
                  <View style={styles.rowDivider} />
                </>
              )}

              <ToggleRow
                label={copy.aiAssistant}
                hint={copy.aiAssistantHint}
                value={aiAssistant[page.key]}
                onValueChange={(enabled) =>
                  handleAiAssistantToggle(page.key, enabled)
                }
                colors={colors}
                styles={styles}
              />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{copy.general}</Text>
          <View style={styles.card}>
            <SettingsLink
              icon="bell-outline"
              label={copy.notifications}
              colors={colors}
              styles={styles}
            />
            <View style={styles.rowDivider} />
            <Pressable style={styles.settingRow} onPress={handleLanguageChange}>
              <View style={styles.rowLeading}>
                <View style={styles.smallIcon}>
                  <MaterialCommunityIcons
                    name="translate"
                    size={18}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.settingLabel}>{copy.language}</Text>
              </View>
              <Text style={styles.settingValue}>
                {language === "en" ? copy.english : copy.nepali}
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={22}
                color={colors.textMuted}
              />
            </Pressable>
            <View style={styles.rowDivider} />
            <SettingsLink
              icon="file-document-outline"
              label={copy.terms}
              colors={colors}
              styles={styles}
            />
            <View style={styles.rowDivider} />
            <SettingsLink
              icon="lock-outline"
              label={copy.privacy}
              colors={colors}
              styles={styles}
            />
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
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: typeof Colors_SettingsPage) {
  return StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    paddingBottom: Spacing["4xl"],
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    pointerEvents: "box-none",
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
    boxShadow: boxShadow({ y: 6, blur: 16, color: "#0F172A", opacity: 0.05 }),
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
  pageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
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
  themeOptions: {
    flexDirection: "row",
    gap: Spacing.xs,
    padding: Spacing.xs,
    borderRadius: Radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  themeOption: {
    flex: 1,
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    borderRadius: Radius.sm,
  },
  themeOptionActive: {
    backgroundColor: colors.primary,
  },
  themeOptionLabel: {
    color: colors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  themeOptionLabelActive: {
    color: colors.onPrimary,
    fontWeight: FontWeight.bold,
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
  });
}
