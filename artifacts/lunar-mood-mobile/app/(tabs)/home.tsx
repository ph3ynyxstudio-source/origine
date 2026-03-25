import React, { useMemo, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/contexts/AuthContext";
import { useMoods } from "@/contexts/MoodContext";
import { getLunarPhase } from "@/lib/lunar";
import { useTranslation, getPhaseTranslationKey } from "@/lib/i18n";
import Colors from "@/constants/colors";
import CosmicBackground from "@/components/CosmicBackground";
import GlowingMoon from "@/components/GlowingMoon";
import SwipeableTabView from "@/components/SwipeableTabView";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { moods } = useMoods();
  const { t } = useTranslation();

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login");
    }
  }, [user, isAuthLoading]);

  const todayPhase = useMemo(() => {
    return getLunarPhase(new Date());
  }, []);

  const stats = useMemo(() => {
    if (!moods.length) return { avgMood: 0, avgEnergy: 0, avgConsumption: 0, count: 0 };
    const totalMood = moods.reduce((sum, m) => sum + m.mood, 0);
    const totalEnergy = moods.reduce((sum, m) => sum + (m.energy || 0), 0);
    const totalConsumption = moods.reduce((sum, m) => sum + (m.consumption || 0), 0);
    return {
      avgMood: Math.round((totalMood / moods.length) * 10) / 10,
      avgEnergy: Math.round(totalEnergy / moods.length),
      avgConsumption: Math.round((totalConsumption / moods.length) * 10) / 10,
      count: moods.length,
    };
  }, [moods]);

  if (isAuthLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <CosmicBackground starCount={60} />
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    );
  }

  if (!user) return null;

  return (
    <SwipeableTabView>
    <View style={styles.container}>
      <CosmicBackground starCount={80} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <View style={{ width: 40 }} />
          <View style={{ flex: 1 }} />
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/settings");
            }}
            style={styles.settingsButton}
          >
            <Ionicons name="settings-outline" size={22} color={Colors.dark.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.profileSection}>
          <GlowingMoon size={72} iconSize={40} />
          <Text style={styles.greeting}>{t("hello")}, {user.username}</Text>
          {todayPhase && (
            <View style={styles.phaseRow}>
              <Text style={styles.phaseEmoji}>{todayPhase.emoji}</Text>
              <Text style={styles.phaseText}>{t(getPhaseTranslationKey(todayPhase.phase))}</Text>
            </View>
          )}
        </View>

        {stats.count > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.count}</Text>
              <Text style={styles.statLabel}>{t("entries")}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.avgMood}</Text>
              <Text style={styles.statLabel}>{t("emotion")}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.avgEnergy}%</Text>
              <Text style={styles.statLabel}>{t("energy")}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
    </SwipeableTabView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(19, 23, 41, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(37, 43, 69, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  greeting: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: Colors.dark.text,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  phaseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  phaseEmoji: {
    fontSize: 18,
    textShadowColor: Colors.dark.moon,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  phaseText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.dark.textSecondary,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(19, 23, 41, 0.55)",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(37, 43, 69, 0.6)",
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.dark.text,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.dark.textSecondary,
    marginTop: 4,
  },
});
