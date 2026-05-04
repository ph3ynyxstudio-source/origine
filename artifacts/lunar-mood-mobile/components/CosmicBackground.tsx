import React from "react";
import { ImageBackground, View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AnimatedStarfield from "./AnimatedStarfield";
import Colors from "@/constants/colors";

const appBackground = require("../assets/images/backgrounds/app-background.webp");

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
      <ImageBackground
        source={appBackground}
        resizeMode="cover"
        style={StyleSheet.absoluteFill}
        imageStyle={styles.backgroundImage}
      />

      <LinearGradient
        colors={[
          "rgba(0, 0, 0, 0.24)",
          "rgba(0, 0, 0, 0.08)",
          "rgba(0, 0, 0, 0.34)",
        ]}
        locations={[0, 0.5, 1]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {variant === "login" && (
        <LinearGradient
          colors={[
            "rgba(34, 211, 238, 0.12)",
            "rgba(0, 0, 0, 0)",
            "rgba(168, 85, 247, 0.12)",
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
            "rgba(34, 211, 238, 0.08)",
            "rgba(8, 5, 32, 0.95)",
          ]}
          locations={[0, 0.6]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}

      <LinearGradient
        colors={[
          "rgba(34, 211, 238, 0.09)",
          "transparent",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.5 }}
        style={[StyleSheet.absoluteFill, { opacity: 0.6 }]}
      />

      <LinearGradient
        colors={[
          "transparent",
          "rgba(168, 85, 247, 0.10)",
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
  backgroundImage: {
    opacity: 0.72,
  },
});
