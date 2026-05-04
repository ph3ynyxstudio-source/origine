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
import SwipeableTabView from "@/components/SwipeableTabView";
import { Colors } from "@/constants/colors";
import CosmicBackground from "@/components/CosmicBackground";

function getLunarCycleDay(date: Date): number {
  const known = new Date(2000, 0, 6);
  const cycle = 29.53058867;
  const diff = (date.getTime() - known.getTime()) / (1000 * 60 * 60 * 24);
  const position = ((diff % cycle) + cycle) % cycle;

  return Math.floor(position) + 1;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { isLoading: isAuthLoading } = useAuth();
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
    [language, today],
  );

  const stats = useMemo(() => {
    if (!moods.length) {
      return { avgMood: null, avgEnergy: null, avgConsumption: null, count: 0 };
    }

    const totalMood = moods.reduce((sum, m) => sum + m.mood, 0);
    const totalEnergy = moods.reduce((sum, m) => sum + (m.energy || 0), 0);
    const totalConsumption = moods.reduce(
      (sum, m) => sum + (m.consumption || 0),
      0,
    );

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
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Pressable style={styles.circleIconButton}>
              <Ionicons name="person-outline" size={20} color={Colors.dark.text} />
            </Pressable>
            <Text style={styles.brandTitle}>LUNARMOOD</Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/settings");
              }}
              style={styles.circleIconButton}>
              <Ionicons name="notifications-outline" size={20} color={Colors.dark.text} />
              <View style={styles.notificationDot} />
            </Pressable>
          </View>

          <View style={styles.heroBlock}>
            <View style={styles.logoHaloOuter} />
            <View style={styles.logoHaloInner} />
            <Image
              source={require("../../assets/images/moons/moon_full.webp")}
              style={styles.logo}
              resizeMode="contain"
            />

            <View style={styles.phaseBlock}>
              <Text style={styles.phaseTitle}>
                {t(getPhaseTranslationKey(todayPhase.phase))}
              </Text>
              <Text style={styles.cycleText}>{t("cycleDay")} {cycleDay}</Text>
              <Text style={styles.dateLabel}>{dateLabel}</Text>
            </View>
          </View>

          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Ionicons name="sparkles" size={20} color={Colors.dark.cyan} />
              <Text style={styles.insightLabel}>Insight du jour</Text>
            </View>
            <Text style={styles.insightText}>
              {stats.count > 0
                ? `${t("lunarInfluence")} · ${t(getPhaseTranslationKey(todayPhase.phase))}`
                : t("noDataMessage")}
            </Text>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Humeur</Text>
              <Text style={[styles.metricValue, styles.metricPrimary]}>
                {stats.avgMood ?? "--"}%
              </Text>
              <Text style={styles.metricSub}>{stats.avgMood && stats.avgMood >= 70 ? "HARMONIEUSE" : "EN ÉVOLUTION"}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Énergie</Text>
              <Text style={[styles.metricValue, styles.metricSecondary]}>
                {stats.avgEnergy ?? "--"}%
              </Text>
              <Text style={styles.metricSub}>{stats.avgEnergy && stats.avgEnergy >= 60 ? "STABLE" : "VARIABLE"}</Text>
            </View>
          </View>

          <Pressable
            onPress={() => router.push("/calendar")}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
            ]}>
            <LinearGradient
              colors={[Colors.dark.cyan, Colors.dark.violet, Colors.dark.magenta]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.primaryButtonGradient}>
              <Text style={styles.primaryButtonText}>COMMENCER LE RITUEL DU SOIR</Text>
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
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  brandTitle: {
    fontSize: 34,
    letterSpacing: 8,
    color: Colors.dark.cyan,
    fontFamily: "Inter_500Medium",
  },
  circleIconButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    backgroundColor: "rgba(8, 5, 32, 0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.dark.violet,
  },
  heroBlock: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 20,
    marginBottom: 16,
  },
  logoHaloOuter: {
    position: "absolute",
    top: 56,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: "rgba(34, 211, 238, 0.06)",
    shadowColor: Colors.dark.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 56,
  },
  logoHaloInner: {
    position: "absolute",
    top: 82,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(168, 85, 247, 0.08)",
    shadowColor: Colors.dark.violet,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.32,
    shadowRadius: 40,
  },
  logo: {
    width: 330,
    height: 330,
  },
  phaseBlock: {
    alignItems: "center",
    marginTop: -18,
  },
  phaseTitle: {
    color: Colors.dark.text,
    fontFamily: "Inter_700Bold",
    fontSize: 58,
    marginTop: 8,
    textAlign: "center",
    textShadowColor: "rgba(168, 85, 247, 0.35)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 22,
  },
  cycleText: {
    color: Colors.dark.violet,
    textTransform: "uppercase",
    letterSpacing: 4,
    fontSize: 30,
    fontFamily: "Inter_500Medium",
  },
  dateLabel: {
    color: Colors.dark.textSecondary,
    fontFamily: "Inter_400Regular",
    fontSize: 18,
    marginTop: 8,
    textTransform: "capitalize",
  },
  metricsGrid: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    minHeight: 170,
    justifyContent: "space-between",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    backgroundColor: "rgba(8, 5, 32, 0.76)",
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
    fontSize: 82,
    lineHeight: 90,
  },
  metricPrimary: {
    color: Colors.dark.primary,
  },
  metricSecondary: {
    color: Colors.dark.violet,
  },
  metricSub: {
    fontFamily: "Inter_500Medium",
    color: Colors.dark.violet,
    letterSpacing: 2.5,
    fontSize: 14,
  },
  insightCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    backgroundColor: "rgba(8, 5, 32, 0.72)",
    padding: 24,
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
    fontSize: 20,
    lineHeight: 34,
  },
  primaryButton: {
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: Colors.dark.violet,
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
    minHeight: 78,
    paddingHorizontal: 22,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 30,
    letterSpacing: 3,
  },
});
