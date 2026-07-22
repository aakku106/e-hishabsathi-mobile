import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import LabeledInput from "@/shared/components/Input/LabledInput";
import { Colors_LoginPage } from "@/shared/constants/colors";
import { BorderWidth, Radius } from "@/shared/constants/radius";
import { Spacing } from "@/shared/constants/spacing";
import { FontSize, FontWeight } from "@/shared/constants/typography";

export default function LoginScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back!!</Text>
          <Text style={styles.subtitle}>Please Login your Account</Text>
        </View>

        <View style={styles.form}>
          <LabeledInput
            label="PAN"
            placeholder="Enter Your PAN number"
            labelColor={Colors_LoginPage.primaryText}
            inputBgColor={Colors_LoginPage.primaryBg}
            borderColor="#B8B8B8"
            placeholderColor="#888888"
            containerStyle={styles.inputBlock}
            labelStyle={styles.inputLabel}
            inputStyle={styles.inputText}
            inputContainerStyle={styles.inputContainer}
          />

          <LabeledInput
            label="User Name"
            placeholder="Enter Your User Name"
            labelColor={Colors_LoginPage.primaryText}
            inputBgColor={Colors_LoginPage.primaryBg}
            borderColor="#B8B8B8"
            placeholderColor="#888888"
            containerStyle={styles.inputBlock}
            labelStyle={styles.inputLabel}
            inputStyle={styles.inputText}
            inputContainerStyle={styles.inputContainer}
          />

          <LabeledInput
            label="Password"
            placeholder="Enter Your Password"
            secureTextEntry
            labelColor={Colors_LoginPage.primaryText}
            inputBgColor={Colors_LoginPage.primaryBg}
            borderColor="#B8B8B8"
            placeholderColor="#888888"
            containerStyle={styles.inputBlock}
            labelStyle={styles.inputLabel}
            inputStyle={styles.inputText}
            inputContainerStyle={styles.inputContainer}
          />

          <TouchableOpacity activeOpacity={0.8} style={styles.forgotButton}>
            <Text style={styles.forgotText}>Forgot Password</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity activeOpacity={0.85} style={styles.signInButton}>
          <Text style={styles.signInText}>Sign in</Text>
        </TouchableOpacity>

        <View style={styles.orRow}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.orLine} />
        </View>

        <Text style={styles.registerRow}>
          <Text style={styles.registerMuted}>Didn’t have an Account!? </Text>
          <Text style={styles.registerAction}>Register With Us</Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors_LoginPage.primaryBg,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing["2xl"],
    paddingBottom: Spacing["2xl"],
  },
  header: {
    gap: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  title: {
    color: Colors_LoginPage.primaryText,
    fontSize: 24,
    fontWeight: FontWeight.bold,
    lineHeight: 30,
  },
  subtitle: {
    color: Colors_LoginPage.ternaryText,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    lineHeight: 20,
  },
  form: {
    gap: Spacing.lg,
  },
  inputBlock: {
    gap: Spacing.sm,
  },
  inputLabel: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    lineHeight: 20,
  },
  inputContainer: {
    borderRadius: Radius.xl,
    borderWidth: BorderWidth.thin,
    shadowOpacity: 0,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
    elevation: 0,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minHeight: 54,
  },
  inputText: {
    fontSize: FontSize.md,
    color: Colors_LoginPage.primaryText,
  },
  forgotButton: {
    alignSelf: "flex-end",
    marginTop: -Spacing.xs,
  },
  forgotText: {
    color: Colors_LoginPage.primaryText,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  signInButton: {
    marginTop: Spacing["4xl"],
    backgroundColor: Colors_LoginPage.signInBtn,
    borderRadius: 16,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  signInText: {
    color: Colors_LoginPage.primaryBg,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  orRow: {
    marginTop: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  orLine: {
    width: 32,
    height: 1,
    backgroundColor: "#D4D4D4",
  },
  orText: {
    color: "#B3B3B3",
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    letterSpacing: 1,
  },
  registerRow: {
    marginTop: Spacing.md,
    textAlign: "center",
    fontSize: FontSize.sm,
    lineHeight: 18,
    color: Colors_LoginPage.ternaryText,
  },
  registerMuted: {
    color: Colors_LoginPage.ternaryText,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
  },
  registerAction: {
    color: Colors_LoginPage.primaryText,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
});
