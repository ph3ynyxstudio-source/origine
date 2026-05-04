import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { useTranslation } from "@/lib/i18n";
import Colors from "@/constants/colors";

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  home: "planet-outline",
  calendar: "calendar-outline",
  stats: "bar-chart-outline",
};

const TAB_ICONS_ACTIVE: Record<string, keyof typeof Ionicons.glyphMap> = {
  home: "planet",
  calendar: "calendar",
  stats: "bar-chart",
};

function GhostTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const tabLabels: Record<string, string> = {
    home: t("home"),
    calendar: t("calendar"),
    stats: t("statistics"),
  };

  return (
    <View style={[styles.tabBarWrapper, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <BlurView intensity={25} tint="dark" style={styles.blurContainer}>
        <View style={styles.tabBarInner}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const routeName = route.name;
            const icon = isFocused
              ? TAB_ICONS_ACTIVE[routeName] || "ellipse"
              : TAB_ICONS[routeName] || "ellipse-outline";

            const onPress = () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                style={styles.tabButton}
              >
                <View style={[styles.iconContainer, isFocused && styles.iconContainerActive]}>
                  <Ionicons
                    name={icon}
                    size={22}
                    color={isFocused ? Colors.dark.primary : Colors.dark.textMuted}
                    style={isFocused ? styles.iconGlow : undefined}
                  />
                </View>
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <GhostTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="calendar" />
      <Tabs.Screen name="stats" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  blurContainer: {
    marginHorizontal: 48,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "rgba(34, 211, 238, 0.14)",
  },
  tabBarInner: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "rgba(8, 5, 32, 0.82)",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainerActive: {
    backgroundColor: "rgba(34, 211, 238, 0.10)",
  },
  iconGlow: {
    textShadowColor: "rgba(34, 211, 238, 0.7)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
});
