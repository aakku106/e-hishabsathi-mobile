import { Colors_SettingsPage } from "@/shared/constants/colors";
import { FontWeight } from "@/shared/constants/typography";
import { StyleSheet, Text, View } from "react-native";

export default function SettingsRoute() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Settings</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors_SettingsPage.background,
  },
  text: {
    fontSize: 20,
    fontWeight: FontWeight.semibold,
    color: Colors_SettingsPage.textPrimary,
  },
});
