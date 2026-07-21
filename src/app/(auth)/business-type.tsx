import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function BusinessTypeRoute() {
	return (
		<View style={styles.container}>
			<Text style={styles.text}>Business Type</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
	text: { fontSize: 20 },
});
