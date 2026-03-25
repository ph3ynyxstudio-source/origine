import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useMoods } from "@/contexts/MoodContext";
import { getMoodColor, getMoodLabel } from "@/lib/lunar";
import Colors from "@/constants/colors";
import { format, parseISO } from "date-fns";
import CosmicBackground from "@/components/CosmicBackground";

const MOOD_ICONS: Record<number, keyof typeof Ionicons.glyphMap> = {
  1: "sad-outline",
  2: "cloudy-outline",
  3: "remove-circle-outline",
  4: "happy-outline",
  5: "star-outline",
};

export default function MoodEntryScreen() {
  const params = useLocalSearchParams<{
    date: string;
    existingId: string;
    existingMood: string;
    existingNote: string;
    phaseEmoji: string;
    phaseLabel: string;
  }>();

  const { createMood, updateMood, deleteMood, fetchMoods } = useMoods();
  const [selectedMood, setSelectedMood] = useState<number>(
    params.existingMood ? parseInt(params.existingMood, 10) : 0
  );
  const [note, setNote] = useState(params.existingNote || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!params.existingId;

  const dateObj = params.date ? parseISO(params.date) : new Date();
  const formattedDate = format(dateObj, "EEEE, MMMM d, yyyy");
  const monthNum = dateObj.getMonth() + 1;
  const yearNum = dateObj.getFullYear();

  const handleMoodSelect = (mood: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMood(mood);
  };

  const handleSave = async () => {
    if (selectedMood === 0) {
      Alert.alert("Select a mood", "Please choose how you're feeling today.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateMood(
          parseInt(params.existingId!, 10),
          selectedMood,
          note.trim() || null
        );
      } else {
        await createMood(params.date!, selectedMood, note.trim() || null);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await fetchMoods(monthNum, yearNum);
      router.back();
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", e.message || "Failed to save mood");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Entry", "Are you sure you want to delete this mood entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMood(parseInt(params.existingId!, 10));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await fetchMoods(monthNum, yearNum);
            router.back();
          } catch (e: any) {
            Alert.alert("Error", e.message || "Failed to delete");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <CosmicBackground variant="sheet" starCount={50} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.dateText}>{formattedDate}</Text>
          {params.phaseEmoji ? (
            <View style={styles.phaseRow}>
              <Text style={styles.phaseEmoji}>{params.phaseEmoji}</Text>
              <Text style={styles.phaseLabel}>{params.phaseLabel}</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>How are you feeling?</Text>
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
                  size={28}
                  color={isSelected ? getMoodColor(level) : Colors.dark.textMuted}
                />
                <Text
                  style={[
                    styles.moodLabel,
                    isSelected && { color: getMoodColor(level) },
                  ]}
                >
                  {getMoodLabel(level)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Note (optional)</Text>
        <TextInput
          style={styles.noteInput}
          placeholder="Write about your day..."
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
                {isEditing ? "Update" : "Save"} Mood
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
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.surface,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
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
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.dark.textSecondary,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  moodRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  moodOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(37, 43, 69, 0.8)",
    backgroundColor: "rgba(22, 27, 48, 0.6)",
    gap: 4,
  },
  moodLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
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
    minHeight: 80,
    marginBottom: 24,
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
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  deleteText: {
    color: Colors.dark.mood1,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
});
