import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/contexts/AuthContext";
import Colors from "@/constants/colors";
import CosmicBackground from "@/components/CosmicBackground";

export default function SettingsScreen() {
  const { user, updateConsumptionLabel } = useAuth();
  const [label, setLabel] = useState(user?.consumptionLabel || "Café");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!label.trim()) {
      Alert.alert("Erreur", "Le nom de la catégorie ne peut pas être vide.");
      return;
    }

    setIsSaving(true);
    try {
      await updateConsumptionLabel(label.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erreur", e.message || "Échec de la mise à jour");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <CosmicBackground variant="sheet" starCount={40} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Réglages</Text>
        </View>

        <Text style={styles.sectionTitle}>Catégorie de consommation</Text>
        <Text style={styles.description}>
          Choisissez ce que vous souhaitez suivre (ex: Café, Tabac, Sucre, Alcool...)
        </Text>
        <TextInput
          style={styles.input}
          value={label}
          onChangeText={setLabel}
          placeholder="Ex: Café, Tabac, Sucre..."
          placeholderTextColor={Colors.dark.textMuted}
          autoFocus
        />

        <View style={styles.suggestions}>
          {["Café", "Tabac", "Sucre", "Alcool", "Snacks"].map((s) => (
            <Pressable
              key={s}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setLabel(s);
              }}
              style={[
                styles.suggestionChip,
                label === s && styles.suggestionChipActive,
              ]}
            >
              <Text
                style={[
                  styles.suggestionText,
                  label === s && styles.suggestionTextActive,
                ]}
              >
                {s}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.buttonPressed,
            isSaving && styles.buttonDisabled,
          ]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={styles.saveText}>Enregistrer</Text>
          )}
        </Pressable>
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
  title: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.dark.text,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.dark.textSecondary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.dark.textMuted,
    marginBottom: 16,
    lineHeight: 20,
  },
  input: {
    backgroundColor: "rgba(22, 27, 48, 0.6)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(37, 43, 69, 0.8)",
    padding: 16,
    color: Colors.dark.text,
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    marginBottom: 16,
  },
  suggestions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 32,
  },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(37, 43, 69, 0.8)",
    backgroundColor: "rgba(22, 27, 48, 0.6)",
  },
  suggestionChipActive: {
    borderColor: Colors.dark.primary,
    backgroundColor: "rgba(124, 106, 250, 0.15)",
  },
  suggestionText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.dark.textMuted,
  },
  suggestionTextActive: {
    color: Colors.dark.primaryLight,
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
});
