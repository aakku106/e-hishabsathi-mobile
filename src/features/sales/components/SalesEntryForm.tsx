import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Dropdown, {
  DropdownOption,
} from "@/shared/components/DatePicker/DropDown";
import LabeledInput from "@/shared/components/Input/LabledInput";

import { Colors_SalesPage } from "@/shared/constants/colors";
import { BorderWidth, Radius } from "@/shared/constants/radius";
import { Spacing } from "@/shared/constants/spacing";
import { FontSize, FontWeight } from "@/shared/constants/typography";

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

export default function SalesEntryForm() {
  const emptyProduct = () => ({
    id: String(Date.now()) + Math.random().toString(36).slice(2),
    product: "",
    quantity: "",
    price: "",
    extraDetail: null as DropdownOption | null,
    extraValue: "",
    selectedColor: colorOptions[0],
  });

  const [products, setProducts] = useState(() => [emptyProduct()]);

  const handleExtraDetailSelect = (
    id: string,
    selected: DropdownOption | DropdownOption[]
  ) => {
    const nextValue = Array.isArray(selected)
      ? selected[0]
      : selected;

    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, extraDetail: nextValue ?? null, extraValue: "" }
          : p
      )
    );
  };

  const handleUpdateProduct = (
    id: string,
    field: string,
    value: any
  ) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
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
  };

  const handleSaveSale = () => {
    console.log("Sale Saved:", { products, totalAmount });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={30}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Sales</Text>

          <Text style={styles.headerSubtitle}>
            Add a new sale
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <View style={styles.formCard}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: Spacing.md,
          }}>
            <Text style={[styles.extraTitle]}>Products</Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleAddProduct}
              style={[styles.actionButton, {flex: 0, minHeight: 40, paddingHorizontal: Spacing.md}]}
            >
              <MaterialCommunityIcons
                name="plus"
                size={20}
                color={Colors_SalesPage.enterBtn}
              />

              <Text style={[styles.resetText, {marginLeft: Spacing.xs}]}>Add Product</Text>
            </TouchableOpacity>
          </View>

          {products.map((p, index) => {
            const hasExtraDetail = !!p.extraDetail?.value;
            const isColor = p.extraDetail?.value === 'color';

            return (
              <View key={p.id} style={{marginBottom: Spacing.md, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: BorderWidth.thin, borderColor: Colors_SalesPage.border, backgroundColor: '#F3FFF7'}}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm}}>
                  <Text style={[styles.inputLabel]}>Item {index + 1}</Text>

                  {products.length > 1 && (
                    <TouchableOpacity onPress={() => handleRemoveProduct(p.id)} activeOpacity={0.8}>
                      <MaterialCommunityIcons name="close-circle-outline" size={22} color={Colors_SalesPage.enterBtn} />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.fieldRow}>
                  <View style={styles.iconBox}>
                    <MaterialCommunityIcons
                      name="basket-outline"
                      size={27}
                      color={Colors_SalesPage.enterBtn}
                    />
                  </View>

                  <View style={styles.fieldContent}>
                    <LabeledInput
                      label="Quantity"
                      placeholder="Enter Quantity"
                      value={p.quantity}
                      onChangeText={(v) => handleUpdateProduct(p.id, 'quantity', v)}
                      keyboardType="numeric"
                      labelColor={Colors_SalesPage.textPrimary}
                      inputBgColor={Colors_SalesPage.inputBG}
                      borderColor={Colors_SalesPage.border}
                      placeholderColor="rgba(31,31,31,0.55)"
                      containerStyle={styles.inputBlock}
                      labelStyle={styles.inputLabel}
                      inputStyle={styles.inputText}
                      inputContainerStyle={styles.inputContainer}
                    />
                  </View>
                </View>

                <View style={styles.fieldRow}>
                  <View style={styles.iconBox}>
                    <MaterialCommunityIcons
                      name="cube-outline"
                      size={27}
                      color={Colors_SalesPage.enterBtn}
                    />
                  </View>

                  <View style={styles.fieldContent}>
                    <LabeledInput
                      label="Product"
                      placeholder="Enter Product name"
                      value={p.product}
                      onChangeText={(v) => handleUpdateProduct(p.id, 'product', v)}
                      labelColor={Colors_SalesPage.textPrimary}
                      inputBgColor={Colors_SalesPage.inputBG}
                      borderColor={Colors_SalesPage.border}
                      placeholderColor="rgba(31,31,31,0.55)"
                      containerStyle={styles.inputBlock}
                      labelStyle={styles.inputLabel}
                      inputStyle={styles.inputText}
                      inputContainerStyle={styles.inputContainer}
                    />
                  </View>

                  <View style={styles.rightIcon}>
                    <MaterialCommunityIcons
                      name="chevron-down"
                      size={26}
                      color={Colors_SalesPage.enterBtn}
                    />
                  </View>
                </View>

                <View style={styles.fieldRow}>
                  <View style={styles.iconBox}>
                    <MaterialCommunityIcons
                      name="currency-inr"
                      size={27}
                      color={Colors_SalesPage.enterBtn}
                    />
                  </View>

                  <View style={styles.fieldContent}>
                    <LabeledInput
                      label="Price"
                      placeholder="Rs. Enter Price"
                      value={p.price}
                      onChangeText={(v) => handleUpdateProduct(p.id, 'price', v)}
                      keyboardType="numeric"
                      labelColor={Colors_SalesPage.textPrimary}
                      inputBgColor={Colors_SalesPage.inputBG}
                      borderColor={Colors_SalesPage.border}
                      placeholderColor="rgba(31,31,31,0.55)"
                      containerStyle={styles.inputBlock}
                      labelStyle={styles.inputLabel}
                      inputStyle={styles.inputText}
                      inputContainerStyle={styles.inputContainer}
                    />
                  </View>
                </View>

                <View style={styles.moreContainer}>
                  <Text style={styles.moreTitle}>More</Text>

                  <Dropdown
                    options={extraDetailOptions}
                    defaultValue={p.extraDetail ?? extraDetailOptions[0]}
                    placeholder="Optional"
                    onSelect={(s) => handleExtraDetailSelect(p.id, s)}
                    bgColor={Colors_SalesPage.inputBG}
                    textColor={Colors_SalesPage.textPrimary}
                    dropdownBgColor={Colors_SalesPage.surface}
                    dropdownTextColor={Colors_SalesPage.textPrimary}
                    borderColor={Colors_SalesPage.border}
                    buttonStyle={styles.dropdownButton}
                    textStyle={styles.dropdownText}
                    dropdownListStyle={styles.dropdownList}
                  />
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
                            const selected = p.selectedColor.value === color.value;

                            return (
                              <TouchableOpacity
                                key={color.value}
                                activeOpacity={0.8}
                                onPress={() => handleUpdateProduct(p.id, 'selectedColor', color)}
                                style={[
                                  styles.colorCircle,
                                  { backgroundColor: color.value },
                                  selected && styles.selectedColor,
                                ]}
                              >
                                {selected && (
                                  <MaterialCommunityIcons name="check" size={18} color="#FFFFFF" />
                                )}
                              </TouchableOpacity>
                            );
                          })}
                        </View>

                        <View style={styles.selectedColorBox}>
                          <View style={[styles.selectedColorCircle, { backgroundColor: p.selectedColor.value }]} />

                          <Text style={styles.selectedColorText}>{p.selectedColor.label}</Text>
                        </View>
                      </View>
                    ) : (
                      <LabeledInput
                        label={p.extraDetail?.label || 'Detail'}
                        placeholder={p.extraDetail?.label ? `Enter ${p.extraDetail.label.toLowerCase()}` : 'Enter detail'}
                        value={p.extraValue}
                        onChangeText={(v) => handleUpdateProduct(p.id, 'extraValue', v)}
                        keyboardType={p.extraDetail?.value === 'age' ? 'numeric' : 'default'}
                        labelColor={Colors_SalesPage.textPrimary}
                        inputBgColor={Colors_SalesPage.inputBG}
                        borderColor={Colors_SalesPage.border}
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
                  color={Colors_SalesPage.enterBtn}
                />
              </View>

              <Text style={styles.totalLabel}>
                Total Amount
              </Text>
            </View>

            <Text style={styles.totalAmount}>
              Rs.{" "}
              {totalAmount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleReset}
              style={[
                styles.actionButton,
                styles.resetButton,
              ]}
            >
              <MaterialCommunityIcons
                name="refresh"
                size={24}
                color={Colors_SalesPage.enterBtn}
              />

              <Text style={styles.resetText}>
                Reset
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSaveSale}
              style={[
                styles.actionButton,
                styles.saveButton,
              ]}
            >
              <MaterialCommunityIcons
                name="content-save-outline"
                size={24}
                color="#FFFFFF"
              />

              <Text style={styles.saveText}>
                Save Sale
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors_SalesPage.background,
  },

  header: {
    backgroundColor: Colors_SalesPage.topBtn,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: FontWeight.bold,
    lineHeight: 34,
  },

  headerSubtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: FontSize.md,
    marginTop: 2,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },

  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: BorderWidth.thin,
    borderColor: "rgba(255,255,255,0.8)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
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
    backgroundColor: "#ECF8F0",
    alignItems: "center",
    justifyContent: "center",
  },

  fieldContent: {
    flex: 1,
  },

  rightIcon: {
    position: "absolute",
    right: Spacing.md,
    bottom: 15,
  },

  inputBlock: {
    gap: Spacing.xs,
  },

  inputContainer: {
    backgroundColor: Colors_SalesPage.inputBG,
    borderColor: Colors_SalesPage.border,
    shadowOpacity: 0,
    shadowColor: "transparent",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 0,
    elevation: 0,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: BorderWidth.thin,
  },

  inputLabel: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    lineHeight: 24,
  },

  inputText: {
    color: Colors_SalesPage.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
  },

  moreContainer: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },

  moreTitle: {
    color: Colors_SalesPage.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xs,
  },

  dropdownButton: {
    borderRadius: Radius.lg,
    borderWidth: BorderWidth.base,
    borderColor: Colors_SalesPage.border,
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
    borderColor: Colors_SalesPage.border,
  },

  extraSection: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: BorderWidth.thin,
    borderColor: Colors_SalesPage.border,
    backgroundColor: "#F3FFF7",
    gap: Spacing.sm,
  },

  extraHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  extraTitle: {
    color: Colors_SalesPage.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },

  optionalText: {
    color: Colors_SalesPage.enterBtn,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },

  detailLabel: {
    color: Colors_SalesPage.textPrimary,
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
    borderColor: Colors_SalesPage.textPrimary,
    transform: [
      {
        scale: 1.08,
      },
    ],
  },

  selectedColorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors_SalesPage.inputBG,
    borderWidth: BorderWidth.base,
    borderColor: Colors_SalesPage.border,
  },

  selectedColorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: BorderWidth.base,
    borderColor: Colors_SalesPage.border,
  },

  selectedColorText: {
    color: Colors_SalesPage.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },

  divider: {
    height: 1,
    backgroundColor: Colors_SalesPage.border,
    marginVertical: Spacing.md,
  },

  totalBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: "#EFFAF2",
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
    backgroundColor: "#E5F5EA",
    alignItems: "center",
    justifyContent: "center",
  },

  totalLabel: {
    color: Colors_SalesPage.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
  },

  totalAmount: {
    color: Colors_SalesPage.enterBtn,
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
    backgroundColor: "#FFFFFF",
    borderWidth: BorderWidth.base,
    borderColor: Colors_SalesPage.enterBtn,
  },

  saveButton: {
    backgroundColor: Colors_SalesPage.enterBtn,
    borderWidth: BorderWidth.thin,
    borderColor: "rgba(255,255,255,0.3)",
  },

  resetText: {
    color: Colors_SalesPage.enterBtn,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },

  saveText: {
    color: "#FFFFFF",
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
});