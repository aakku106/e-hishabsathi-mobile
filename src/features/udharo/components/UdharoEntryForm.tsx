import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Platform,
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
import { useCopy } from "@/shared/i18n";

import {
  useCreateUdharoEntry,
  useUdharoEntries,
  useUdharoSummary,
} from "../hooks/useUdharoEntries";
import { CreateUdharoEntrySchema } from "../validation";

const colors = Colors_UdharoPage;

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  start: () => void;
  stop: () => void;
};

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
  const { t, language } = useCopy();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const { data: udharoEntries = [], isLoading } = useUdharoEntries();
  const { data: summary } = useUdharoSummary();
  const createEntry = useCreateUdharoEntry();

  const handleVoiceInput = () => {
    if (Platform.OS !== "web") {
      Alert.alert("Voice input unavailable", "Voice input is currently enabled in the web version.");
      return;
    }

    const browserWindow = globalThis as typeof globalThis & {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Recognition = browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition;
    if (!Recognition) {
      Alert.alert("Voice input unavailable", "Try Chrome or Edge for microphone voice input.");
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new Recognition();
    recognition.lang = language === "np" ? "ne-NP" : "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognition.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
      Alert.alert("Voice input failed", "Please allow microphone access and try again.");
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      const amountMatch = transcript.match(/(?:amount|money|rupees|rs)\s*(?:is|of)?\s*([\d.]+)/i);
      const phoneMatch = transcript.match(/(?:phone|mobile|number)\s*(?:is)?\s*([\d -]{7,})/i);
      const dateMatch = transcript.match(/(?:due date|date)\s*(?:is|on)?\s*([\d/-]+)/i);
      const nameMatch = transcript.match(/(?:name|customer)\s*(?:is|called)?\s*([\w ]+?)(?=\s+(?:amount|phone|mobile|due date|date)|$)/i);

      if (amountMatch) setAmount(amountMatch[1]);
      if (phoneMatch) setPhoneNumber(phoneMatch[1].replace(/\D/g, ""));
      if (dateMatch) setDueDate(dateMatch[1]);
      if (nameMatch) setName(nameMatch[1].trim());
      if (!amountMatch && !phoneMatch && !dateMatch && !nameMatch) setName(transcript);
      setShowMore(Boolean(phoneMatch || dateMatch));
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSubmit = () => {
    const parsed = CreateUdharoEntrySchema.safeParse({
      name,
      amount: amount || "0",
      phoneNumber: phoneNumber || undefined,
      dueDate: dueDate || null,
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
        setPhoneNumber("");
        setDueDate("");
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
        title={t("Udharo")}
        subtitle={t("Track money owed to you")}
        icon="account-cash-outline"
        gradient={[colors.primary, colors.primaryDeep]}
      />

      <View style={styles.formCard}>
        <Pressable
          style={[styles.voiceButton, styles.voiceButtonFull]}
          onPress={handleVoiceInput}
        >
          <MaterialCommunityIcons
            name={isListening ? "stop-circle-outline" : "microphone-outline"}
            size={18}
            color={colors.primary}
          />
          <Text style={styles.voiceText}>
            {isListening ? t("Listening") : t("AI Voice")}
          </Text>
        </Pressable>

        <View style={styles.fieldGroup}>
          <View style={styles.inputBlock}>
            <LabeledInput
              label={t("Name")}
              placeholder={t("Enter Name")}
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
              label={t("Amount")}
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

        <View style={styles.moreSection}>
          <View style={styles.moreHeader}>
            <Pressable
              style={styles.moreToggle}
              onPress={() => setShowMore((value) => !value)}
            >
              <Text style={styles.moreTitle}>{t("More")}</Text>
              <MaterialCommunityIcons
                name={showMore ? "chevron-up" : "chevron-down"}
                size={22}
                color={colors.primary}
              />
            </Pressable>
          </View>
          {showMore && (
            <View style={styles.moreFields}>
              <View style={styles.inputBlock}>
                <LabeledInput label={t("Phone Number")} placeholder={t("Enter phone number")} value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" labelColor={colors.textPrimary} inputBgColor={colors.inputBG} borderColor={colors.border} placeholderColor={colors.textMuted} labelStyle={styles.inputLabel} inputStyle={styles.inputText} inputContainerStyle={styles.inputContainer} />
              </View>
              <View style={styles.inputBlock}>
                <LabeledInput label={t("Due Date")} placeholder="YYYY-MM-DD" value={dueDate} onChangeText={setDueDate} labelColor={colors.textPrimary} inputBgColor={colors.inputBG} borderColor={colors.border} placeholderColor={colors.textMuted} labelStyle={styles.inputLabel} inputStyle={styles.inputText} inputContainerStyle={styles.inputContainer} />
              </View>
            </View>
          )}
        </View>

        <PrimaryButton
          title={t("Save entry")}
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
          <Text style={styles.summaryLabel}>{t("People")}</Text>
          <Text style={styles.summaryValue}>{summary?.entryCount ?? 0}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>{t("Total udharo")}</Text>
          <Text style={[styles.summaryValue, { color: colors.primary }]}>
            {formatCurrency(summary?.totalAmount ?? 0)}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>{t("Overdue")}</Text>
          <Text style={styles.summaryValue}>{summary?.overdueCount ?? 0}</Text>
        </View>
      </View>

      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>{t("Recent udharo")}</Text>

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
  moreSection: {
    borderTopWidth: BorderWidth.thin,
    borderTopColor: colors.border,
    paddingTop: Spacing.md,
    gap: Spacing.md,
  },
  moreHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  moreToggle: {
    flex: 1,
    minHeight: 38,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  moreTitle: {
    color: colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  voiceButton: {
    minHeight: 38,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  voiceButtonFull: {
    width: "100%",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  voiceText: {
    color: colors.primary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  moreFields: {
    gap: Spacing.md,
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
