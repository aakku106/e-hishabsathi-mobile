import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TopButton } from "@/shared/components/Button/TopButton";
import { LabeledInput } from "@/shared/components/Input/LabledInput";
import { Colors_BuyPage } from "@/shared/constants/colors";
import { Radius } from "@/shared/constants/radius";
import { Spacing } from "@/shared/constants/spacing";
import {
  FontSize,
  FontWeight,
  LetterSpacing,
} from "@/shared/constants/typography";

const colors = Colors_BuyPage;

export default function PurchaseScreen() {
  const [quantity, setQuantity] = useState("");
  const [product, setProduct] = useState("");
  const [price, setPrice] = useState("");

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerCard}>
            <View style={styles.headerInnerCard}>
              <View style={styles.headerTitleWrap}>
                <View style={styles.headerTitleGlow} />
              </View>
              <View style={styles.titleSlot}>
                <Text style={styles.headerTitle}>BUY</Text>
              </View>
            </View>
          </View>

          <View style={styles.formCard}>
            <View style={styles.form}>
              <LabeledInput
                label="Quantity"
                placeholder="Enter quantity"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="number-pad"
                labelColor={colors.textPrimary}
                inputBgColor={colors.inputBG}
                borderColor={colors.border}
                placeholderColor={colors.textSecondary}
                inputStyle={styles.inputText}
                containerStyle={styles.field}
              />
              <LabeledInput
                label="Product"
                placeholder="Enter product name"
                value={product}
                onChangeText={setProduct}
                returnKeyType="next"
                labelColor={colors.textPrimary}
                inputBgColor={colors.inputBG}
                borderColor={colors.border}
                placeholderColor={colors.textSecondary}
                inputStyle={styles.inputText}
                containerStyle={styles.field}
              />
              <LabeledInput
                label="Price"
                placeholder="Enter price"
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
                returnKeyType="done"
                labelColor={colors.textPrimary}
                inputBgColor={colors.inputBG}
                borderColor={colors.border}
                placeholderColor={colors.textSecondary}
                inputStyle={styles.inputText}
                containerStyle={styles.field}
              />
            </View>
          </View>

          <TopButton
            title="Enter Values"
            onPress={() => undefined}
            style={styles.submitButton}
            textStyle={styles.submitText}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.xl,
  },
  headerCard: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 480,
    shadowColor: "#1F1F1F",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 4,
  },
  headerInnerCard: {
    backgroundColor: colors.topBtn,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing["2xl"],
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  headerTitleGlow: {
  
  
    borderRadius: 999,
    backgroundColor: colors.enterBtn,
    opacity: 0.55,
  },
  titleSlot: {
    alignItems: "center",
    justifyContent: "center",
    height: 8,
    
    
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: FontSize["4xl"],
    fontWeight: FontWeight.bold,
    letterSpacing: LetterSpacing.wider,
    textAlign: "center",
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#1F1F1F",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 4,
    alignSelf: "center",
    width: "100%",
    maxWidth: 480,
  },
  form: {
    gap: Spacing.lg,
  },
  field: {
    gap: Spacing.xs,
  },
  inputText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.regular,
    color: colors.textPrimary,
  },
  submitButton: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    paddingVertical: Spacing.lg,
    borderRadius: Radius.pill,
    backgroundColor: colors.enterBtn,
    borderColor: colors.border,
    shadowColor: "#1F1F1F",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 4,
  },
  submitText: {
    color: colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    letterSpacing: LetterSpacing.wider,
    textAlign: "center",
  },
});
