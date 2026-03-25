import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isSameDay,
} from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useMoods } from "@/contexts/MoodContext";
import { getMonthPhases, getMoodColor, getMoodLabel } from "@/lib/lunar";
import Colors from "@/constants/colors";
import CosmicBackground from "@/components/CosmicBackground";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MOOD_ICONS: Record<number, string> = {
  1: "sad-outline",
  2: "cloudy-outline",
  3: "ellipse-outline",
  4: "happy-outline",
  5: "star-outline",
};

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const { user, isLoading: isAuthLoading, logout } = useAuth();
  const { moods, isLoading: isMoodsLoading, fetchMoods, clearMoods } = useMoods();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const month = currentMonth.getMonth() + 1;
  const year = currentMonth.getFullYear();

  const lunarPhases = useMemo(() => getMonthPhases(year, month), [year, month]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const todayPhase = useMemo(() => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    return lunarPhases.find((p) => p.date === todayStr);
  }, [lunarPhases]);

  const stats = useMemo(() => {
    if (!moods.length) return { avg: 0, count: 0 };
    const total = moods.reduce((sum, m) => sum + m.mood, 0);
    return { avg: Math.round((total / moods.length) * 10) / 10, count: moods.length };
  }, [moods]);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login");
    }
  }, [user, isAuthLoading]);

  useEffect(() => {
    if (user) {
      fetchMoods(month, year);
    }
  }, [user, month, year, fetchMoods]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMoods(month, year);
    setRefreshing(false);
  }, [month, year, fetchMoods]);

  const handlePrevMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDayPress = (date: Date) => {
    if (!isSameMonth(date, currentMonth)) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const dateStr = format(date, "yyyy-MM-dd");
    const existing = moods.find((m) => m.date === dateStr);
    const phase = lunarPhases.find((p) => p.date === dateStr);
    router.push({
      pathname: "/mood-entry",
      params: {
        date: dateStr,
        existingId: existing?.id?.toString() || "",
        existingMood: existing?.mood?.toString() || "",
        existingNote: existing?.note || "",
        phaseEmoji: phase?.emoji || "",
        phaseLabel: phase?.label || "",
      },
    });
  };

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    clearMoods();
    await logout();
    router.replace("/login");
  };

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
    <View style={styles.container}>
      <CosmicBackground starCount={80} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16),
          paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 24),
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
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>Hello, {user.username}</Text>
            {todayPhase && (
              <View style={styles.phaseRow}>
                <Text style={styles.phaseEmoji}>{todayPhase.emoji}</Text>
                <Text style={styles.phaseText}>{todayPhase.label}</Text>
              </View>
            )}
          </View>
          <Pressable onPress={handleLogout} style={styles.logoutBtn}>
            <Feather name="log-out" size={20} color={Colors.dark.textSecondary} />
          </Pressable>
        </View>

        {stats.count > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.count}</Text>
              <Text style={styles.statLabel}>Entries</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.avg}</Text>
              <Text style={styles.statLabel}>Avg Mood</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons
                name={MOOD_ICONS[Math.round(stats.avg)] as any || "ellipse-outline"}
                size={24}
                color={getMoodColor(Math.round(stats.avg))}
              />
              <Text style={styles.statLabel}>{getMoodLabel(Math.round(stats.avg))}</Text>
            </View>
          </View>
        )}

        <View style={styles.monthNav}>
          <Pressable onPress={handlePrevMonth} style={styles.navBtn}>
            <Ionicons name="chevron-back" size={24} color={Colors.dark.text} />
          </Pressable>
          <Text style={styles.monthTitle}>
            {format(currentMonth, "MMMM yyyy")}
          </Text>
          <Pressable onPress={handleNextMonth} style={styles.navBtn}>
            <Ionicons name="chevron-forward" size={24} color={Colors.dark.text} />
          </Pressable>
        </View>

        <View style={styles.calendarCard}>
          <View style={styles.weekHeader}>
            {DAYS.map((day) => (
              <View key={day} style={styles.weekDay}>
                <Text style={styles.weekDayText}>{day}</Text>
              </View>
            ))}
          </View>

          {isMoodsLoading ? (
            <View style={styles.loadingCalendar}>
              <ActivityIndicator size="small" color={Colors.dark.primary} />
            </View>
          ) : (
            <View style={styles.daysGrid}>
              {calendarDays.map((date) => {
                const dateStr = format(date, "yyyy-MM-dd");
                const isCurrentMonth = isSameMonth(date, currentMonth);
                const today = isToday(date);
                const entry = moods.find((m) => m.date === dateStr);
                const phase = lunarPhases.find((p) => p.date === dateStr);

                return (
                  <Pressable
                    key={dateStr}
                    onPress={() => handleDayPress(date)}
                    disabled={!isCurrentMonth}
                    style={({ pressed }) => [
                      styles.dayCell,
                      !isCurrentMonth && styles.dayCellDisabled,
                      today && styles.dayCellToday,
                      pressed && isCurrentMonth && styles.dayCellPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayNumber,
                        !isCurrentMonth && styles.dayNumberDisabled,
                        today && styles.dayNumberToday,
                      ]}
                    >
                      {format(date, "d")}
                    </Text>

                    {phase && isCurrentMonth && (
                      <Text style={styles.calPhaseEmoji}>{phase.emoji}</Text>
                    )}

                    {entry && (
                      <View
                        style={[
                          styles.moodDot,
                          { backgroundColor: getMoodColor(entry.mood) },
                        ]}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>Mood Scale</Text>
          <View style={styles.legendRow}>
            {[1, 2, 3, 4, 5].map((level) => (
              <View key={level} style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: getMoodColor(level) },
                  ]}
                />
                <Text style={styles.legendLabel}>{getMoodLabel(level)}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
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
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: Colors.dark.text,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  phaseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  phaseEmoji: {
    fontSize: 16,
    textShadowColor: Colors.dark.moon,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  phaseText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.dark.textSecondary,
  },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(19, 23, 41, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(37, 43, 69, 0.6)",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(19, 23, 41, 0.55)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(37, 43, 69, 0.6)",
  },
  statValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.dark.text,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.dark.textSecondary,
    marginTop: 4,
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(19, 23, 41, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(37, 43, 69, 0.6)",
  },
  monthTitle: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    color: Colors.dark.text,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  calendarCard: {
    backgroundColor: "rgba(19, 23, 41, 0.5)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(37, 43, 69, 0.6)",
    marginBottom: 16,
  },
  weekHeader: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.dark.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  loadingCalendar: {
    height: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 0.85,
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
    borderRadius: 12,
    gap: 2,
  },
  dayCellDisabled: {
    opacity: 0.25,
  },
  dayCellToday: {
    backgroundColor: "rgba(124, 106, 250, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(124, 106, 250, 0.35)",
    shadowColor: "#7C6AFA",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  dayCellPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  dayNumber: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.dark.text,
  },
  dayNumberDisabled: {
    color: Colors.dark.textMuted,
  },
  dayNumberToday: {
    color: Colors.dark.primaryLight,
    fontFamily: "Inter_700Bold",
  },
  calPhaseEmoji: {
    fontSize: 16,
  },
  moodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  legendCard: {
    backgroundColor: "rgba(19, 23, 41, 0.55)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(37, 43, 69, 0.6)",
  },
  legendTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.dark.textSecondary,
    marginBottom: 12,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  legendItem: {
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  legendLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.dark.textMuted,
  },
});
