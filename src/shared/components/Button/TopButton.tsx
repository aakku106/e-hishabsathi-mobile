import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  GestureResponderEvent,
} from 'react-native';

interface SalesButtonProps {
  onPress?: (event: GestureResponderEvent) => void;
  title?: string;
}

export const SalesButton: React.FC<SalesButtonProps> = ({
  onPress,
  title = 'SALES',
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={styles.button}
      >
        <Text style={styles.text}>{title}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // Outer container to demonstrate background placement
  container: {
    backgroundColor: '#38b28b', // Base background color matching the image
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderRadius: 9999, // Full pill shape (stadium border)

    // Fill color (lighter, semi-transparent teal/mint)
    backgroundColor: 'rgba(128, 212, 183, 0.85)',

    // Light top/left highlights for inner inset effect
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.45)',

    // Shadow details for depth (iOS)
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,

    // Android elevation
    elevation: 4,

    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#000000',
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: 2, // Spacing out "SALES" text
    textAlign: 'center',
  },
});

export default SalesButton;
