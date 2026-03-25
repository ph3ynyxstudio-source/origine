import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

interface GlowingMoonProps {
  size?: number;
  iconSize?: number;
}

export default function GlowingMoon({ size = 96, iconSize = 52 }: GlowingMoonProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const glowSize = size * 1.6;

  return (
    <View style={[styles.container, { width: glowSize, height: glowSize }]}>
      <Animated.View
        style={[
          styles.outerGlow,
          {
            width: glowSize,
            height: glowSize,
            borderRadius: glowSize / 2,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />
      <View
        style={[
          styles.innerGlow,
          {
            width: size * 1.2,
            height: size * 1.2,
            borderRadius: (size * 1.2) / 2,
          },
        ]}
      />
      <View
        style={[
          styles.moonCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        <Ionicons name="moon" size={iconSize} color={Colors.dark.moon} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  outerGlow: {
    position: "absolute",
    backgroundColor: "rgba(240, 230, 211, 0.06)",
  },
  innerGlow: {
    position: "absolute",
    backgroundColor: "rgba(240, 230, 211, 0.1)",
    shadowColor: Colors.dark.moon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
  },
  moonCircle: {
    backgroundColor: "rgba(240, 230, 211, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.dark.moon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
});
