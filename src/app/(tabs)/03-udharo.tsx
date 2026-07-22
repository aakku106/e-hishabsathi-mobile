import UdharoScreen from "@/features/udharo/UdharoScreen";
import { Colors_UdharoPage } from "@/shared/constants/colors";
import { FontWeight } from "@/shared/constants/typography";
import { StyleSheet, Text, View } from "react-native";

export default function UdharoRoute() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Udharo</Text>
      <UdharoScreen/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors_UdharoPage.background,
  },
  text: {
    fontSize: 20,
    fontWeight: FontWeight.semibold,
    color: Colors_UdharoPage.textSecondary,
  },
});
