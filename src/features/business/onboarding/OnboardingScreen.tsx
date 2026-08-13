import { useRouter } from "expo-router";
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

import { PageHeader } from "@/shared/components/Header/PageHeader";
import { LabeledInput } from "@/shared/components/Input/LabledInput";
import { PrimaryButton } from "@/shared/components/Button/PrimaryButton";
import { Colors_LoginPage } from "@/shared/constants/colors";
import { BorderWidth, Radius } from "@/shared/constants/radius";
import { Spacing } from "@/shared/constants/spacing";
import { FontSize, FontWeight } from "@/shared/constants/typography";

import { useCreateBusiness } from "../hooks/useBusiness";

const colors = Colors_LoginPage;

export default function OnboardingScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createBusiness = useCreateBusiness();

  const handleContinue = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Business name is required to get started.");
      return;
    }
    setError(null);

    createBusiness.mutate(
      { name: trimmedName, phone: phone.trim() || null, address: address.trim() || null },
      {
        onSuccess: () => router.replace("/(auth)/business-type"),
      },
    );
  };

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
          <PageHeader
            title="Set up your business"
            subtitle="Enter your business details to start keeping khata."
            icon="storefront-outline"
            gradient={[colors.heroTop, colors.heroBottom]}
          />

          <View style={styles.formCard}>
            <View style={styles.form}>
              <View style={styles.field}>
                <LabeledInput
                  label="Business Name"
                  placeholder="e.g. Ram Kirana Pasal"
                  value={name}
                  onChangeText={setName}
                  labelColor={colors.textPrimary}
                  inputBgColor={colors.surface}
                  borderColor={colors.border}
                  placeholderColor={colors.textMuted}
                  labelStyle={styles.inputLabel}
                  inputStyle={styles.inputText}
                  inputContainerStyle={styles.inputContainer}
                />
              </View>

              <View style={styles.field}>
                <LabeledInput
                  label="Phone (optional)"
                  placeholder="Enter phone number"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  labelColor={colors.textPrimary}
                  inputBgColor={colors.surface}
                  borderColor={colors.border}
                  placeholderColor={colors.textMuted}
                  labelStyle={styles.inputLabel}
                  inputStyle={styles.inputText}
                  inputContainerStyle={styles.inputContainer}
                />
              </View>

              <View style={styles.field}>
                <LabeledInput
                  label="Address (optional)"
                  placeholder="Enter address"
                  value={address}
                  onChangeText={setAddress}
                  labelColor={colors.textPrimary}
                  inputBgColor={colors.surface}
                  borderColor={colors.border}
                  placeholderColor={colors.textMuted}
                  labelStyle={styles.inputLabel}
                  inputStyle={styles.inputText}
                  inputContainerStyle={styles.inputContainer}
                />
              </View>
            </View>

            {!!error && <Text style={styles.errorText}>{error}</Text>}
            {createBusiness.isError && (
              <Text style={styles.errorText}>
                Could not save the business. Please try again.
              </Text>
            )}

            <PrimaryButton
              title="Continue"
              loading={createBusiness.isPending}
              onPress={handleContinue}
              gradient={[colors.primary, colors.primaryDeep]}
              style={styles.continueButton}
            />
          </View>
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
    paddingBottom: Spacing["2xl"],
  },
  formCard: {
    backgroundColor: colors.surface,
    marginTop: Spacing.xl,
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: BorderWidth.thin,
    borderColor: colors.border,
    padding: Spacing.xl,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 20,
    elevation: 4,
    gap: Spacing.lg,
  },
  form: {
    gap: Spacing.xl,
  },
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
    minHeight: 52,
  },
  inputText: {
    fontSize: FontSize.lg,
    color: colors.textPrimary,
  },
  errorText: {
    color: colors.danger,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  continueButton: {
    marginTop: Spacing.sm,
  },
});
