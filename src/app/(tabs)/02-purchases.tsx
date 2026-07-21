import { StyleSheet, Text, View } from "react-native";

export default function PurchasesRoute() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Purchases</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  text: { fontSize: 20 },
});
