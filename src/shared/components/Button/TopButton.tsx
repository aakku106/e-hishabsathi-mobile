import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  GestureResponderEvent,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface SalesButtonProps {
  onPress?: (event: GestureResponderEvent) => void;
  title?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const SalesButton: React.FC<SalesButtonProps> = ({
  onPress,
  title = 'SALES',
  style,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.button, style]}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderRadius: 9999, // Pill/stadium shape

    // Default manual colors (easy to swap later)
    backgroundColor: '#80d4b7',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',

    // Shadows & depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,

    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#000000',
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: 2,
    textAlign: 'center',
  },
});

export default SalesButton;
