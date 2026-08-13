import { useEffect, useState } from "react";
import { Keyboard, KeyboardEvent } from "react-native";

export function useKeyboard() {
  const [isVisible, setIsVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showListener = Keyboard.addListener(
      "keyboardDidShow",
      (event: KeyboardEvent) => {
        setIsVisible(true);
        setKeyboardHeight(event.endCoordinates.height);
      },
    );
    const hideListener = Keyboard.addListener("keyboardDidHide", () => {
      setIsVisible(false);
      setKeyboardHeight(0);
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  return { isVisible, keyboardHeight };
}
