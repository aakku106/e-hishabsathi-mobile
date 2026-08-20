import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/shared/components/Button/PrimaryButton";
import { PageHeader } from "@/shared/components/Header/PageHeader";
import { LabeledInput } from "@/shared/components/Input/LabledInput";
import { Colors_PurchasesPage } from "@/shared/constants/colors";
import { BorderWidth, Radius } from "@/shared/constants/radius";
import { Spacing } from "@/shared/constants/spacing";
import { FontSize, FontWeight } from "@/shared/constants/typography";
import { formatCurrency } from "@/shared/utils/formatter";
import { useCopy } from "@/shared/i18n";

import {
  useCreatePurchaseEntry,
  usePurchaseEntries,
  usePurchaseSummary,
} from "./hooks/usePurchaseEntries";
import { CreatePurchaseEntrySchema } from "./validation";

const colors = Colors_PurchasesPage;

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

export default function PurchaseScreen() {
  const { t, language } = useCopy();
  const [quantity, setQuantity] = useState("");
  const [product, setProduct] = useState("");
  const [price, setPrice] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const { data: entries = [], isLoading } = usePurchaseEntries();
  const { data: summary } = usePurchaseSummary();
  const createEntry = useCreatePurchaseEntry();
  const currentAmount =
    Number.parseFloat(quantity || "0") * Number.parseFloat(price || "0");

  const handleVoiceInput = () => {
    if (Platform.OS !== "web") {
      Alert.alert(
        "Voice input unavailable",
        "Voice input is currently enabled in the web version. Native microphone support can be added with a speech recognition module.",
      );
      return;
    }

    const browserWindow = globalThis as typeof globalThis & {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Recognition =
      browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition;

    if (!Recognition) {
      Alert.alert(
        "Voice input unavailable",
        "Your browser does not support speech recognition. Try Chrome or Edge.",
      );
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
      const quantityMatch = transcript.match(/(?:quantity|qty)\s*([\d.]+)/i);
      const priceMatch = transcript.match(/price\s*(?:is|of)?\s*([\d.]+)/i);
      const productMatch = transcript.match(/product\s*(?:is|called)?\s*([\w -]+?)(?=\s+price|\s+quantity|$)/i);

      if (quantityMatch) setQuantity(quantityMatch[1]);
      if (priceMatch) setPrice(priceMatch[1]);
      if (productMatch) setProduct(productMatch[1].trim());
      if (!quantityMatch && !priceMatch && !productMatch) setProduct(transcript);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSubmit = () => {
    const parsed = CreatePurchaseEntrySchema.safeParse({
      product,
      quantity: quantity || "0",
      price: price || "0",
      amount: Number.parseFloat(quantity || "0") * Number.parseFloat(price || "0"),
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
        setQuantity("");
        setProduct("");
        setPrice("");
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <PageHeader
            title={t("Buy")}
            subtitle={t("Add a new purchase")}
            onBack={() => undefined}
            gradient={[colors.primary, colors.primaryDeep]}
          />

          <View style={styles.formCard}>
            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>{t("Products")}</Text>
              <Pressable style={styles.addProductButton}>
                <MaterialCommunityIcons name="plus" size={24} color={colors.primary} />
                <Text style={styles.addProductText}>{t("Add Product")}</Text>
              </Pressable>
            </View>
            <View style={styles.form}>
              <View style={styles.itemCard}>
                <Text style={styles.itemTitle}>{t("Item 1")}</Text>
                <PurchaseField icon="briefcase-outline" label={t("Quantity")} placeholder={t("Enter Quantity")} value={quantity} onChangeText={setQuantity} keyboardType="number-pad" error={errors.quantity} />
                <PurchaseField icon="tag-outline" label={t("Product")} placeholder={t("Enter Product name")} value={product} onChangeText={setProduct} returnKeyType="next" error={errors.product} />
                <PurchaseField icon="currency-inr" label={t("Price")} placeholder={t("Enter Price")} value={price} onChangeText={setPrice} keyboardType="decimal-pad" returnKeyType="done" error={errors.price} />
                <PurchaseField icon="storefront-outline" label={t("Supplier")} placeholder={t("Enter Supplier name")} value="" onChangeText={() => undefined} />
                <Text style={styles.moreLabel}>{t("More")}</Text>
                <View style={styles.moreRow}>
                  <View style={styles.selectField}>
                    <Text style={styles.selectText}>{t("Select extra detail")}</Text>
                    <MaterialCommunityIcons name="menu-down" size={27} color={colors.textPrimary} />
                  </View>
                  <Pressable style={[styles.voiceButton, isListening && styles.voiceButtonActive]} onPress={handleVoiceInput}>
                    <MaterialCommunityIcons name={isListening ? "stop-circle-outline" : "microphone-outline"} size={20} color={colors.primary} />
                    <View><Text style={styles.voiceTitle}>{isListening ? t("Listening") : t("AI Voice")}</Text><Text style={styles.voiceSubtitle}>{isListening ? t("Speak now") : t("Fill with voice")}</Text></View>
                  </Pressable>
                </View>
              </View>
            </View>

            <View style={styles.totalCard}>
              <View style={styles.totalIcon}><MaterialCommunityIcons name="receipt-text-outline" size={26} color={colors.primary} /></View>
              <Text style={styles.totalLabel}>{t("Total Amount")}</Text>
              <Text style={styles.totalValue}>{formatCurrency(currentAmount)}</Text>
            </View>
            <View style={styles.actions}>
              <Pressable style={styles.resetButton} onPress={() => { setQuantity(""); setProduct(""); setPrice(""); setErrors({}); }}>
                <MaterialCommunityIcons name="refresh" size={26} color={colors.primary} />
                <Text style={styles.resetText}>{t("Reset")}</Text>
              </Pressable>
              <PrimaryButton style={styles.saveButton} title={t("Save Buy")} loading={createEntry.isPending} onPress={handleSubmit} gradient={[colors.primary, colors.primaryDeep]} />
            </View>
            {createEntry.isError && (
              <Text style={styles.errorText}>
                Could not save the entry. Please try again.
              </Text>
            )}
          </View>

          <View style={styles.summaryCard}>
            <SummaryMetric label="TOTAL BUYS" value={String(summary?.entryCount ?? 0)} icon="cart-outline" />
            <SummaryMetric label="QUANTITY" value={String(summary?.totalQuantity ?? 0)} icon="briefcase-outline" />
            <SummaryMetric label="TOTAL AMOUNT" value={formatCurrency(summary?.totalAmount ?? 0)} icon="currency-inr" accent />
            <Text style={styles.monthText}>This Month (May)  <MaterialCommunityIcons name="calendar-month-outline" size={18} color={colors.primary} /></Text>
          </View>

          <View style={styles.listSection}>
            <View style={styles.listHeading}><Text style={styles.listTitle}>{t("Recent Buys")}</Text><MaterialCommunityIcons name="chevron-right" size={28} color={colors.textPrimary} /></View>
            {isLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : entries.length === 0 ? (
              <View style={styles.emptyCard}>
                <MaterialCommunityIcons
                  name="cart-outline"
                  size={28}
                  color={colors.textMuted}
                />
                <Text style={styles.emptyText}>
                  No purchases yet. Add your first entry above.
                </Text>
              </View>
            ) : (
              <View style={styles.listCard}>
                {entries.map((entry, index) => (
                  <View
                    key={entry.id}
                    style={[
                      styles.entryRow,
                      index !== entries.length - 1 && styles.entryDivider,
                    ]}
                  >
                    <View style={styles.entryIcon}>
                      <MaterialCommunityIcons
                        name="package-variant-closed"
                        size={18}
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.entryContent}>
                      <Text style={styles.entryName}>{entry.product}</Text>
                      <Text style={styles.entryMeta}>
                        Qty {entry.quantity} × {formatCurrency(entry.price)}
                      </Text>
                    </View>
                    <Text style={styles.entryAmount}>
                      {formatCurrency(entry.amount)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type PurchaseFieldProps = React.ComponentProps<typeof LabeledInput> & {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  error?: string;
};

function PurchaseField({ icon, error, ...props }: PurchaseFieldProps) {
  return (
    <View style={styles.fieldRow}>
      <View style={styles.fieldIcon}>
        <MaterialCommunityIcons name={icon} size={29} color={colors.primary} />
      </View>
      <View style={styles.fieldInput}>
        <LabeledInput
          {...props}
          labelColor={colors.textPrimary}
          inputBgColor={colors.inputBG}
          borderColor={colors.border}
          placeholderColor={colors.textMuted}
          labelStyle={styles.inputLabel}
          inputStyle={styles.inputText}
          inputContainerStyle={styles.inputContainer}
        />
        {!!error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    </View>
  );
}

function SummaryMetric({
  label,
  value,
  icon,
  accent = false,
}: {
  label: string;
  value: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  accent?: boolean;
}) {
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricLabel, accent && styles.accentText]}>{label}</Text>
      <Text style={[styles.metricValue, accent && styles.accentText]}>{value}</Text>
      <View style={styles.metricIcon}>
        <MaterialCommunityIcons name={icon} size={22} color={colors.primary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    paddingBottom: Spacing["4xl"],
  },
  formCard: {
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.md,
    backgroundColor: colors.surface,
    borderRadius: Radius.lg,
    borderWidth: BorderWidth.thin,
    borderColor: colors.border,
    padding: Spacing.md,
    gap: Spacing.lg,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  form: {
    gap: Spacing.md,
  },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: Spacing.xs },
  sectionTitle: { color: colors.textPrimary, fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  addProductButton: { flexDirection: "row", alignItems: "center", gap: Spacing.xs, borderWidth: 1.5, borderColor: colors.primary, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  addProductText: { color: colors.primary, fontSize: FontSize.md, fontWeight: FontWeight.bold },
  itemCard: { borderWidth: 1, borderColor: colors.border, borderRadius: Radius.lg, padding: Spacing.md, gap: Spacing.md },
  itemTitle: { color: colors.textPrimary, fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.xs },
  fieldRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  fieldIcon: { width: 70, height: 70, borderRadius: Radius.md, backgroundColor: colors.surfaceAlt, alignItems: "center", justifyContent: "center" },
  fieldInput: { flex: 1, gap: Spacing.xs },
  field: {
    gap: Spacing.xs,
  },
  inputLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    lineHeight: 20,
  },
  inputContainer: {
    borderRadius: Radius.md,
    borderWidth: BorderWidth.thin,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minHeight: 68,
  },
  inputText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.regular,
    color: colors.textPrimary,
  },
  errorText: {
    color: colors.danger,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  moreLabel: { color: colors.textPrimary, fontSize: FontSize.md, fontWeight: FontWeight.bold, marginTop: Spacing.xs },
  moreRow: { flexDirection: "row", gap: Spacing.md, alignItems: "stretch" },
  selectField: { flex: 1, minHeight: 58, borderWidth: 1, borderColor: colors.border, borderRadius: Radius.md, paddingHorizontal: Spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  selectText: { color: colors.textPrimary, fontSize: FontSize.md },
  voiceButton: { flex: 0.72, minHeight: 58, borderWidth: 1.5, borderColor: colors.primary, borderRadius: Radius.md, paddingHorizontal: Spacing.sm, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.xs },
  voiceButtonActive: { backgroundColor: colors.surfaceAlt },
  voiceTitle: { color: colors.primary, fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  voiceSubtitle: { color: colors.textMuted, fontSize: 10 },
  totalCard: { minHeight: 86, borderRadius: Radius.md, backgroundColor: colors.surfaceAlt, flexDirection: "row", alignItems: "center", padding: Spacing.md, gap: Spacing.md },
  totalIcon: { width: 56, height: 56, borderRadius: Radius.md, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  totalLabel: { flex: 1, color: colors.textPrimary, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  totalValue: { color: colors.primaryDeep, fontSize: FontSize["2xl"], fontWeight: FontWeight.bold },
  actions: { flexDirection: "row", gap: Spacing.md, alignItems: "center" },
  resetButton: { flex: 1, minHeight: 58, borderWidth: 1.5, borderColor: colors.primary, borderRadius: Radius.md, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.sm },
  saveButton: { flex: 1 },
  resetText: { color: colors.primary, fontSize: FontSize.md, fontWeight: FontWeight.bold },
  summaryCard: { marginTop: Spacing.lg, marginHorizontal: Spacing.md, padding: Spacing.lg, backgroundColor: colors.surface, borderRadius: Radius.lg, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", shadowColor: "#0F172A", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.04, shadowRadius: 14, elevation: 2 },
  metric: { width: "31%", alignItems: "center", borderRightWidth: 1, borderRightColor: colors.border },
  metricLabel: { color: colors.textMuted, fontSize: 11, fontWeight: FontWeight.bold, textAlign: "center" },
  metricValue: { color: colors.textPrimary, fontSize: FontSize.xl, fontWeight: FontWeight.bold, marginVertical: Spacing.sm, textAlign: "center" },
  metricIcon: { width: 44, height: 44, borderRadius: Radius.md, backgroundColor: colors.surfaceAlt, alignItems: "center", justifyContent: "center" },
  accentText: { color: colors.primary },
  monthText: { width: "100%", textAlign: "center", color: colors.primaryDeep, fontSize: FontSize.md, marginTop: Spacing.lg },
  listSection: {
    marginTop: Spacing["2xl"],
    marginHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  listTitle: {
    color: colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  listHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
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
    gap: 2,
  },
  entryName: {
    color: colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  entryMeta: {
    color: colors.textMuted,
    fontSize: FontSize.sm,
  },
  entryAmount: {
    color: colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: Radius.lg,
    borderWidth: BorderWidth.thin,
    borderColor: colors.border,
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing["2xl"],
    paddingHorizontal: Spacing.lg,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: FontSize.md,
    textAlign: "center",
  },
});
