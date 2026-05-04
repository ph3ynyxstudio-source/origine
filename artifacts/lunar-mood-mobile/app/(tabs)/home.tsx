import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
import SwipeableTabView from "@/components/SwipeableTabView";

const appLogo = require("../../assets/images/logo/logo-ui-128.png");

function getLunarCycleDay(date: Date): number {
  const known = new Date(2000, 0, 6);
  const cycle = 29.53058867;
  const diff = (date.getTime() - known.getTime()) / (1000 * 60 * 60 * 24);
  const position = ((diff % cycle) + cycle) % cycle;

  return Math.floor(position) + 1;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { moods } = useMoods();
  const { t, language } = useTranslation();

  const today = useMemo(() => new Date(), []);
  const todayPhase = useMemo(() => getLunarPhase(today), [today]);
  const cycleDay = useMemo(() => getLunarCycleDay(today), [today]);
  const dateLabel = useMemo(
    () =>
      today.toLocaleDateString(language === "fr" ? "fr-CA" : "en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    [language, today]
  );

  const stats = useMemo(() => {
    if (!moods.length) {
      return { avgMood: null, avgEnergy: null, avgConsumption: null, count: 0 };
    }

    const totalMood = moods.reduce((sum, m) => sum + m.mood, 0);
    const totalEnergy = moods.reduce((sum, m) => sum + (m.energy || 0), 0);
    const totalConsumption = moods.reduce((sum, m) => sum + (m.consumption || 0), 0);

    return {
      avgMood: Math.round((totalMood / moods.length / 5) * 100),
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
        <CosmicBackground starCount={70} />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 112,
            paddingHorizontal: 16,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{t("hello")}</Text>
              <Text style={styles.dateLabel}>{dateLabel}</Text>
            </View>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/settings");
              }}
              style={styles.settingsButton}
            >
              <Ionicons name="settings-outline" size={20} color={Colors.dark.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.lunarCard}>
            <View style={styles.logoHalo} />
            <Image source={appLogo} style={styles.logo} resizeMode="contain" />

            <View style={styles.phaseBlock}>
              <Text style={styles.eyebrow}>{t("currentPhase")}</Text>
              <Text style={styles.phaseTitle}>
                {t(getPhaseTranslationKey(todayPhase.phase))}
              </Text>
              <View style={styles.cyclePill}>
                <Text style={styles.cycleText}>
                  {t("cycleDay")} {cycleDay}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>{t("emotion")}</Text>
              <Text style={[styles.metricValue, styles.metricPrimary]}>
                {stats.avgMood ?? "--"}%
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>{t("energy")}</Text>
              <Text style={[styles.metricValue, styles.metricSecondary]}>
                {stats.avgEnergy ?? "--"}%
              </Text>
            </View>
          </View>

          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Ionicons name="sparkles-outline" size={18} color={Colors.dark.primary} />
              <Text style={styles.insightLabel}>{t("lunarInfluence")}</Text>
            </View>
            <Text style={styles.insightText}>
              {stats.count > 0
                ? `${stats.count} ${t("entries")} · ${t(getPhaseTranslationKey(todayPhase.phase))}`
                : t("noDataMessage")}
            </Text>
          </View>

          <Pressable
            onPress={() => router.push("/calendar")}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
          >
            <LinearGradient
              colors={[Colors.dark.primary, Colors.dark.secondary]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.primaryButtonGradient}
            >
              <Text style={styles.primaryButtonText}>{t("calendar")}</Text>
            </LinearGradient>
          </Pressable>
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
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  greeting: {
    color: Colors.dark.text,
    fontFamily: "Inter_700Bold",
    fontSize: 32,
    letterSpacing: 0,
  },
  dateLabel: {
    color: Colors.dark.textSecondary,
    fontFamily: "Inter_400Regular",
    fontSize: 17,
    marginTop: 4,
    textTransform: "capitalize",
  },
  settingsButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    backgroundColor: "rgba(8, 5, 32, 0.82)",
    borderColor: Colors.dark.border,
    borderWidth: 1,
  },
  lunarCard: {
    alignItems: "center",
    overflow: "hidden",
    borderRadius: 36,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    backgroundColor: "rgba(8, 5, 32, 0.9)",
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 30,
    marginBottom: 16,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 8,
  },
  logoHalo: {
    position: "absolute",
    top: 40,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "rgba(34, 211, 238, 0.13)",
    shadowColor: Colors.dark.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 42,
  },
  logo: {
    width: 166,
    height: 166,
  },
  phaseBlock: {
    alignItems: "center",
    marginTop: 24,
  },
  eyebrow: {
    color: Colors.dark.textMuted,
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 2.5,
    textTransform: "uppercase",
  },
  phaseTitle: {
    color: Colors.dark.primary,
    fontFamily: "Inter_700Bold",
    fontSize: 34,
    marginTop: 8,
    textAlign: "center",
    textShadowColor: "rgba(34, 211, 238, 0.34)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  cyclePill: {
    marginTop: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(34, 211, 238, 0.22)",
    backgroundColor: "rgba(34, 211, 238, 0.08)",
    paddingHorizontal: 18,
    paddingVertical: 7,
  },
  cycleText: {
    color: Colors.dark.textSecondary,
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  metricsGrid: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    minHeight: 128,
    justifyContent: "space-between",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    backgroundColor: "rgba(8, 5, 32, 0.9)",
    padding: 20,
  },
  metricLabel: {
    color: Colors.dark.textSecondary,
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  metricValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 34,
  },
  metricPrimary: {
    color: Colors.dark.primary,
  },
  metricSecondary: {
    color: Colors.dark.secondary,
  },
  insightCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    backgroundColor: "rgba(8, 5, 32, 0.9)",
    padding: 22,
    marginBottom: 16,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  insightLabel: {
    color: Colors.dark.textSecondary,
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  insightText: {
    color: Colors.dark.text,
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    lineHeight: 24,
  },
  primaryButton: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.32,
    shadowRadius: 22,
    elevation: 8,
  },
  primaryButtonPressed: {
    opacity: 0.88,
  },
  primaryButtonGradient: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
    paddingHorizontal: 22,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
});
