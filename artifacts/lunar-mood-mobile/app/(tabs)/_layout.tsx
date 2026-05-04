import React from "react";
import { View, Pressable, StyleSheet, Text } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { useTranslation } from "@/lib/i18n";
import { Colors } from "@/constants/colors";

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  home: "home-outline",
  calendar: "calendar-outline",
  stats: "sparkles-outline",
};

const TAB_ICONS_ACTIVE: Record<string, keyof typeof Ionicons.glyphMap> = {
  home: "home",
  calendar: "calendar",
  stats: "sparkles",
};

function GhostTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { language } = useTranslation();

  const tabLabels: Record<string, string> = {
    home: language === "fr" ? "ACCUEIL" : "HOME",
    calendar: language === "fr" ? "CALENDRIER" : "CALENDAR",
    stats: "INSIGHTS",
  };

  return (
    <View
      style={[
        styles.tabBarWrapper,
        { paddingBottom: Math.max(insets.bottom, 8) },
      ]}>
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
                style={styles.tabButton}>
                <View
                  style={[
                    styles.iconContainer,
                    isFocused && styles.iconContainerActive,
                  ]}>
                  <Ionicons
                    name={icon}
                    size={24}
                    color={isFocused ? Colors.dark.cyan : Colors.dark.textMuted}
                    style={isFocused ? styles.iconGlow : undefined}
                  />
                </View>
                <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                  {tabLabels[routeName] ?? routeName.toUpperCase()}
                </Text>
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
      }}>
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
    marginHorizontal: 24,
    borderRadius: 30,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(34, 211, 238, 0.18)",
  },
  tabBarInner: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "rgba(6, 8, 26, 0.9)",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    gap: 4,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainerActive: {
    backgroundColor: "rgba(34, 211, 238, 0.12)",
  },
  iconGlow: {
    textShadowColor: "rgba(34, 211, 238, 0.7)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  tabLabel: {
    color: Colors.dark.textMuted,
    fontSize: 10,
    letterSpacing: 1.4,
    fontFamily: "Inter_500Medium",
  },
  tabLabelActive: {
    color: Colors.dark.cyan,
  },
});
