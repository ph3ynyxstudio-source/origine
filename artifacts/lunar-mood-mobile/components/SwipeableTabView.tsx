import React, { useCallback, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { router, useSegments } from "expo-router";
import * as Haptics from "expo-haptics";

const TAB_ORDER = ["home", "calendar", "stats"] as const;
const SWIPE_THRESHOLD = 50;
const VELOCITY_THRESHOLD = 400;

interface SwipeableTabViewProps {
  children: React.ReactNode;
}

export default function SwipeableTabView({ children }: SwipeableTabViewProps) {
  const segments = useSegments();
  const isNavigating = useRef(false);

  const currentTabName = segments[segments.length - 1] || "home";
  const currentIndex = TAB_ORDER.indexOf(currentTabName as typeof TAB_ORDER[number]);

  const navigateToTab = useCallback(
    (direction: "left" | "right") => {
      if (isNavigating.current) return;
      const targetIndex =
        direction === "left" ? currentIndex + 1 : currentIndex - 1;
      if (targetIndex < 0 || targetIndex >= TAB_ORDER.length) return;
      isNavigating.current = true;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const targetTab = TAB_ORDER[targetIndex];
      router.navigate(`/(tabs)/${targetTab}` as const);
      setTimeout(() => {
        isNavigating.current = false;
      }, 300);
    },
    [currentIndex],
  );

  const panGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-15, 15])
    .onEnd((event) => {
      const { translationX, velocityX } = event;
      const passedThreshold = Math.abs(translationX) > SWIPE_THRESHOLD;
      const passedVelocity = Math.abs(velocityX) > VELOCITY_THRESHOLD;
      if (passedThreshold || passedVelocity) {
        if (translationX < 0) {
          navigateToTab("left");
        } else {
          navigateToTab("right");
        }
      }
    })
    .runOnJS(true);

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.container}>{children}</View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
