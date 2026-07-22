import TopButton from "@/shared/components/Button/TopButton";
import { Colors_SalesPage } from "@/shared/constants/colors";
import { StyleSheet, Text, View } from "react-native";

export default function SalesRoute() {
  return (
    <View style={styles.container}>
      {/* <TopButton title="I want Food" />
      <Text style={styles.text}>Sales</Text> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors_SalesPage.background,
  },
  text: {
    fontSize: 20,
    color: Colors_SalesPage.textSecondary,
  },
});
