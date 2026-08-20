import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

import { APP } from "@/config/app";
import { setSetting, SETTING_KEYS } from "@/database/helpers/settings";
import { Colors_LoginPage } from "@/shared/constants/colors";
import { BorderWidth, Radius } from "@/shared/constants/radius";
import { Spacing } from "@/shared/constants/spacing";
import { FontSize, FontWeight } from "@/shared/constants/typography";
import { useAuthStore } from "@/store/auth.store";

const colors = Colors_LoginPage;

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [pan, setPan] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = () => {
    if (!pan.trim() || !username.trim() || !password.trim()) {
      setError("Please fill in all fields to sign in.");
      return;
    }
    setError(null);
    login({ pan: pan.trim(), username: username.trim() });
    setSetting(SETTING_KEYS.authPan, pan.trim());
    setSetting(SETTING_KEYS.authUsername, username.trim());
    router.replace("/(auth)/onboarding");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <LinearGradient
            colors={[colors.heroTop, colors.heroBottom]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.logoBadge}>
              <MaterialCommunityIcons
                name="book-account-outline"
                size={40}
                color="#FFFFFF"
              />
            </View>
            <Text style={styles.appName}>{APP.name}</Text>
            <Text style={styles.tagline}>
              Your khata, sales and udharo — all in one place.
            </Text>
          </LinearGradient>

          <View style={styles.formCard}>
            <View style={styles.header}>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>Sign in to continue to your khata</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputBlock}>
                <AuthInput
                  icon="account-outline"
                  label="PAN"
                  placeholder="Enter Your PAN number"
                  value={pan}
                  onChangeText={setPan}
                  keyboardType="number-pad"
                  
                />
              </View>

              <View style={styles.inputBlock}>
                <AuthInput
                  icon="account-outline"
                  label="User Name"
                  placeholder="Enter Your User Name"
                  value={username}
                  onChangeText={setUsername}
                />
              </View>

              <View style={styles.inputBlock}>
                <AuthInput
                  icon="lock-outline"
                  label="Password"
                  placeholder="Enter Your Password"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
                  onRightIconPress={() => setShowPassword((visible) => !visible)}
                />
              </View>

              {!!error && <Text style={styles.errorText}>{error}</Text>}

              <TouchableOpacity activeOpacity={0.8} style={styles.forgotButton}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.signInButton}
              onPress={handleSignIn}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDeep]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.signInGradient}
              >
                <Text style={styles.signInText}>Sign in</Text>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={20}
                  color={colors.onPrimary}
                />
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.orLine} />
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.replace("/(auth)/onboarding")}
            >
              <Text style={styles.registerRow}>
                <Text style={styles.registerMuted}>New here? </Text>
                <Text style={styles.registerAction}>Create your account</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type AuthInputProps = TextInputProps & {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  rightIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  onRightIconPress?: () => void;
};

function AuthInput({
  icon,
  label,
  rightIcon,
  onRightIconPress,
  ...inputProps
}: AuthInputProps) {
  return (
    <View style={styles.inputBlock}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputContainer}>
        <View style={styles.inputIcon}>
          <MaterialCommunityIcons name={icon} size={22} color={colors.primary} />
        </View>
        <TextInput
          {...inputProps}
          style={styles.inputText}
          placeholderTextColor={colors.textMuted}
        />
        {!!rightIcon && (
          <TouchableOpacity
            style={styles.rightIconButton}
            onPress={onRightIconPress}
            accessibilityLabel="Toggle password visibility"
          >
            <MaterialCommunityIcons name={rightIcon} size={24} color={colors.textMuted} />
          </TouchableOpacity>
        )}
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
  content: {
    flexGrow: 1,
    paddingBottom: Spacing["4xl"],
  },
  hero: {
    alignItems: "center",
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    paddingTop: 54,
    paddingBottom: 116,
    paddingHorizontal: Spacing.xl,
    borderRadius: 32,
    shadowColor: colors.heroBottom,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.24,
    shadowRadius: 20,
    elevation: 8,
  },
  logoBadge: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  appName: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  tagline: {
    color: "rgba(255,255,255,0.85)",
    fontSize: FontSize.lg,
    fontWeight: FontWeight.regular,
    lineHeight: 20,
    textAlign: "center",
    marginTop: Spacing.xs,
  },
  formCard: {
    backgroundColor: colors.surface,
    marginTop: -Spacing["4xl"],
    marginHorizontal: Spacing.xl,
    borderRadius: Radius.xl,
    borderWidth: BorderWidth.thin,
    borderColor: colors.border,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing["2xl"],
    paddingBottom: Spacing.xl,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  header: {
    gap: Spacing.xs,
    marginBottom: Spacing["2xl"],
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: FontWeight.bold,
    lineHeight: 28,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
    lineHeight: 20,
  },
  form: {
    gap: Spacing.xl,
  },
  inputBlock: {
    gap: Spacing.sm,
  },
  inputLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radius.md,
    borderWidth: BorderWidth.thin,
    paddingHorizontal: Spacing.md,
    minHeight: 68,
    backgroundColor: colors.surface,
  },
  inputIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  inputText: {
    flex: 1,
    fontSize: FontSize.lg,
    color: colors.textPrimary,
    padding: 0,
  },
  rightIconButton: {
    width: 34,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: colors.danger,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  forgotButton: {
    alignSelf: "flex-end",
    marginTop: -Spacing.xs,
  },
  forgotText: {
    color: colors.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  signInButton: {
    marginTop: Spacing["3xl"],
    shadowColor: colors.primaryDeep,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  signInGradient: {
    minHeight: 64,
    borderRadius: Radius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  signInText: {
    color: colors.onPrimary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  orRow: {
    marginTop: Spacing["2xl"],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
  orLine: {
    width: 48,
    height: 1,
    backgroundColor: colors.border,
  },
  orText: {
    color: colors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    letterSpacing: 1,
  },
  registerRow: {
    marginTop: Spacing.lg,
    textAlign: "center",
    fontSize: FontSize.md,
    lineHeight: 20,
    color: colors.textMuted,
  },
  registerMuted: {
    color: colors.textMuted,
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
  },
  registerAction: {
    color: colors.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
});
