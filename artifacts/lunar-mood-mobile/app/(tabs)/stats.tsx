import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BarChart, LineChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { useMoods, type MoodEntry } from "@/contexts/MoodContext";
import { useTranslation, getPhaseTranslationKey } from "@/lib/i18n";
import { Colors } from "@/constants/colors";
import CosmicBackground from "@/components/CosmicBackground";
import SwipeableTabView from "@/components/SwipeableTabView";

interface PhaseStat {
  phase: string;
  avgMood: number;
  avgEnergy: number;
  avgConsumption: number;
  count: number;
}

interface MonthTrend {
  month: string;
  avgMood: number;
  avgEnergy: number;
  avgConsumption: number;
  count: number;
}

interface StatsData {
  byPhase: PhaseStat[];
  monthlyTrends: MonthTrend[];
  totalEntries: number;
}

const PHASE_EMOJIS: Record<string, string> = {
  new_moon: "\uD83C\uDF11",
  waxing_crescent: "\uD83C\uDF12",
  first_quarter: "\uD83C\uDF13",
  waxing_gibbous: "\uD83C\uDF14",
  full_moon: "\uD83C\uDF15",
  waning_gibbous: "\uD83C\uDF16",
  last_quarter: "\uD83C\uDF17",
  waning_crescent: "\uD83C\uDF18",
};

const PHASE_ORDER = [
  "new_moon",
  "waxing_crescent",
  "first_quarter",
  "waxing_gibbous",
  "full_moon",
  "waning_gibbous",
  "last_quarter",
  "waning_crescent",
];

function average(entries: MoodEntry[], key: "mood" | "energy" | "consumption"): number {
  if (!entries.length) return 0;
  const total = entries.reduce((sum, entry) => sum + entry[key], 0);
  return Math.round((total / entries.length) * 10) / 10;
}

function buildLocalStats(entries: MoodEntry[]): StatsData {
  const byPhase = PHASE_ORDER.map((phase) => {
    const phaseEntries = entries.filter((entry) => entry.lunarPhase === phase);
    return {
      phase,
      avgMood: average(phaseEntries, "mood"),
      avgEnergy: average(phaseEntries, "energy"),
      avgConsumption: average(phaseEntries, "consumption"),
      count: phaseEntries.length,
    };
  });

  const monthlyGroups = entries.reduce<Record<string, MoodEntry[]>>((groups, entry) => {
    const month = entry.date.slice(0, 7);
    groups[month] = [...(groups[month] || []), entry];
    return groups;
  }, {});

  const monthlyTrends = Object.entries(monthlyGroups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, monthEntries]) => ({
      month,
      avgMood: average(monthEntries, "mood"),
      avgEnergy: average(monthEntries, "energy"),
      avgConsumption: average(monthEntries, "consumption"),
      count: monthEntries.length,
    }));

  return {
    byPhase,
    monthlyTrends,
    totalEntries: entries.length,
  };
}

const CHART_CONFIG = {
  backgroundGradientFrom: "rgba(19, 23, 41, 0.01)",
  backgroundGradientTo: "rgba(19, 23, 41, 0.01)",
  backgroundGradientFromOpacity: 0,
  backgroundGradientToOpacity: 0,
  color: (opacity = 1) => `rgba(155, 139, 255, ${opacity})`,
  labelColor: () => Colors.dark.textSecondary,
  propsForBackgroundLines: {
    stroke: "rgba(37, 43, 69, 0.4)",
    strokeDasharray: "",
  },
  barPercentage: 0.5,
  decimalPlaces: 1,
  propsForLabels: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },
};

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { isLoading: isAuthLoading } = useAuth();
  const { moods, fetchMoods } = useMoods();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const screenWidth = Dimensions.get("window").width - 64;
  const stats = useMemo(() => buildLocalStats(moods), [moods]);

  useEffect(() => {
    fetchMoods(new Date().getMonth() + 1, new Date().getFullYear());
  }, [fetchMoods]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMoods(new Date().getMonth() + 1, new Date().getFullYear());
    setRefreshing(false);
  }, [fetchMoods]);

  const phaseLabels = useMemo(() => {
    if (!stats) return [];
    return stats.byPhase.map((p) => PHASE_EMOJIS[p.phase] || "");
  }, [stats]);

  const hasData = stats.totalEntries > 0;
  const phasesWithData = stats.byPhase.filter((p) => p.count > 0);

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
      <CosmicBackground starCount={80} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 16,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.dark.primary}
          />
        }
      >
        <View style={styles.headerRow}>
          <Ionicons name="bar-chart" size={22} color={Colors.dark.primaryLight} />
          <Text style={styles.headerTitle}>{t("lunarInfluence")}</Text>
        </View>

        {!hasData ? (
          <View style={styles.emptyState}>
            <Ionicons name="moon-outline" size={64} color={Colors.dark.textMuted} />
            <Text style={styles.emptyTitle}>{t("noDataYet")}</Text>
            <Text style={styles.emptyMessage}>{t("noDataMessage")}</Text>
          </View>
        ) : (
          <>
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>{t("emotionByPhase")}</Text>
              <Text style={styles.chartSubtitle}>{t("avg")} 1-5</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                  data={{
                    labels: phaseLabels,
                    datasets: [{ data: stats!.byPhase.map((p) => p.avgMood || 0) }],
                  }}
                  width={Math.max(screenWidth, phaseLabels.length * 50)}
                  height={180}
                  yAxisLabel=""
                  yAxisSuffix=""
                  chartConfig={{
                    ...CHART_CONFIG,
                    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
                  }}
                  fromZero
                  showValuesOnTopOfBars
                  style={styles.chart}
                />
              </ScrollView>
              <View style={styles.phaseLegend}>
                {phasesWithData.map((p) => (
                  <View key={p.phase} style={styles.phaseLegendItem}>
                    <Text style={styles.phaseLegendEmoji}>{PHASE_EMOJIS[p.phase]}</Text>
                    <Text style={styles.phaseLegendValue}>{p.avgMood}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>{t("energyByPhase")}</Text>
              <Text style={styles.chartSubtitle}>{t("avg")} 0-100%</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                  data={{
                    labels: phaseLabels,
                    datasets: [{ data: stats!.byPhase.map((p) => p.avgEnergy || 0) }],
                  }}
                  width={Math.max(screenWidth, phaseLabels.length * 50)}
                  height={180}
                  yAxisLabel=""
                  yAxisSuffix="%"
                  chartConfig={{
                    ...CHART_CONFIG,
                    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                  }}
                  fromZero
                  showValuesOnTopOfBars
                  style={styles.chart}
                />
              </ScrollView>
            </View>

            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>{t("consumptionByPhase")}</Text>
              <Text style={styles.chartSubtitle}>{t("avg")} 0-5</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                  data={{
                    labels: phaseLabels,
                    datasets: [{ data: stats!.byPhase.map((p) => p.avgConsumption || 0) }],
                  }}
                  width={Math.max(screenWidth, phaseLabels.length * 50)}
                  height={180}
                  yAxisLabel=""
                  yAxisSuffix=""
                  chartConfig={{
                    ...CHART_CONFIG,
                    color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
                  }}
                  fromZero
                  showValuesOnTopOfBars
                  style={styles.chart}
                />
              </ScrollView>
            </View>

            {stats!.monthlyTrends.length > 1 && (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>{t("monthlyTrends")}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <LineChart
                    data={{
                      labels: stats!.monthlyTrends.map((m) => m.month.substring(5)),
                      datasets: [
                        {
                          data: stats!.monthlyTrends.map((m) => m.avgMood || 0),
                          color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
                          strokeWidth: 2,
                        },
                        {
                          data: stats!.monthlyTrends.map((m) => (m.avgEnergy || 0) / 20),
                          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                          strokeWidth: 2,
                        },
                        {
                          data: stats!.monthlyTrends.map((m) => m.avgConsumption || 0),
                          color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
                          strokeWidth: 2,
                        },
                      ],
                      legend: [t("emotion"), t("energy") + " /5", t("consumption")],
                    }}
                    width={Math.max(screenWidth, stats!.monthlyTrends.length * 70)}
                    height={220}
                    chartConfig={{
                      ...CHART_CONFIG,
                      color: (opacity = 1) => `rgba(155, 139, 255, ${opacity})`,
                    }}
                    bezier
                    style={styles.chart}
                  />
                </ScrollView>
              </View>
            )}
          </>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.dark.text,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    color: Colors.dark.text,
  },
  emptyMessage: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.dark.textMuted,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  chartCard: {
    backgroundColor: "rgba(19, 23, 41, 0.5)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(37, 43, 69, 0.6)",
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.dark.text,
    marginBottom: 2,
  },
  chartSubtitle: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.dark.textMuted,
    marginBottom: 12,
  },
  chart: {
    borderRadius: 12,
    marginLeft: -16,
  },
  phaseLegend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
    justifyContent: "center",
  },
  phaseLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  phaseLegendEmoji: {
    fontSize: 14,
  },
  phaseLegendValue: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.dark.textSecondary,
  },
});
