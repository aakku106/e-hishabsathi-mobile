import type { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { hapticSelection } from "@/shared/utils/haptics";

/** Tab order, matching the `<Tabs.Screen>` order in `(tabs)/_layout.tsx`. */
export const TAB_ROUTE_ORDER = [
  "01-sales",
  "02-purchases",
  "03-udharo",
  "04-dashboard",
  "05-settings",
] as const;

export type TabRouteName = (typeof TAB_ROUTE_ORDER)[number];

/** Horizontal distance (px) that commits a page change. */
const SWIPE_DISTANCE = 56;
/** Fling speed (px/s) that commits a page change regardless of distance. */
const SWIPE_VELOCITY = 500;
/**
 * Movement (px) before the pan claims the gesture. Keeping it symmetrical with
 * `failOffsetY` means vertical scrolling wins as soon as it is unambiguous.
 */
const ACTIVATION_OFFSET = 12;

type SwipeableTabScreenProps = {
  /** Current tab route name, e.g. `"01-sales"`. */
  routeName: string;
  /** Switches to the adjacent tab; receives a route name from the tab order. */
  onNavigate: (routeName: TabRouteName) => void;
  /**
   * When false the gesture is not attached at all (the Settings toggle turns
   * this off by default on low-tier devices). Defaults to true.
   */
  enabled?: boolean;
};

/**
 * Adds horizontal swipe-to-change-tab to a tab screen.
 *
 * Apply it through the `Tabs` `screenLayout` prop so every tab screen gets the
 * same gesture. Swiping left moves to the next tab and swiping right moves to
 * the previous one; the gesture only activates on a clearly horizontal drag, so
 * vertical lists keep scrolling normally. A selection haptic fires on each
 * successful page change.
 */
export function SwipeableTabScreen({
  routeName,
  onNavigate,
  enabled = true,
  children,
}: PropsWithChildren<SwipeableTabScreenProps>) {
  const index = TAB_ROUTE_ORDER.indexOf(routeName as TabRouteName);

  const goTo = (nextIndex: number) => {
    const nextRoute = TAB_ROUTE_ORDER[nextIndex];
    if (!nextRoute) return;

    hapticSelection();
    onNavigate(nextRoute);
  };

  const gesture = Gesture.Pan()
    // Navigation and haptics are JS APIs; keep the callbacks off the UI thread.
    .runOnJS(true)
    .activeOffsetX([-ACTIVATION_OFFSET, ACTIVATION_OFFSET])
    .failOffsetY([-ACTIVATION_OFFSET, ACTIVATION_OFFSET])
    .onEnd((event) => {
      const swipedLeft =
        event.translationX <= -SWIPE_DISTANCE ||
        event.velocityX <= -SWIPE_VELOCITY;
      const swipedRight =
        event.translationX >= SWIPE_DISTANCE ||
        event.velocityX >= SWIPE_VELOCITY;

      if (swipedLeft) {
        goTo(index + 1);
      } else if (swipedRight) {
        goTo(index - 1);
      }
    });

  if (!enabled || index < 0) {
    return <>{children}</>;
  }

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.container}>{children}</View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
