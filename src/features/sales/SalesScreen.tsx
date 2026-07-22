import { SafeAreaView, StyleSheet } from "react-native";

import { Colors_SalesPage } from "@/shared/constants/colors";
import SalesEntryForm from "./components/SalesEntryForm";

export default function SalesScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <SalesEntryForm />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors_SalesPage.background,
  },
});
