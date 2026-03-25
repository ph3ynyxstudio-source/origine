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
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
} from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useMoods } from "@/contexts/MoodContext";
import { getMonthPhases } from "@/lib/lunar";
import { useTranslation, getPhaseTranslationKey } from "@/lib/i18n";
import Colors from "@/constants/colors";
import CosmicBackground from "@/components/CosmicBackground";

const DAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_FR = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

const PERIOD_COLORS = {
  morning: "#F59E0B",
  afternoon: "#3B82F6",
  evening: "#8B5CF6",
};

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { moods, isLoading: isMoodsLoading, fetchMoods } = useMoods();
  const { t, language } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const month = currentMonth.getMonth() + 1;
  const year = currentMonth.getFullYear();
  const DAYS = language === "fr" ? DAYS_FR : DAYS_EN;

  const PERIODS = useMemo(
    () => [
      { key: "morning" as const, label: t("morning"), color: PERIOD_COLORS.morning },
      { key: "afternoon" as const, label: t("afternoon"), color: PERIOD_COLORS.afternoon },
      { key: "evening" as const, label: t("evening"), color: PERIOD_COLORS.evening },
    ],
    [t]
  );

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
    const phase = lunarPhases.find((p) => p.date === dateStr);
    router.push({
      pathname: "/mood-entry",
      params: {
        date: dateStr,
        phaseEmoji: phase?.emoji || "",
        phaseLabel: phase ? t(getPhaseTranslationKey(phase.phase)) : "",
        consumptionLabel: user?.consumptionLabel || "Coffee",
      },
    });
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
        {todayPhase && (
          <View style={styles.phaseHeader}>
            <Text style={styles.phaseEmoji}>{todayPhase.emoji}</Text>
            <Text style={styles.phaseText}>{t(getPhaseTranslationKey(todayPhase.phase))}</Text>
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
                const dayEntries = moods.filter((m) => m.date === dateStr);
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

                    {dayEntries.length > 0 && (
                      <View style={styles.dotsRow}>
                        {PERIODS.map((p) => {
                          const hasEntry = dayEntries.some((e) => e.period === p.key);
                          return (
                            <View
                              key={p.key}
                              style={[
                                styles.periodDot,
                                {
                                  backgroundColor: hasEntry ? p.color : "transparent",
                                  borderWidth: hasEntry ? 0 : 1,
                                  borderColor: "rgba(255,255,255,0.15)",
                                },
                              ]}
                            />
                          );
                        })}
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>{t("periods")}</Text>
          <View style={styles.legendRow}>
            {PERIODS.map((p) => (
              <View key={p.key} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: p.color }]} />
                <Text style={styles.legendLabel}>{p.label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.consumptionLabelRow}>
            <Text style={styles.consumptionLabelText}>
              {t("consumption")} : {user?.consumptionLabel || "Coffee"}
            </Text>
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
  phaseHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  phaseEmoji: {
    fontSize: 20,
    textShadowColor: Colors.dark.moon,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  phaseText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: Colors.dark.textSecondary,
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
    gap: 1,
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
    fontSize: 13,
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
    fontSize: 14,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 2,
    marginTop: 1,
  },
  periodDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendCard: {
    backgroundColor: "rgba(19, 23, 41, 0.5)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(37, 43, 69, 0.6)",
    marginBottom: 16,
  },
  legendTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.dark.textSecondary,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  legendRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.dark.textSecondary,
  },
  consumptionLabelRow: {
    marginTop: 4,
  },
  consumptionLabelText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.dark.textMuted,
  },
});
