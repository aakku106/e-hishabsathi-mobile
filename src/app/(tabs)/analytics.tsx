import { StyleSheet, Text, View } from "react-native";

export default function AnalyticsRoute() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Analytics</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  text: { fontSize: 20 },
});
