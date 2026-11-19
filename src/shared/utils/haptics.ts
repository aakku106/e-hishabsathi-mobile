import * as Haptics from "expo-haptics";

/**
 * Shared haptic feedback helpers.
 *
 * Every helper is fire-and-forget: haptics are a progressive enhancement, so a
 * rejected promise (unsupported device, browser without the Vibration API) is
 * swallowed and never interrupts the user flow. On web, `expo-haptics` uses
 * `navigator.vibrate` when available and is a no-op elsewhere.
 */

function run(feedback: () => Promise<void>) {
  void feedback().catch(() => {
    // Ignore: haptics must never break a write, validation, or navigation.
  });
}

/** Light tick for selections, tab switches, and stepper taps. */
export function hapticSelection() {
  run(() => Haptics.selectionAsync());
}

/** Confirmation buzz after a successful write. */
export function hapticSuccess() {
  run(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  );
}

/** Warning buzz for a risky action that still completed. */
export function hapticWarning() {
  run(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  );
}

/** Error buzz for validation failures and failed writes. */
export function hapticError() {
  run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
}

/** Short impact for lightweight feedback, e.g. a stock +/- tap. */
export function hapticImpact(
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light,
) {
  run(() => Haptics.impactAsync(style));
}

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Strong, patterned vibration for destructive confirmations (logout and
 * delete-all-data): a warning pulse followed by two heavy impacts.
 */
export function hapticDestructive() {
  run(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await wait(90);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await wait(80);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  });
}
