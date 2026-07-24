import { SafeAreaView, StyleSheet } from "react-native";

import { Colors_UdharoPage } from "@/shared/constants/colors";
import UdharoEntryForm from "./components/UdharoEntryForm";

export default function UdharoScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <UdharoEntryForm />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors_UdharoPage.background,
  },
});
