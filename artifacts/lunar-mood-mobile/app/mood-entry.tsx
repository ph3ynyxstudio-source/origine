import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  GestureResponderEvent,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";

import CosmicBackground from "@/components/CosmicBackground";
import { Colors } from "@/constants/colors";
import { useMoods } from "@/contexts/MoodContext";
import { parseInput } from "@/lib/inputParser";
import { useTranslation } from "@/lib/i18n";

const TAG_OPTIONS = ["fatigue", "caffeine", "stress", "sleep", "focus"];

function getCurrentPeriod(): "morning" | "afternoon" | "evening" {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

function SliderBar({
  label,
  value,
  onChange,
  accent,
  icon,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  accent: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  const [width, setWidth] = useState(1);

  const updateFromEvent = (event: GestureResponderEvent) => {
    const next = Math.max(
      0,
      Math.min(100, Math.round((event.nativeEvent.locationX / width) * 100)),
    );
    onChange(next);
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    setWidth(Math.max(event.nativeEvent.layout.width, 1));
  };

  return (
    <View style={styles.sliderBlock}>
      <View style={styles.sliderHeader}>
        <View style={styles.sliderLabelRow}>
          <Ionicons name={icon} size={18} color={accent} />
          <Text style={styles.sectionTitle}>{label}</Text>
        </View>
        <Text style={[styles.sliderValue, { color: accent }]}>{value}%</Text>
      </View>
      <Pressable
        onLayout={handleLayout}
        onPress={updateFromEvent}
        onPressIn={updateFromEvent}
        style={styles.sliderTrack}>
        <View
          style={[
            styles.sliderFill,
            { width: `${value}%`, backgroundColor: accent },
          ]}
        />
        <View
          style={[
            styles.sliderThumb,
            {
              left: `${value}%`,
              borderColor: accent,
              shadowColor: accent,
            },
          ]}
        />
      </Pressable>
    </View>
  );
}

export default function MoodEntryScreen() {
  const params = useLocalSearchParams<{
    date: string;
    phaseEmoji: string;
    phaseLabel: string;
  }>();
  const { moods, createMood, updateMood, deleteMood, fetchMoods } = useMoods();
  const { t, language } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState<
    "morning" | "afternoon" | "evening"
  >(getCurrentPeriod());
  const [mood, setMood] = useState(50);
  const [energy, setEnergy] = useState(50);
  const [tags, setTags] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dateObj = params.date ? parseISO(params.date) : new Date();
  const dateStr = params.date || format(new Date(), "yyyy-MM-dd");
  const monthNum = dateObj.getMonth() + 1;
  const yearNum = dateObj.getFullYear();
  const formattedDate = format(dateObj, "EEEE, MMMM d, yyyy", {
    locale: language === "fr" ? fr : undefined,
  });

  const periods = useMemo(
    () => [
      { key: "morning" as const, label: t("morning"), color: "#F59E0B" },
      { key: "afternoon" as const, label: t("afternoon"), color: Colors.dark.cyan },
      { key: "evening" as const, label: t("evening"), color: Colors.dark.violet },
    ],
    [t],
  );

  const dayEntries = useMemo(
    () => moods.filter((entry) => entry.date === dateStr),
    [moods, dateStr],
  );
  const existingEntry = useMemo(
    () => dayEntries.find((entry) => entry.period === selectedPeriod),
    [dayEntries, selectedPeriod],
  );
  const isEditing = !!existingEntry;

  useEffect(() => {
    if (existingEntry) {
      setMood(existingEntry.mood);
      setEnergy(existingEntry.energy);
      setTags(existingEntry.tags ?? []);
      setNote(existingEntry.note ?? "");
      return;
    }

    setMood(50);
    setEnergy(50);
    setTags([]);
    setNote("");
  }, [existingEntry]);

  const signal = useMemo(
    () => parseInput({ mood, energy, tags, note }),
    [mood, energy, tags, note],
  );

  const toggleTag = (tag: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTags((current) => {
      if (current.includes(tag)) {
        return current.filter((item) => item !== tag);
      }
      return current.length >= 5 ? current : [...current, tag];
    });
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const trimmedNote = note.trim();
      if (isEditing) {
        await updateMood(
          existingEntry.id,
          mood,
          energy,
          0,
          trimmedNote || null,
          tags,
        );
      } else {
        await createMood(
          dateStr,
          selectedPeriod,
          mood,
          energy,
          0,
          trimmedNote || null,
          tags,
        );
      }
      await fetchMoods(monthNum, yearNum);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.back();
    } catch (error: any) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      Alert.alert(t("saveFailed"), error.message || "");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!existingEntry) return;
    Alert.alert(t("deleteConfirmTitle"), t("deleteConfirmMessage"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
        style: "destructive",
        onPress: async () => {
          await deleteMood(existingEntry.id);
          await fetchMoods(monthNum, yearNum);
          router.back();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <CosmicBackground variant="sheet" starCount={50} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.dateText}>{formattedDate}</Text>
          {params.phaseEmoji ? (
            <View style={styles.phaseRow}>
              <Text style={styles.phaseEmoji}>{params.phaseEmoji}</Text>
              <Text style={styles.phaseLabel}>{params.phaseLabel}</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>Period</Text>
        <View style={styles.periodRow}>
          {periods.map((period) => {
            const isSelected = selectedPeriod === period.key;
            const hasEntry = dayEntries.some((entry) => entry.period === period.key);
            return (
              <Pressable
                key={period.key}
                onPress={() => setSelectedPeriod(period.key)}
                style={[
                  styles.periodOption,
                  isSelected && {
                    borderColor: period.color,
                    backgroundColor: `${period.color}20`,
                  },
                ]}>
                <View style={[styles.periodDot, { backgroundColor: period.color }]} />
                <Text style={[styles.periodLabel, isSelected && { color: period.color }]}>
                  {period.label}
                </Text>
                {hasEntry && <View style={styles.checkDot} />}
              </Pressable>
            );
          })}
        </View>

        <SliderBar
          label="Mood"
          value={mood}
          onChange={setMood}
          accent={Colors.dark.magenta}
          icon="heart-outline"
        />
        <SliderBar
          label="Energy"
          value={energy}
          onChange={setEnergy}
          accent={Colors.dark.cyan}
          icon="flash-outline"
        />

        <View style={styles.tagsHeader}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <Text style={styles.tagCount}>{tags.length}/5</Text>
        </View>
        <View style={styles.tagsRow}>
          {TAG_OPTIONS.map((tag) => {
            const isSelected = tags.includes(tag);
            return (
              <Pressable
                key={tag}
                onPress={() => toggleTag(tag)}
                style={[styles.tagPill, isSelected && styles.tagPillActive]}>
                <Text style={[styles.tagText, isSelected && styles.tagTextActive]}>
                  {tag}
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
          numberOfLines={4}
          textAlignVertical="top"
        />

        <View style={styles.outputCard}>
          <View style={styles.outputHeader}>
            <Ionicons name="sparkles" size={18} color={Colors.dark.cyan} />
            <Text style={styles.outputTitle}>Signal {signal.score}%</Text>
          </View>
          <Text style={styles.outputSummary}>{signal.summary}</Text>
          <Text style={styles.outputLine}>{signal.insight}</Text>
          <Text style={styles.outputSuggestion}>{signal.suggestion}</Text>
          {signal.autoTags.length > 0 && (
            <Text style={styles.autoTags}>
              Auto-tags: {signal.autoTags.join(", ")}
            </Text>
          )}
        </View>

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              pressed && styles.buttonPressed,
              isSubmitting && styles.buttonDisabled,
            ]}
            onPress={handleSave}
            disabled={isSubmitting}>
            <LinearGradient
              colors={[Colors.dark.cyan, Colors.dark.violet, Colors.dark.magenta]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.saveGradient}>
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.saveText}>
                  {isEditing ? t("editEntry") : t("saveEntry")}
                </Text>
              )}
            </LinearGradient>
          </Pressable>

          {isEditing && (
            <Pressable
              style={({ pressed }) => [
                styles.deleteButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleDelete}>
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
    backgroundColor: Colors.dark.background,
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
    marginBottom: 22,
  },
  dateText: {
    color: Colors.dark.text,
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    textTransform: "capitalize",
  },
  phaseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  phaseEmoji: {
    fontSize: 20,
  },
  phaseLabel: {
    color: Colors.dark.textSecondary,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  sectionTitle: {
    color: Colors.dark.textSecondary,
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    letterSpacing: 0.6,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  periodRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 22,
  },
  periodOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderColor: Colors.dark.overlayBorderStrong,
    borderRadius: 14,
    borderWidth: 1.5,
    backgroundColor: Colors.dark.overlayControl,
    gap: 4,
    minHeight: 70,
    position: "relative",
  },
  periodDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  periodLabel: {
    color: Colors.dark.textMuted,
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
  checkDot: {
    position: "absolute",
    right: 7,
    top: 7,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.dark.cyan,
  },
  sliderBlock: {
    marginBottom: 24,
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sliderLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sliderValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
  },
  sliderTrack: {
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    overflow: "visible",
  },
  sliderFill: {
    position: "absolute",
    left: 0,
    height: 8,
    borderRadius: 4,
  },
  sliderThumb: {
    position: "absolute",
    width: 24,
    height: 24,
    marginLeft: -12,
    borderRadius: 12,
    borderWidth: 3,
    backgroundColor: Colors.dark.background,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
  },
  tagsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tagCount: {
    color: Colors.dark.textMuted,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 22,
  },
  tagPill: {
    borderColor: Colors.dark.overlayBorderStrong,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: Colors.dark.overlayControl,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  tagPillActive: {
    borderColor: Colors.dark.cyan,
    backgroundColor: "rgba(34, 211, 238, 0.14)",
  },
  tagText: {
    color: Colors.dark.textMuted,
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    textTransform: "capitalize",
  },
  tagTextActive: {
    color: Colors.dark.cyan,
  },
  noteInput: {
    minHeight: 96,
    marginBottom: 18,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.dark.overlayBorderStrong,
    backgroundColor: Colors.dark.overlayControl,
    color: Colors.dark.text,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
  },
  outputCard: {
    borderColor: Colors.dark.border,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: Colors.dark.surfaceSoft,
    marginBottom: 20,
    padding: 16,
    gap: 8,
  },
  outputHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  outputTitle: {
    color: Colors.dark.cyan,
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  outputSummary: {
    color: Colors.dark.text,
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
    lineHeight: 24,
  },
  outputLine: {
    color: Colors.dark.textSecondary,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 21,
  },
  outputSuggestion: {
    color: Colors.dark.magenta,
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    lineHeight: 21,
  },
  autoTags: {
    color: Colors.dark.textMuted,
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  actions: {
    gap: 12,
  },
  saveButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  saveGradient: {
    alignItems: "center",
    justifyContent: "center",
    height: 54,
  },
  buttonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  saveText: {
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
    backgroundColor: Colors.dark.overlayDangerSoft,
  },
  deleteText: {
    color: Colors.dark.mood1,
    fontFamily: "Inter_500Medium",
    fontSize: 15,
  },
});
