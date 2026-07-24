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

import { LabeledInput } from "@/shared/components/Input/LabledInput";
import { TopButton } from "@/shared/components/Button/TopButton";
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
          <View style={styles.heroCard}>
            <Text style={styles.formHeaderLabel}>BUY</Text>

            {/* <Text style={styles.heroTitle}>Add a new buy</Text>
            <Text style={styles.heroSubtitle}>
              Capture quantity, product, and price
            </Text> */}
          </View>

          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              {/* <Text style={styles.formHeaderLabel}>BUY</Text> */}
              {/* <Text style={styles.formHeaderHint}>Quick details</Text> */}
            </View>

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
              />
            </View>
          </View>

          <TopButton
            title="Enter"
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
  safeArea: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.xl,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  heroEyebrow: {
    color: colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    letterSpacing: LetterSpacing.wide,
    textTransform: "uppercase",
    marginBottom: Spacing.xs,
  },
  heroTitle: {
    color: colors.textPrimary,
    fontSize: FontSize["3xl"],
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    color: colors.textSecondary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.regular,
    lineHeight: 24,
  },
  formCard: {
    backgroundColor: "rgba(255,255,255,0.42)",
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 3,
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  formHeaderLabel: {
    color: colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    letterSpacing: LetterSpacing.wide,
    textAlign: "center",
  },
  formHeaderHint: {
    color: colors.textSecondary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  form: { gap: Spacing.lg },
  inputText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.regular,
    color: colors.textPrimary,
  },
  submitButton: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 420,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.pill,
    backgroundColor: colors.enterBtn,
    borderColor: colors.border,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 4,
  },
  submitText: {
    color: colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    letterSpacing: LetterSpacing.wide,
  },
});
