import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AnimatedStarfield from "./AnimatedStarfield";
import Colors from "@/constants/colors";

interface CosmicBackgroundProps {
  starCount?: number;
  variant?: "default" | "login" | "sheet";
}

function CosmicBackground({
  starCount = 80,
  variant = "default",
}: CosmicBackgroundProps) {
  return (
    <View style={styles.container} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.dark.background }]} />

      <LinearGradient
        colors={[
          "rgba(55, 0, 100, 0.35)",
          "rgba(11, 14, 26, 0.1)",
          "rgba(0, 40, 80, 0.25)",
        ]}
        locations={[0, 0.5, 1]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {variant === "login" && (
        <LinearGradient
          colors={[
            "rgba(99, 102, 241, 0.12)",
            "rgba(11, 14, 26, 0)",
            "rgba(0, 180, 180, 0.08)",
          ]}
          locations={[0, 0.4, 1]}
          start={{ x: 0.8, y: 0.1 }}
          end={{ x: 0.2, y: 0.9 }}
          style={StyleSheet.absoluteFill}
        />
      )}

      {variant === "sheet" && (
        <LinearGradient
          colors={[
            "rgba(124, 106, 250, 0.08)",
            "rgba(19, 23, 41, 0.95)",
          ]}
          locations={[0, 0.6]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}

      <LinearGradient
        colors={[
          "rgba(80, 20, 120, 0.15)",
          "transparent",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.5 }}
        style={[StyleSheet.absoluteFill, { opacity: 0.6 }]}
      />

      <LinearGradient
        colors={[
          "transparent",
          "rgba(0, 60, 100, 0.12)",
        ]}
        start={{ x: 1, y: 0.3 }}
        end={{ x: 0, y: 1 }}
        style={[StyleSheet.absoluteFill, { opacity: 0.5 }]}
      />

      <AnimatedStarfield starCount={starCount} />
    </View>
  );
}

export default React.memo(CosmicBackground);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
});
