import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useMoods, type MoodEntry } from "@/contexts/MoodContext";
import { getMoodColor } from "@/lib/lunar";
import { useTranslation, getMoodTranslationKey, getConsumptionTranslationKey } from "@/lib/i18n";
import Colors from "@/constants/colors";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import CosmicBackground from "@/components/CosmicBackground";

const MOOD_ICONS: Record<number, keyof typeof Ionicons.glyphMap> = {
  1: "sad-outline",
  2: "cloudy-outline",
  3: "remove-circle-outline",
  4: "happy-outline",
  5: "star-outline",
};

const ENERGY_STEPS = [0, 25, 50, 75, 100];

function getCurrentPeriod(): "morning" | "afternoon" | "evening" {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

export default function MoodEntryScreen() {
  const params = useLocalSearchParams<{
    date: string;
    phaseEmoji: string;
    phaseLabel: string;
    consumptionLabel: string;
  }>();

  const { moods, createMood, updateMood, deleteMood, fetchMoods } = useMoods();
  const { t, language } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState<"morning" | "afternoon" | "evening">(getCurrentPeriod());
  const [selectedMood, setSelectedMood] = useState<number>(0);
  const [energy, setEnergy] = useState<number>(50);
  const [consumption, setConsumption] = useState<number>(0);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const PERIODS = useMemo(
    () => [
      { key: "morning" as const, label: t("morning"), color: "#F59E0B" },
      { key: "afternoon" as const, label: t("afternoon"), color: "#3B82F6" },
      { key: "evening" as const, label: t("evening"), color: "#8B5CF6" },
    ],
    [t]
  );

  const dateObj = params.date ? parseISO(params.date) : new Date();
  const dateLocale = language === "fr" ? fr : undefined;
  const formattedDate = format(dateObj, "EEEE, MMMM d, yyyy", { locale: dateLocale });
  const monthNum = dateObj.getMonth() + 1;
  const yearNum = dateObj.getFullYear();
  const dateStr = params.date || format(new Date(), "yyyy-MM-dd");

  const dayEntries = useMemo(() => moods.filter(m => m.date === dateStr), [moods, dateStr]);
  const existingEntry = useMemo(() => dayEntries.find(m => m.period === selectedPeriod), [dayEntries, selectedPeriod]);
  const isEditing = !!existingEntry;

  useEffect(() => {
    if (existingEntry) {
      setSelectedMood(existingEntry.mood);
      setEnergy(existingEntry.energy);
      setConsumption(existingEntry.consumption);
      setNote(existingEntry.note || "");
    } else {
      setSelectedMood(0);
      setEnergy(50);
      setConsumption(0);
      setNote("");
    }
  }, [existingEntry, selectedPeriod]);

  const handleMoodSelect = (mood: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMood(mood);
  };

  const handleSave = async () => {
    if (selectedMood === 0) {
      Alert.alert(t("selectEmotion"), t("selectEmotionMessage"));
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateMood(
          existingEntry!.id,
          selectedMood,
          energy,
          consumption,
          note.trim() || null
        );
      } else {
        await createMood(dateStr, selectedPeriod, selectedMood, energy, consumption, note.trim() || null);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await fetchMoods(monthNum, yearNum);
      router.back();
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t("saveFailed"), e.message || "");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(t("deleteConfirmTitle"), t("deleteConfirmMessage"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMood(existingEntry!.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await fetchMoods(monthNum, yearNum);
            router.back();
          } catch (e: any) {
            Alert.alert(t("deleteFailed"), e.message || "");
          }
        },
      },
    ]);
  };

  const cLabel = params.consumptionLabel || "Coffee";

  return (
    <View style={styles.container}>
      <CosmicBackground variant="sheet" starCount={50} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.dateText}>{formattedDate}</Text>
          {params.phaseEmoji ? (
            <View style={styles.phaseRow}>
              <Text style={styles.phaseEmoji}>{params.phaseEmoji}</Text>
              <Text style={styles.phaseLabel}>{params.phaseLabel}</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>{t("period")}</Text>
        <View style={styles.periodRow}>
          {PERIODS.map((p) => {
            const isSelected = selectedPeriod === p.key;
            const hasEntry = dayEntries.some(m => m.period === p.key);
            return (
              <Pressable
                key={p.key}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedPeriod(p.key); }}
                style={[
                  styles.periodOption,
                  isSelected && { borderColor: p.color, backgroundColor: p.color + "20" },
                ]}
              >
                <View style={[styles.periodDot, { backgroundColor: p.color }]} />
                <Text style={[styles.periodLabel, isSelected && { color: p.color }]}>{p.label}</Text>
                {hasEntry && <View style={styles.checkDot} />}
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>{t("emotion")}</Text>
        <View style={styles.moodRow}>
          {[1, 2, 3, 4, 5].map((level) => {
            const isSelected = selectedMood === level;
            return (
              <Pressable
                key={level}
                onPress={() => handleMoodSelect(level)}
                style={[
                  styles.moodOption,
                  isSelected && {
                    backgroundColor: getMoodColor(level) + "20",
                    borderColor: getMoodColor(level),
                    shadowColor: getMoodColor(level),
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.4,
                    shadowRadius: 10,
                  },
                ]}
              >
                <Ionicons
                  name={MOOD_ICONS[level]}
                  size={24}
                  color={isSelected ? getMoodColor(level) : Colors.dark.textMuted}
                />
                <Text style={[styles.moodLabel, isSelected && { color: getMoodColor(level) }]}>
                  {t(getMoodTranslationKey(level))}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>{t("energy")}</Text>
        <View style={styles.energyRow}>
          {ENERGY_STEPS.map((e) => {
            const isSelected = energy === e;
            return (
              <Pressable
                key={e}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setEnergy(e); }}
                style={[
                  styles.energyOption,
                  isSelected && { borderColor: "#3B82F6", backgroundColor: "rgba(59, 130, 246, 0.2)" },
                ]}
              >
                <Ionicons name="flash" size={16} color={isSelected ? "#93C5FD" : Colors.dark.textMuted} />
                <Text style={[styles.energyLabel, isSelected && { color: "#93C5FD" }]}>{e}%</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>{cLabel}</Text>
        <View style={styles.consumptionRow}>
          {[0, 1, 2, 3, 4, 5].map((c) => {
            const isSelected = consumption === c;
            return (
              <Pressable
                key={c}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setConsumption(c); }}
                style={[
                  styles.consumptionOption,
                  isSelected && { borderColor: "#F59E0B", backgroundColor: "rgba(245, 158, 11, 0.2)" },
                ]}
              >
                <Text style={[styles.consumptionValue, isSelected && { color: "#FCD34D" }]}>{c}</Text>
                <Text style={[styles.consumptionLabel, isSelected && { color: "#FCD34D" }]}>
                  {t(getConsumptionTranslationKey(c))}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>{t("noteOptional")}</Text>
        <TextInput
          style={styles.noteInput}
          placeholder={t("notePlaceholder")}
          placeholderTextColor={Colors.dark.textMuted}
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              pressed && styles.buttonPressed,
              isSubmitting && styles.buttonDisabled,
            ]}
            onPress={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.saveText}>
                {isEditing ? t("editEntry") : t("saveEntry")}
              </Text>
            )}
          </Pressable>

          {isEditing && (
            <Pressable
              style={({ pressed }) => [
                styles.deleteButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={18} color={Colors.dark.mood1} />
              <Text style={styles.deleteText}>{t("delete")}</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.surface,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  dateText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.dark.text,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  phaseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  phaseEmoji: {
    fontSize: 20,
    textShadowColor: Colors.dark.moon,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  phaseLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.dark.textSecondary,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.dark.textSecondary,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  periodRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  periodOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(37, 43, 69, 0.8)",
    backgroundColor: "rgba(22, 27, 48, 0.6)",
    gap: 4,
    position: "relative",
  },
  periodDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  periodLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.dark.textMuted,
  },
  checkDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22C55E",
  },
  moodRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 20,
  },
  moodOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(37, 43, 69, 0.8)",
    backgroundColor: "rgba(22, 27, 48, 0.6)",
    gap: 4,
  },
  moodLabel: {
    fontSize: 9,
    fontFamily: "Inter_500Medium",
    color: Colors.dark.textMuted,
  },
  energyRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 20,
  },
  energyOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "rgba(37, 43, 69, 0.8)",
    backgroundColor: "rgba(22, 27, 48, 0.6)",
    gap: 3,
  },
  energyLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.dark.textMuted,
  },
  consumptionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 20,
  },
  consumptionOption: {
    width: "31%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "rgba(37, 43, 69, 0.8)",
    backgroundColor: "rgba(22, 27, 48, 0.6)",
    gap: 2,
  },
  consumptionValue: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.dark.textMuted,
  },
  consumptionLabel: {
    fontSize: 9,
    fontFamily: "Inter_400Regular",
    color: Colors.dark.textMuted,
  },
  noteInput: {
    backgroundColor: "rgba(22, 27, 48, 0.6)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(37, 43, 69, 0.8)",
    padding: 16,
    color: Colors.dark.text,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    minHeight: 70,
    marginBottom: 20,
  },
  actions: {
    gap: 12,
  },
  saveButton: {
    backgroundColor: Colors.dark.primary,
    borderRadius: 16,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7C6AFA",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  saveText: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  deleteText: {
    color: Colors.dark.mood1,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
});
