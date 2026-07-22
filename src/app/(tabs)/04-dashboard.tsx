import { Colors_DashboardPage } from "@/shared/constants/colors";
import { FontWeight } from "@/shared/constants/typography";
import { StyleSheet, Text, View } from "react-native";

export default function DashboardRoute() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Dashboard</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors_DashboardPage.background,
  },
  text: {
    fontSize: 20,
    fontWeight: FontWeight.semibold,
    color: Colors_DashboardPage.textPrimary,
  },
});
