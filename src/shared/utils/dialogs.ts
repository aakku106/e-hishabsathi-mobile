import { Alert, Platform } from "react-native";

type ConfirmActionOptions = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** Renders the confirm button as destructive on iOS. */
  destructive?: boolean;
  onConfirm: () => void;
};

/**
 * Cross-platform confirmation dialog.
 *
 * `Alert.alert()` is an empty implementation on react-native-web, so browser
 * builds use the native `window.confirm()` dialog instead. The mutation must
 * stay behind the affirmative branch on every platform.
 */
export function confirmAction({
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
}: ConfirmActionOptions): void {
  if (Platform.OS === "web") {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }

  Alert.alert(title, message, [
    { text: cancelLabel, style: "cancel" },
    {
      text: confirmLabel,
      style: destructive ? "destructive" : "default",
      onPress: onConfirm,
    },
  ]);
}

/**
 * Cross-platform information/error dialog. Uses `window.alert()` on web for the
 * same reason as `confirmAction()`.
 */
export function notify(title: string, message: string): void {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
    return;
  }

  Alert.alert(title, message);
}
