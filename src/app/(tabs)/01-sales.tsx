import SalesButton from "@/shared/components/Button/TopButton";
import { StyleSheet, Text, View } from "react-native";

export default function SalesRoute() {
  return (
    <View style={styles.container}>
      <SalesButton></SalesButton>
      <Text style={styles.text}>Sales</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", backgroundColor: "red", justifyContent: "center" },
  text: { fontSize: 20 },
});
