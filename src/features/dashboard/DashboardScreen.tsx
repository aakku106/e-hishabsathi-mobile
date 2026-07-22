import { SafeAreaView, StyleSheet } from "react-native";

import { Colors_DashboardPage } from "@/shared/constants/colors";
import DashboardOverview from "./components/DashboardOverview";

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <DashboardOverview />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors_DashboardPage.background,
  },
});
