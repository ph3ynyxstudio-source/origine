import React, { useEffect, useRef, useMemo } from "react";
import { View, StyleSheet, Animated, Platform } from "react-native";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  delay: number;
}

interface AnimatedStarfieldProps {
  starCount?: number;
  maxSize?: number;
}

function generateStars(count: number, maxSize: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * maxSize + 0.5,
      opacity: Math.random() * 0.6 + 0.2,
      twinkleSpeed: Math.random() * 3000 + 2000,
      delay: Math.random() * 3000,
    });
  }
  return stars;
}

const TwinklingStar = React.memo(({ star }: { star: Star }) => {
  const animValue = useRef(new Animated.Value(star.opacity)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(star.delay),
        Animated.timing(animValue, {
          toValue: Math.max(star.opacity * 0.2, 0.05),
          duration: star.twinkleSpeed,
          useNativeDriver: true,
        }),
        Animated.timing(animValue, {
          toValue: star.opacity,
          duration: star.twinkleSpeed,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: `${star.x}%`,
          top: `${star.y}%`,
          width: star.size,
          height: star.size,
          borderRadius: star.size / 2,
          opacity: animValue,
          backgroundColor: star.size > 2 ? "#C8D0FF" : "#FFFFFF",
          ...(star.size > 2.5
            ? {
                shadowColor: "#9BB0FF",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: star.size,
              }
            : {}),
        },
      ]}
    />
  );
});

const StaticStar = React.memo(({ star }: { star: Star }) => (
  <View
    style={[
      styles.star,
      {
        left: `${star.x}%`,
        top: `${star.y}%`,
        width: star.size,
        height: star.size,
        borderRadius: star.size / 2,
        opacity: star.opacity,
        backgroundColor: "#FFFFFF",
      },
    ]}
  />
));

function AnimatedStarfield({
  starCount = 80,
  maxSize = 3,
}: AnimatedStarfieldProps) {
  const twinklingCount = Platform.OS === "web" ? Math.min(starCount, 25) : Math.min(starCount, 35);
  const staticCount = Math.max(0, starCount - twinklingCount);

  const twinklingStars = useMemo(() => generateStars(twinklingCount, maxSize), [twinklingCount, maxSize]);
  const staticStars = useMemo(() => generateStars(staticCount, maxSize * 0.6), [staticCount, maxSize]);

  return (
    <View style={styles.container} pointerEvents="none">
      {staticStars.map((star, i) => (
        <StaticStar key={`s-${i}`} star={star} />
      ))}
      {twinklingStars.map((star, i) => (
        <TwinklingStar key={`t-${i}`} star={star} />
      ))}
    </View>
  );
}

export default React.memo(AnimatedStarfield);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  star: {
    position: "absolute",
  },
});
