import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { removeSetting, SETTING_KEYS } from "@/database/helpers/settings";
import { useBusiness } from "@/features/business/hooks/useBusiness";
import { useDeleteAllData } from "@/features/settings/hooks/useDeleteAllData";
import { useTheme } from "@/providers/ThemeProvider";
import { AppHeader } from "@/shared/components/Header/AppHeader";
import {
  Colors_SettingsPage,
  getThemedColors,
} from "@/shared/constants/colors";
import { BorderWidth, Radius } from "@/shared/constants/radius";
import { Spacing } from "@/shared/constants/spacing";
import { FontSize, FontWeight } from "@/shared/constants/typography";
import {
  hapticDestructive,
  hapticError,
  hapticWarning,
} from "@/shared/utils/haptics";
import { notify } from "@/shared/utils/dialogs";
import { logger } from "@/shared/utils/logger";
import { useAuthStore } from "@/store/auth.store";
import { useSettingsStore } from "@/store/settings.store";

type ConfirmationStep = "warning" | "final-warning" | "type-delete";

const COPY = {
  en: {
    title: "Account",
    subtitle: "Manage your account and local data",
    business: "Business",
    noBusiness: "No business profile",
    currency: "Currency",
    username: "Username",
    pan: "PAN",
    localData: "Your data stays on this device",
    localDataHint:
      "Business and transaction records are stored locally on this device.",
    general: "General",
    logout: "Logout",
    logoutTitle: "Log out?",
    logoutBody: "You will need to sign in again to open your local khata.",
    logoutConfirm: "Log out",
    logoutErrorTitle: "Could not log out",
    logoutErrorBody:
      "Your local session could not be cleared. Please try again.",
    loggingOut: "Logging out…",
    dangerZone: "Danger zone",
    deleteAll: "Delete all data",
    deleteHint: "Permanently erase all local account and business data",
    warningTitle: "Delete all local data?",
    warningBody:
      "This permanently removes your business profile, products and stock, sales, purchases, Udhaaro customers and ledger, pending sync data, and saved sign-in and preferences from this device.",
    review: "Review deletion",
    finalTitle: "This cannot be undone",
    finalBody:
      "Your local database will be erased and you will be signed out. Continue only if you are sure you no longer need this data.",
    continue: "Continue",
    typeTitle: "Type DELETE to confirm",
    typeBody:
      "Enter DELETE below to permanently erase all data on this device.",
    placeholder: "Type DELETE",
    deleteForever: "Delete permanently",
    cancel: "Cancel",
    back: "Go back",
    deleteError: "Could not delete the data. Please try again.",
    deleting: "Deleting…",
  },
  np: {
    title: "खाता",
    subtitle: "आफ्नो खाता र स्थानीय डेटा व्यवस्थापन गर्नुहोस्",
    business: "व्यवसाय",
    noBusiness: "व्यवसाय प्रोफाइल छैन",
    currency: "मुद्रा",
    username: "प्रयोगकर्ता नाम",
    pan: "PAN",
    localData: "तपाईंको डेटा यसै उपकरणमा रहन्छ",
    localDataHint:
      "व्यवसाय र कारोबारका विवरण यस उपकरणमै स्थानीय रूपमा सुरक्षित हुन्छन्।",
    general: "सामान्य",
    logout: "लगआउट",
    logoutTitle: "लगआउट गर्ने?",
    logoutBody: "तपाईंको स्थानीय खाता खोल्न फेरि साइन इन गर्नुपर्नेछ।",
    logoutConfirm: "लगआउट",
    logoutErrorTitle: "लगआउट गर्न सकिएन",
    logoutErrorBody:
      "तपाईंको स्थानीय सत्र हटाउन सकिएन। कृपया फेरि प्रयास गर्नुहोस्।",
    loggingOut: "लगआउट हुँदै…",
    dangerZone: "जोखिम क्षेत्र",
    deleteAll: "सबै डेटा मेटाउनुहोस्",
    deleteHint: "यस उपकरणको सबै खाता र व्यवसाय डेटा स्थायी रूपमा मेटाउनुहोस्",
    warningTitle: "सबै स्थानीय डेटा मेटाउने?",
    warningBody:
      "यसले व्यवसाय प्रोफाइल, उत्पादन तथा स्टक, बिक्री, खरिद, उधारो ग्राहक र लेजर, बाँकी सिंक डेटा, र सुरक्षित लगइन तथा प्राथमिकताहरू यस उपकरणबाट स्थायी रूपमा मेटाउँछ।",
    review: "मेटाउने समीक्षा गर्नुहोस्",
    finalTitle: "यो कार्य पूर्ववत् गर्न सकिँदैन",
    finalBody:
      "तपाईंको स्थानीय डेटाबेस मेटिनेछ र तपाईं लगआउट हुनुहुनेछ। यो डेटा आवश्यक छैन भन्ने निश्चित भएपछि मात्र अगाडि बढ्नुहोस्।",
    continue: "अगाडि बढ्नुहोस्",
    typeTitle: "पुष्टि गर्न DELETE लेख्नुहोस्",
    typeBody: "यस उपकरणको सबै डेटा स्थायी रूपमा मेटाउन तल DELETE लेख्नुहोस्।",
    placeholder: "DELETE लेख्नुहोस्",
    deleteForever: "स्थायी रूपमा मेटाउनुहोस्",
    cancel: "रद्द गर्नुहोस्",
    back: "पछाडि",
    deleteError: "डेटा मेटाउन सकिएन। कृपया फेरि प्रयास गर्नुहोस्।",
    deleting: "मेटाउँदै…",
  },
} as const;

export default function AccountScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: business } = useBusiness();
  const { isDark } = useTheme();
  const colors = useMemo(
    () => getThemedColors(Colors_SettingsPage, isDark),
    [isDark],
  );
  const styles = useMemo(() => createStyles(colors), [colors]);
  const language = useSettingsStore((state) => state.language);
  const currency = useSettingsStore((state) => state.currency);
  const pan = useAuthStore((state) => state.pan);
  const username = useAuthStore((state) => state.username);
  const logout = useAuthStore((state) => state.logout);
  const resetSettings = useSettingsStore((state) => state.hydrate);
  const deleteAllData = useDeleteAllData();
  const copy = COPY[language];

  const [confirmationStep, setConfirmationStep] =
    useState<ConfirmationStep | null>(null);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const [typedConfirmation, setTypedConfirmation] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  const closeConfirmation = () => {
    setConfirmationStep(null);
    setTypedConfirmation("");
    setErrorMessage(null);
  };

  const handleDeleteAllData = async () => {
    // Strong, patterned feedback the moment the user commits to erasing data.
    hapticDestructive();
    try {
      await deleteAllData.mutateAsync();
    } catch (error) {
      logger.error("Failed to delete all account data", error);
      hapticError();
      setErrorMessage(copy.deleteError);
      return;
    }

    queryClient.clear();
    logout();
    resetSettings("light", "en");
    closeConfirmation();
    router.replace("/(auth)/login");
  };

  const handleLogout = async () => {
    if (logoutPending) return;

    hapticDestructive();
    setLogoutPending(true);
    try {
      // Do not clear the in-memory session until the guest flag is gone from
      // disk; otherwise the next launch would sign the user back in as guest.
      await Promise.all([
        removeSetting(SETTING_KEYS.authPan),
        removeSetting(SETTING_KEYS.authUsername),
        removeSetting(SETTING_KEYS.authGuest),
      ]);
    } catch (cause) {
      logger.error("Failed to clear the local session", cause);
      hapticError();
      notify(copy.logoutErrorTitle, copy.logoutErrorBody);
      return;
    } finally {
      setLogoutPending(false);
    }

    setLogoutVisible(false);
    logout();
    router.replace("/(auth)/login");
  };

  const canDelete = typedConfirmation === "DELETE" && !deleteAllData.isPending;

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <View style={styles.headerOverlay} onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)}>
        <AppHeader
          title={copy.title}
          colors={colors}
          onBack={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/(tabs)/05-settings");
            }
          }}
          edgeToEdge
        />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: headerHeight + Spacing.lg }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{copy.business}</Text>
          <View style={styles.card}>
            <AccountDetail
              label={copy.business}
              value={business?.name ?? copy.noBusiness}
              styles={styles}
              colors={colors}
            />
            <AccountDetail
              label={copy.currency}
              value={currency}
              styles={styles}
              colors={colors}
            />
            {!!username && (
              <AccountDetail
                label={copy.username}
                value={username}
                styles={styles}
                colors={colors}
              />
            )}
            {!!pan && (
              <AccountDetail
                label={copy.pan}
                value={pan}
                styles={styles}
                colors={colors}
              />
            )}
            <View style={styles.localNotice}>
              <MaterialCommunityIcons
                name="cellphone-lock"
                size={20}
                color={colors.primary}
              />
              <View style={styles.noticeText}>
                <Text style={styles.noticeTitle}>{copy.localData}</Text>
                <Text style={styles.noticeHint}>{copy.localDataHint}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{copy.general}</Text>
          <View style={styles.card}>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                hapticWarning();
                setLogoutVisible(true);
              }}
              style={styles.logoutRow}>
              <View style={styles.logoutIcon}>
                <MaterialCommunityIcons
                  name="logout"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.logoutLabel}>{copy.logout}</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={22}
                color={colors.textMuted}
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{copy.dangerZone}</Text>
          <View style={styles.dangerCard}>
            <View style={styles.deleteDescription}>
              <Text style={styles.deleteTitle}>{copy.deleteAll}</Text>
              <Text style={styles.deleteHint}>{copy.deleteHint}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                hapticWarning();
                setErrorMessage(null);
                setConfirmationStep("warning");
              }}
              style={styles.deleteButton}>
              <MaterialCommunityIcons
                name="delete-forever-outline"
                size={20}
                color={colors.danger}
              />
              <Text style={styles.deleteButtonText}>{copy.deleteAll}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent
        visible={confirmationStep !== null}
        onRequestClose={() => {
          if (!deleteAllData.isPending) closeConfirmation();
        }}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View accessibilityViewIsModal style={styles.confirmationCard}>
            <View style={styles.warningIcon}>
              <MaterialCommunityIcons
                name="alert-outline"
                size={28}
                color={colors.danger}
              />
            </View>
            <Text style={styles.confirmationTitle}>
              {confirmationStep === "warning" ?
                copy.warningTitle
              : confirmationStep === "final-warning" ?
                copy.finalTitle
              : copy.typeTitle}
            </Text>
            <Text style={styles.confirmationBody}>
              {confirmationStep === "warning" ?
                copy.warningBody
              : confirmationStep === "final-warning" ?
                copy.finalBody
              : copy.typeBody}
            </Text>

            {confirmationStep === "type-delete" && (
              <TextInput
                accessibilityLabel={copy.placeholder}
                autoCapitalize="characters"
                autoCorrect={false}
                editable={!deleteAllData.isPending}
                onChangeText={(value) => {
                  setTypedConfirmation(value);
                  setErrorMessage(null);
                }}
                placeholder={copy.placeholder}
                placeholderTextColor={colors.textMuted}
                style={styles.confirmationInput}
                value={typedConfirmation}
              />
            )}

            {!!errorMessage && (
              <Text accessibilityRole="alert" style={styles.errorText}>
                {errorMessage}
              </Text>
            )}

            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                disabled={deleteAllData.isPending}
                onPress={
                  confirmationStep === "warning" ? closeConfirmation
                  : confirmationStep === "final-warning" ?
                    () => setConfirmationStep("warning")
                  : () => setConfirmationStep("final-warning")
                }
                style={styles.cancelButton}>
                <Text style={styles.cancelText}>
                  {confirmationStep === "warning" ? copy.cancel : copy.back}
                </Text>
              </Pressable>

              {confirmationStep !== "type-delete" ?
                <Pressable
                  accessibilityRole="button"
                  onPress={() =>
                    setConfirmationStep(
                      confirmationStep === "warning" ? "final-warning" : (
                        "type-delete"
                      ),
                    )
                  }
                  style={styles.continueButton}>
                  <Text style={styles.continueText}>
                    {confirmationStep === "warning" ?
                      copy.review
                    : copy.continue}
                  </Text>
                </Pressable>
              : <Pressable
                  accessibilityRole="button"
                  accessibilityState={{
                    disabled: !canDelete,
                    busy: deleteAllData.isPending,
                  }}
                  disabled={!canDelete}
                  onPress={handleDeleteAllData}
                  style={[
                    styles.permanentDeleteButton,
                    !canDelete && styles.disabledButton,
                  ]}>
                  {deleteAllData.isPending ?
                    <ActivityIndicator color={colors.onPrimary} />
                  : <Text style={styles.permanentDeleteText}>
                      {copy.deleteForever}
                    </Text>
                  }
                </Pressable>
              }
            </View>
            {deleteAllData.isPending && (
              <Text style={styles.pendingText}>{copy.deleting}</Text>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        animationType="fade"
        transparent
        visible={logoutVisible}
        onRequestClose={() => {
          if (!logoutPending) setLogoutVisible(false);
        }}>
        <View style={styles.modalOverlay}>
          <View accessibilityViewIsModal style={styles.confirmationCard}>
            <View style={styles.logoutConfirmIcon}>
              <MaterialCommunityIcons
                name="logout"
                size={28}
                color={colors.primary}
              />
            </View>
            <Text style={styles.confirmationTitle}>{copy.logoutTitle}</Text>
            <Text style={styles.confirmationBody}>{copy.logoutBody}</Text>
            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: logoutPending }}
                disabled={logoutPending}
                onPress={() => setLogoutVisible(false)}
                style={[
                  styles.cancelButton,
                  logoutPending && styles.disabledButton,
                ]}>
                <Text style={styles.cancelText}>{copy.cancel}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ busy: logoutPending }}
                disabled={logoutPending}
                onPress={handleLogout}
                style={[
                  styles.logoutConfirmButton,
                  logoutPending && styles.disabledButton,
                ]}>
                {logoutPending ?
                  <ActivityIndicator color={colors.onPrimary} />
                : <Text style={styles.logoutConfirmText}>
                    {copy.logoutConfirm}
                  </Text>
                }
              </Pressable>
            </View>
            {logoutPending && (
              <Text style={styles.pendingText}>{copy.loggingOut}</Text>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

type AccountDetailProps = {
  label: string;
  value: string;
  colors: typeof Colors_SettingsPage;
  styles: ReturnType<typeof createStyles>;
};

function AccountDetail({ label, value, colors, styles }: AccountDetailProps) {
  return (
    <View style={styles.accountRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} selectable>
        {value}
      </Text>
      <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
    </View>
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
    },
    accountRow: {
      gap: Spacing.xs,
    },
    detailLabel: {
      color: colors.textMuted,
      fontSize: FontSize.sm,
      fontWeight: FontWeight.medium,
    },
    detailValue: {
      color: colors.textPrimary,
      fontSize: FontSize.md,
      fontWeight: FontWeight.semibold,
    },
    rowDivider: {
      height: BorderWidth.thin,
      backgroundColor: colors.border,
    },
    logoutRow: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.md,
    },
    logoutIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primarySoft,
    },
    logoutLabel: {
      flex: 1,
      color: colors.textPrimary,
      fontSize: FontSize.md,
      fontWeight: FontWeight.semibold,
    },
    localNotice: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: Spacing.md,
      borderRadius: Radius.md,
      backgroundColor: colors.primarySoft,
      padding: Spacing.md,
    },
    noticeText: {
      flex: 1,
      gap: Spacing.xs,
    },
    noticeTitle: {
      color: colors.textPrimary,
      fontSize: FontSize.md,
      fontWeight: FontWeight.semibold,
    },
    noticeHint: {
      color: colors.textSecondary,
      fontSize: FontSize.sm,
      lineHeight: 18,
    },
    dangerCard: {
      backgroundColor: colors.surface,
      borderRadius: Radius.lg,
      borderWidth: BorderWidth.thin,
      borderColor: colors.dangerBorder,
      padding: Spacing.lg,
      gap: Spacing.lg,
    },
    deleteDescription: {
      gap: Spacing.xs,
    },
    deleteTitle: {
      color: colors.textPrimary,
      fontSize: FontSize.md,
      fontWeight: FontWeight.bold,
    },
    deleteHint: {
      color: colors.textMuted,
      fontSize: FontSize.sm,
      lineHeight: 18,
    },
    deleteButton: {
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing.sm,
      borderWidth: BorderWidth.thin,
      borderColor: colors.dangerBorder,
      borderRadius: Radius.md,
      backgroundColor: colors.dangerSoft,
      paddingHorizontal: Spacing.md,
    },
    deleteButtonText: {
      color: colors.danger,
      fontSize: FontSize.md,
      fontWeight: FontWeight.bold,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      backgroundColor: "rgba(15, 23, 42, 0.6)",
      padding: Spacing.lg,
    },
    confirmationCard: {
      width: "100%",
      maxWidth: 480,
      alignSelf: "center",
      backgroundColor: colors.surface,
      borderRadius: Radius.xl,
      borderWidth: BorderWidth.thin,
      borderColor: colors.border,
      padding: Spacing.xl,
      gap: Spacing.md,
    },
    warningIcon: {
      width: 52,
      height: 52,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: Radius.pill,
      backgroundColor: colors.dangerSoft,
    },
    logoutConfirmIcon: {
      width: 52,
      height: 52,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: Radius.pill,
      backgroundColor: colors.primarySoft,
    },
    confirmationTitle: {
      color: colors.textPrimary,
      fontSize: FontSize.xl,
      fontWeight: FontWeight.bold,
    },
    confirmationBody: {
      color: colors.textSecondary,
      fontSize: FontSize.md,
      lineHeight: 21,
    },
    confirmationInput: {
      minHeight: 50,
      borderWidth: BorderWidth.thin,
      borderColor: colors.border,
      borderRadius: Radius.md,
      backgroundColor: colors.inputBG,
      color: colors.textPrimary,
      paddingHorizontal: Spacing.md,
      fontSize: FontSize.md,
    },
    errorText: {
      color: colors.danger,
      fontSize: FontSize.sm,
      fontWeight: FontWeight.medium,
    },
    modalActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: Spacing.sm,
      marginTop: Spacing.sm,
    },
    cancelButton: {
      minHeight: 44,
      justifyContent: "center",
      paddingHorizontal: Spacing.md,
    },
    cancelText: {
      color: colors.textSecondary,
      fontSize: FontSize.md,
      fontWeight: FontWeight.semibold,
    },
    continueButton: {
      minHeight: 44,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: Radius.md,
      backgroundColor: colors.dangerSoft,
      paddingHorizontal: Spacing.md,
    },
    continueText: {
      color: colors.danger,
      fontSize: FontSize.md,
      fontWeight: FontWeight.bold,
    },
    logoutConfirmButton: {
      minHeight: 44,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: Radius.md,
      backgroundColor: colors.primary,
      paddingHorizontal: Spacing.md,
    },
    logoutConfirmText: {
      color: colors.onPrimary,
      fontSize: FontSize.md,
      fontWeight: FontWeight.bold,
    },
    permanentDeleteButton: {
      minHeight: 44,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: Radius.md,
      backgroundColor: colors.danger,
      paddingHorizontal: Spacing.md,
    },
    permanentDeleteText: {
      color: colors.onPrimary,
      fontSize: FontSize.md,
      fontWeight: FontWeight.bold,
    },
    disabledButton: {
      opacity: 0.45,
    },
    pendingText: {
      color: colors.textMuted,
      fontSize: FontSize.sm,
      textAlign: "right",
    },
  });
}
