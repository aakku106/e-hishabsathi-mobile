import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/shared/components/Button/PrimaryButton";
import { PageHeader } from "@/shared/components/Header/PageHeader";
import { BusinessTypes, type BusinessType } from "@/shared/constants/businessTypes";
import { Colors_LoginPage } from "@/shared/constants/colors";
import { BorderWidth, Radius } from "@/shared/constants/radius";
import { Spacing } from "@/shared/constants/spacing";
import { FontSize, FontWeight } from "@/shared/constants/typography";

import { useBusiness, useUpdateBusinessType } from "../hooks/useBusiness";

const colors = Colors_LoginPage;

const BUSINESS_TYPE_OPTIONS: {
  value: BusinessType;
  label: string;
  hint: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}[] = [
  { value: BusinessTypes.retail, label: "Retail", hint: "Sells goods to end customers", icon: "store-outline" },
  { value: BusinessTypes.wholesale, label: "Wholesale", hint: "Sells goods in bulk to shops", icon: "truck-outline" },
  { value: BusinessTypes.restaurant, label: "Restaurant", hint: "Food and drink services", icon: "silverware-fork-knife" },
  { value: BusinessTypes.service, label: "Service", hint: "Provides services instead of goods", icon: "tools" },
  { value: BusinessTypes.other, label: "Other", hint: "Anything else", icon: "dots-horizontal-circle-outline" },
];

export default function BusinessTypeScreen() {
  const router = useRouter();
  const { data: business } = useBusiness();
  const updateBusinessType = useUpdateBusinessType();

  const currentType = business?.type ?? BusinessTypes.retail;
  const [selected, setSelected] = useState<BusinessType>(currentType);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = () => {
    if (!business) {
      setError("Business not found. Please go back and set up your business.");
      return;
    }
    setError(null);

    updateBusinessType.mutate(
      { id: business.id, type: selected },
      {
        onSuccess: () => router.replace("/(tabs)/04-dashboard"),
      },
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          title="What kind of business?"
          subtitle="This helps us tailor the khata experience for you."
          icon="domain"
          gradient={[colors.heroTop, colors.heroBottom]}
        />

        <View style={styles.options}>
          {BUSINESS_TYPE_OPTIONS.map((option) => {
            const isSelected = selected === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                activeOpacity={0.8}
                onPress={() => setSelected(option.value)}
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
              >
                <View style={[styles.optionIcon, isSelected && styles.optionIconSelected]}>
                  <MaterialCommunityIcons
                    name={option.icon}
                    size={22}
                    color={isSelected ? colors.onPrimary : colors.textSecondary}
                  />
                </View>
                <View style={styles.optionTextWrap}>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  <Text style={styles.optionHint}>{option.hint}</Text>
                </View>
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {!!error && <Text style={styles.errorText}>{error}</Text>}
        {updateBusinessType.isError && (
          <Text style={styles.errorText}>
            Could not save the business type. Please try again.
          </Text>
        )}

        <PrimaryButton
          title="Continue"
          loading={updateBusinessType.isPending}
          onPress={handleContinue}
          gradient={[colors.primary, colors.primaryDeep]}
          style={styles.continueButton}
        />
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
    paddingBottom: Spacing["3xl"],
  },
  options: {
    marginTop: Spacing.xl,
    marginHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: Radius.lg,
    borderWidth: BorderWidth.thin,
    borderColor: colors.border,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
    shadowOpacity: 0.08,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  optionIconSelected: {
    backgroundColor: colors.primary,
  },
  optionTextWrap: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    color: colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
  optionHint: {
    color: colors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  errorText: {
    color: colors.danger,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginTop: Spacing.md,
    marginHorizontal: Spacing.lg,
    textAlign: "center",
  },
  continueButton: {
    marginTop: Spacing["2xl"],
    marginHorizontal: Spacing.lg,
  },
});
