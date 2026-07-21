import { StyleSheet, Text, View } from "react-native";

export default function InventoryRoute() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Inventory</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  text: { fontSize: 20 },
});
