import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Dropdown, DropdownOption } from "@/shared/components/DatePicker/DropDown";
import { LabeledInput } from "@/shared/components/Input/LabledInput";
import { Colors_SalesPage } from "@/shared/constants/colors";
import { BorderWidth, Radius } from "@/shared/constants/radius";
import { Spacing } from "@/shared/constants/spacing";
import { FontSize, FontWeight } from "@/shared/constants/typography";
import { formatCurrency } from "@/shared/utils/formatter";
import { useCopy } from "@/shared/i18n";

import {
  useCreateSalesEntry,
  useSalesEntries,
  useSalesSummary,
} from "../hooks/useSalesEntries";
import { CreateSalesEntrySchema, CreateSalesEntryFormValues } from "../validation";

const colors = Colors_SalesPage;

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

const extraDetailOptions: DropdownOption[] = [
  {
    label: "Select extra detail",
    value: "",
  },
  {
    label: "Age",
    value: "age",
  },
  {
    label: "Color",
    value: "color",
  },
  {
    label: "Size",
    value: "size",
  },
  {
    label: "Note",
    value: "note",
  },
];

const colorOptions = [
  {
    label: "Red",
    value: "#EF4444",
  },
  {
    label: "Blue",
    value: "#3B82F6",
  },
  {
    label: "Green",
    value: "#10B981",
  },
  {
    label: "Yellow",
    value: "#F59E0B",
  },
  {
    label: "Purple",
    value: "#8B5CF6",
  },
  {
    label: "Black",
    value: "#111827",
  },
];

const COLOR_HEX: Record<string, string> = Object.fromEntries(
  colorOptions.map((color) => [color.label, color.value]),
);

type ProductDraft = {
  id: string;
  product: string;
  quantity: string;
  price: string;
  extraDetail: DropdownOption | null;
  extraValue: string;
  selectedColor: (typeof colorOptions)[number];
};

export default function SalesEntryForm() {
  const { t, language } = useCopy();
  const emptyProduct = (): ProductDraft => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    product: "",
    quantity: "",
    price: "",
    extraDetail: null,
    extraValue: "",
    selectedColor: colorOptions[0],
  });

  const [products, setProducts] = useState<ProductDraft[]>(() => [
    emptyProduct(),
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [listeningProductId, setListeningProductId] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const { data: entries = [], isLoading } = useSalesEntries();
  const { data: summary } = useSalesSummary();
  const createEntry = useCreateSalesEntry();

  const handleExtraDetailSelect = (
    id: string,
    selected: DropdownOption | DropdownOption[],
  ) => {
    const nextValue = Array.isArray(selected) ? selected[0] : selected;
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, extraDetail: nextValue ?? null, extraValue: "" } : p,
      ),
    );
  };

  const handleUpdateProduct = (
    id: string,
    field: string,
    value: string | DropdownOption | null,
  ) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? ({ ...p, [field]: value } as ProductDraft) : p,
      ),
    );
  };

  const handleAddProduct = () => {
    setProducts((prev) => [...prev, emptyProduct()]);
  };

  const handleRemoveProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const totalAmount = useMemo(() => {
    return products.reduce((sum, p) => {
      const qty = Number(p.quantity) || 0;
      const sellingPrice = Number(p.price) || 0;
      return sum + qty * sellingPrice;
    }, 0);
  }, [products]);

  const handleReset = () => {
    setProducts([emptyProduct()]);
    setErrors({});
  };

  const handleVoiceInput = (id: string) => {
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
      Alert.alert("Voice input unavailable", "Try Chrome or Edge for microphone support.");
      return;
    }

    if (listeningProductId === id) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new Recognition();
    recognition.lang = language === "np" ? "ne-NP" : "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => setListeningProductId(id);
    recognition.onend = () => {
      setListeningProductId(null);
      recognitionRef.current = null;
    };
    recognition.onerror = () => {
      setListeningProductId(null);
      recognitionRef.current = null;
      Alert.alert("Voice input failed", "Please allow microphone access and try again.");
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      const quantityMatch = transcript.match(/(?:quantity|qty)\s*([\d.]+)/i);
      const priceMatch = transcript.match(/price\s*(?:is|of)?\s*([\d.]+)/i);
      const productMatch = transcript.match(/product\s*(?:is|called)?\s*([\w -]+?)(?=\s+price|\s+quantity|$)/i);

      if (quantityMatch) handleUpdateProduct(id, "quantity", quantityMatch[1]);
      if (priceMatch) handleUpdateProduct(id, "price", priceMatch[1]);
      if (productMatch) handleUpdateProduct(id, "product", productMatch[1].trim());
      if (!quantityMatch && !priceMatch && !productMatch) {
        handleUpdateProduct(id, "product", transcript);
      }
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSaveSale = () => {
    const validated: CreateSalesEntryFormValues[] = [];
    const fieldErrors: Record<string, string> = {};

    for (const item of products) {
      const parsed = CreateSalesEntrySchema.safeParse({
        product: item.product,
        quantity: item.quantity || "0",
        price: item.price || "0",
        amount:
          (Number(item.quantity) || 0) * (Number(item.price) || 0),
        extraDetail: item.extraDetail?.value
          ? item.extraDetail.label
          : null,
        extraValue: item.extraValue.trim() || null,
        color:
          item.extraDetail?.value === "color"
            ? item.selectedColor.label
            : null,
      });

      if (!parsed.success) {
        for (const issue of parsed.error.issues) {
          const key = `${item.id}.${String(issue.path[0])}`;
          if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
        }
      } else {
        validated.push(parsed.data);
      }
    }

    setErrors(fieldErrors);
    if (validated.length !== products.length) return;

    validated.forEach((data, index) => {
      createEntry.mutate(data, {
        onSuccess: () => {
          if (index === validated.length - 1) handleReset();
        },
      });
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerIconBox}>
          <MaterialCommunityIcons
            name="cash-multiple"
            size={24}
            color="#FFFFFF"
          />
        </View>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{t("Sales")}</Text>
          <Text style={styles.headerSubtitle}>{t("Add a new sale")}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <View style={styles.formCard}>
          <View style={styles.productHeaderRow}>
            <Text style={styles.extraTitle}>{t("Products")}</Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleAddProduct}
              style={styles.addButton}
            >
              <MaterialCommunityIcons
                name="plus"
                size={20}
                color={colors.primary}
              />
              <Text style={styles.addButtonText}>{t("Add Product")}</Text>
            </TouchableOpacity>
          </View>

          {products.map((p, index) => {
            const hasExtraDetail = !!p.extraDetail?.value;
            const isColor = p.extraDetail?.value === "color";

            return (
              <View key={p.id} style={styles.productCard}>
                <View style={styles.productCardHeader}>
                  <Text style={styles.inputLabel}>{t("Item")} {index + 1}</Text>

                  {products.length > 1 && (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleRemoveProduct(p.id)}
                    >
                      <MaterialCommunityIcons
                        name="close-circle-outline"
                        size={22}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.fieldRow}>
                  <View style={styles.iconBox}>
                    <MaterialCommunityIcons
                      name="basket-outline"
                      size={27}
                      color={colors.primary}
                    />
                  </View>

                  <View style={styles.fieldContent}>
                    <LabeledInput
                      label={t("Quantity")}
                      placeholder={t("Enter Quantity")}
                      value={p.quantity}
                      onChangeText={(v) =>
                        handleUpdateProduct(p.id, "quantity", v)
                      }
                      keyboardType="numeric"
                      labelColor={colors.textPrimary}
                      inputBgColor={colors.inputBG}
                      borderColor={colors.border}
                      placeholderColor="rgba(31,31,31,0.55)"
                      containerStyle={styles.inputBlock}
                      labelStyle={styles.inputLabel}
                      inputStyle={styles.inputText}
                      inputContainerStyle={styles.inputContainer}
                    />
                    {!!errors[`${p.id}.quantity`] && (
                      <Text style={styles.errorText}>
                        {errors[`${p.id}.quantity`]}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.fieldRow}>
                  <View style={styles.iconBox}>
                    <MaterialCommunityIcons
                      name="cube-outline"
                      size={27}
                      color={colors.primary}
                    />
                  </View>

                  <View style={styles.fieldContent}>
                    <LabeledInput
                      label={t("Product")}
                      placeholder={t("Enter Product name")}
                      value={p.product}
                      onChangeText={(v) =>
                        handleUpdateProduct(p.id, "product", v)
                      }
                      labelColor={colors.textPrimary}
                      inputBgColor={colors.inputBG}
                      borderColor={colors.border}
                      placeholderColor="rgba(31,31,31,0.55)"
                      containerStyle={styles.inputBlock}
                      labelStyle={styles.inputLabel}
                      inputStyle={styles.inputText}
                      inputContainerStyle={styles.inputContainer}
                    />
                    {!!errors[`${p.id}.product`] && (
                      <Text style={styles.errorText}>
                        {errors[`${p.id}.product`]}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.fieldRow}>
                  <View style={styles.iconBox}>
                    <MaterialCommunityIcons
                      name="currency-inr"
                      size={27}
                      color={colors.primary}
                    />
                  </View>

                  <View style={styles.fieldContent}>
                    <LabeledInput
                      label={t("Price")}
                      placeholder={`Rs. ${t("Enter Price")}`}
                      value={p.price}
                      onChangeText={(v) =>
                        handleUpdateProduct(p.id, "price", v)
                      }
                      keyboardType="numeric"
                      labelColor={colors.textPrimary}
                      inputBgColor={colors.inputBG}
                      borderColor={colors.border}
                      placeholderColor="rgba(31,31,31,0.55)"
                      containerStyle={styles.inputBlock}
                      labelStyle={styles.inputLabel}
                      inputStyle={styles.inputText}
                      inputContainerStyle={styles.inputContainer}
                    />
                    {!!errors[`${p.id}.price`] && (
                      <Text style={styles.errorText}>
                        {errors[`${p.id}.price`]}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.moreContainer}>
                  <Text style={styles.moreTitle}>{t("More")}</Text>

                  <View style={styles.moreRow}>
                    <View style={styles.moreDropdown}>
                      <Dropdown
                        options={extraDetailOptions}
                        defaultValue={p.extraDetail ?? extraDetailOptions[0]}
                        placeholder="Optional"
                        onSelect={(selected) =>
                          handleExtraDetailSelect(p.id, selected)
                        }
                        bgColor={colors.inputBG}
                        textColor={colors.textPrimary}
                        dropdownBgColor={colors.surface}
                        dropdownTextColor={colors.textPrimary}
                        borderColor={colors.border}
                        buttonStyle={styles.dropdownButton}
                        textStyle={styles.dropdownText}
                        dropdownListStyle={styles.dropdownList}
                      />
                    </View>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleVoiceInput(p.id)}
                      style={[styles.voiceButton, listeningProductId === p.id && styles.voiceButtonActive]}
                    >
                      <MaterialCommunityIcons
                        name={listeningProductId === p.id ? "stop-circle-outline" : "microphone-outline"}
                        size={19}
                        color={colors.primary}
                      />
                      <View>
                        <Text style={styles.voiceTitle}>{listeningProductId === p.id ? t("Listening") : t("AI Voice")}</Text>
                        <Text style={styles.voiceSubtitle}>{listeningProductId === p.id ? t("Speak now") : t("Fill with voice")}</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>

                {hasExtraDetail && (
                  <View style={styles.extraSection}>
                    <View style={styles.extraHeader}>
                      <Text style={styles.extraTitle}>
                        {p.extraDetail?.label}
                      </Text>
                      <Text style={styles.optionalText}>Optional</Text>
                    </View>

                    {isColor ? (
                      <View style={styles.colorSection}>
                        <Text style={styles.detailLabel}>Choose Color</Text>

                        <View style={styles.colorGrid}>
                          {colorOptions.map((color) => {
                            const selected =
                              p.selectedColor.value === color.value;
                            return (
                              <TouchableOpacity
                                key={color.value}
                                activeOpacity={0.8}
                                onPress={() =>
                                  handleUpdateProduct(
                                    p.id,
                                    "selectedColor",
                                    color,
                                  )
                                }
                                style={[
                                  styles.colorCircle,
                                  { backgroundColor: color.value },
                                  selected && styles.selectedColor,
                                ]}
                              >
                                {selected && (
                                  <MaterialCommunityIcons
                                    name="check"
                                    size={18}
                                    color="#FFFFFF"
                                  />
                                )}
                              </TouchableOpacity>
                            );
                          })}
                        </View>

                        <View style={styles.selectedColorBox}>
                          <View
                            style={[
                              styles.selectedColorCircle,
                              { backgroundColor: p.selectedColor.value },
                            ]}
                          />
                          <Text style={styles.selectedColorText}>
                            {p.selectedColor.label}
                          </Text>
                        </View>
                      </View>
                    ) : (
                      <LabeledInput
                        label={p.extraDetail?.label || "Detail"}
                        placeholder={
                          p.extraDetail?.label
                            ? `Enter ${p.extraDetail.label.toLowerCase()}`
                            : "Enter detail"
                        }
                        value={p.extraValue}
                        onChangeText={(v) =>
                          handleUpdateProduct(p.id, "extraValue", v)
                        }
                        keyboardType={
                          p.extraDetail?.value === "age" ? "numeric" : "default"
                        }
                        labelColor={colors.textPrimary}
                        inputBgColor={colors.inputBG}
                        borderColor={colors.border}
                        placeholderColor="rgba(31,31,31,0.55)"
                        containerStyle={styles.inputBlock}
                        labelStyle={styles.inputLabel}
                        inputStyle={styles.inputText}
                        inputContainerStyle={styles.inputContainer}
                      />
                    )}
                  </View>
                )}
              </View>
            );
          })}

          <View style={styles.divider} />

          <View style={styles.totalBox}>
            <View style={styles.totalLeft}>
              <View style={styles.totalIconBox}>
                <MaterialCommunityIcons
                  name="receipt-text-outline"
                  size={27}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.totalLabel}>{t("Total Amount")}</Text>
            </View>

            <Text style={styles.totalAmount}>
              {formatCurrency(totalAmount)}
            </Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleReset}
              style={[styles.actionButton, styles.resetButton]}
            >
              <MaterialCommunityIcons
                name="refresh"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.resetText}>{t("Reset")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSaveSale}
              disabled={createEntry.isPending}
              style={[styles.actionButton, styles.saveButton]}
            >
              {createEntry.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="content-save-outline"
                    size={24}
                    color="#FFFFFF"
                  />
                  <Text style={styles.saveText}>{t("Save Sale")}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {createEntry.isError && (
            <Text style={styles.errorText}>
              Could not save the entry. Please try again.
            </Text>
          )}
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{t("Entries")}</Text>
            <Text style={styles.summaryValue}>{summary?.entryCount ?? 0}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{t("Quantity")}</Text>
            <Text style={styles.summaryValue}>{summary?.totalQuantity ?? 0}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{t("Total")}</Text>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>
              {formatCurrency(summary?.totalAmount ?? 0)}
            </Text>
          </View>
        </View>

        <View style={styles.listSection}>
          <Text style={styles.listTitle}>{t("Recent sales")}</Text>

          {isLoading ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : (
            <View style={styles.listCard}>
              {entries.length === 0 && (
                <Text style={styles.emptyText}>
                  No sales yet. Add your first sale above.
                </Text>
              )}
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
                      name="shopping-outline"
                      size={18}
                      color={colors.primary}
                    />
                  </View>

                  <View style={styles.entryContent}>
                    <Text style={styles.entryName}>{entry.product}</Text>
                    <View style={styles.entryMetaRow}>
                      {!!entry.color && (
                        <View
                          style={[
                            styles.colorDot,
                            { backgroundColor: COLOR_HEX[entry.color] ?? "#94A3B8" },
                          ]}
                        />
                      )}
                      <Text style={styles.entryMeta}>
                        Qty {entry.quantity} × {formatCurrency(entry.price)}
                        {entry.extraDetail ? ` · ${entry.extraDetail}` : ""}
                      </Text>
                    </View>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },

  headerIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: FontWeight.bold,
    lineHeight: 32,
  },

  headerSubtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: FontSize.md,
    marginTop: 2,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing["4xl"],
  },

  formCard: {
    backgroundColor: colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: BorderWidth.thin,
    borderColor: colors.border,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },

  productHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    minHeight: 40,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: BorderWidth.base,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },

  addButtonText: {
    color: colors.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },

  productCard: {
    marginBottom: Spacing.md,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: BorderWidth.thin,
    borderColor: colors.border,
    backgroundColor: "#F3FFF7",
  },

  productCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },

  fieldRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },

  iconBox: {
    width: 52,
    height: 52,
    marginTop: 25,
    borderRadius: Radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  fieldContent: {
    flex: 1,
  },

  inputBlock: {
    gap: Spacing.xs,
  },

  inputContainer: {
    backgroundColor: colors.inputBG,
    borderColor: colors.border,
    shadowOpacity: 0,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
    elevation: 0,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: BorderWidth.thin,
    borderRadius: Radius.md,
  },

  inputLabel: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    lineHeight: 24,
  },

  inputText: {
    color: colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
  },

  errorText: {
    color: colors.danger,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },

  moreContainer: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },

  moreTitle: {
    color: colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xs,
  },

  moreRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: Spacing.sm,
  },

  moreDropdown: {
    flex: 1,
  },

  voiceButton: {
    flex: 0.72,
    minHeight: 52,
    borderWidth: BorderWidth.base,
    borderColor: colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
  },

  voiceButtonActive: {
    backgroundColor: colors.primarySoft,
  },

  voiceTitle: {
    color: colors.primary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },

  voiceSubtitle: {
    color: colors.textMuted,
    fontSize: 10,
  },

  dropdownButton: {
    borderRadius: Radius.lg,
    borderWidth: BorderWidth.base,
    borderColor: colors.border,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },

  dropdownText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },

  dropdownList: {
    borderRadius: Radius.lg,
    borderWidth: BorderWidth.base,
    borderColor: colors.border,
  },

  extraSection: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: BorderWidth.thin,
    borderColor: colors.border,
    backgroundColor: colors.primarySoft,
    gap: Spacing.sm,
  },

  extraHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  extraTitle: {
    color: colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },

  optionalText: {
    color: colors.primary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },

  detailLabel: {
    color: colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },

  colorSection: {
    gap: Spacing.sm,
  },

  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },

  colorCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: BorderWidth.base,
    borderColor: "rgba(255,255,255,0.8)",
  },

  selectedColor: {
    borderColor: colors.textPrimary,
    transform: [{ scale: 1.08 }],
  },

  selectedColorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: colors.inputBG,
    borderWidth: BorderWidth.base,
    borderColor: colors.border,
  },

  selectedColorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: BorderWidth.base,
    borderColor: colors.border,
  },

  selectedColorText: {
    color: colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: Spacing.md,
  },

  totalBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: colors.primarySoft,
  },

  totalLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },

  totalIconBox: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  totalLabel: {
    color: colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
  },

  totalAmount: {
    color: colors.primary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },

  actionRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.md,
  },

  actionButton: {
    flex: 1,
    minHeight: 56,
    borderRadius: Radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },

  resetButton: {
    backgroundColor: colors.surface,
    borderWidth: BorderWidth.base,
    borderColor: colors.primary,
  },

  saveButton: {
    backgroundColor: colors.primary,
    borderWidth: BorderWidth.thin,
    borderColor: "rgba(255,255,255,0.3)",
  },

  resetText: {
    color: colors.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },

  saveText: {
    color: "#FFFFFF",
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },

  summaryCard: {
    marginTop: Spacing.xl,
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
    gap: Spacing.md,
  },

  listTitle: {
    color: colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },

  loader: {
    alignSelf: "center",
    marginTop: Spacing.lg,
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
    gap: 2,
  },

  entryName: {
    color: colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },

  entryMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },

  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: BorderWidth.thin,
    borderColor: colors.border,
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

  emptyText: {
    color: colors.textMuted,
    fontSize: FontSize.md,
    textAlign: "center",
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
});

