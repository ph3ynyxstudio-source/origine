import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/contexts/AuthContext";
import { useMoods } from "@/contexts/MoodContext";
import { getLunarPhase } from "@/lib/lunar";
import { useTranslation, getPhaseTranslationKey, type Language } from "@/lib/i18n";
import Colors from "@/constants/colors";
import CosmicBackground from "@/components/CosmicBackground";
import GlowingMoon from "@/components/GlowingMoon";
import SwipeableTabView from "@/components/SwipeableTabView";

import type { TranslationKey } from "@/lib/i18n";

const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

interface SuggestionItem {
  defaultLabel: string;
  translationKey: TranslationKey;
}

const SUGGESTIONS: SuggestionItem[] = [
  { defaultLabel: "Coffee", translationKey: "coffee" },
  { defaultLabel: "Tobacco", translationKey: "tobacco" },
  { defaultLabel: "Sugar", translationKey: "sugar" },
  { defaultLabel: "Alcohol", translationKey: "alcohol" },
  { defaultLabel: "Snacks", translationKey: "snacks" },
];


export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, isLoading: isAuthLoading, logout, updateConsumptionLabel } = useAuth();
  const { moods, clearMoods, fetchMoods } = useMoods();
  const { t, language, setLanguage } = useTranslation();
  const [label, setLabel] = useState(user?.consumptionLabel || "Coffee");
  const [isSaving, setIsSaving] = useState(false);
  const [labelDirty, setLabelDirty] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login");
    }
  }, [user, isAuthLoading]);

  useEffect(() => {
    if (user?.consumptionLabel) {
      setLabel(user.consumptionLabel);
    }
  }, [user?.consumptionLabel]);

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

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    clearMoods();
    await logout();
    router.replace("/login");
  };

  const handleSaveLabel = async () => {
    if (!label.trim()) {
      Alert.alert(t("errorEmptyCategory"));
      return;
    }
    setIsSaving(true);
    try {
      await updateConsumptionLabel(label.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setLabelDirty(false);
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t("errorUpdateFailed"), e.message || "");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleLang = (lang: Language) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLanguage(lang);
  };

  const handleDevSeed = async () => {
    setIsSeeding(true);
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const res = await fetch(`${API_BASE}/dev/seed`, {
        method: "POST",
        headers: token ? { Cookie: `token=${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(t("devGenerateSuccess"), `${data.count} ${t("devEntries")}`);
        const now = new Date();
        fetchMoods(now.getMonth() + 1, now.getFullYear());
      } else {
        throw new Error("Failed");
      }
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t("devGenerateFailed"));
    } finally {
      setIsSeeding(false);
    }
  };

  const handleDevClear = () => {
    Alert.alert(t("devClearData"), t("devConfirmClear"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
        style: "destructive",
        onPress: async () => {
          setIsClearing(true);
          try {
            const token = await AsyncStorage.getItem("auth_token");
            const res = await fetch(`${API_BASE}/dev/seed`, {
              method: "DELETE",
              headers: token ? { Cookie: `token=${token}` } : {},
            });
            if (res.ok) {
              const data = await res.json();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert(t("devClearSuccess"), `${data.count} ${t("devEntriesDeleted")}`);
              clearMoods();
              const now = new Date();
              fetchMoods(now.getMonth() + 1, now.getFullYear());
            } else {
              throw new Error("Failed");
            }
          } catch {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert(t("devClearFailed"));
          } finally {
            setIsClearing(false);
          }
        },
      },
    ]);
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

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t("language")}</Text>
          <View style={styles.langRow}>
            <Pressable
              onPress={() => toggleLang("en")}
              style={[styles.langChip, language === "en" && styles.langChipActive]}
            >
              <Text style={[styles.langText, language === "en" && styles.langTextActive]}>
                {t("english")}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => toggleLang("fr")}
              style={[styles.langChip, language === "fr" && styles.langChipActive]}
            >
              <Text style={[styles.langText, language === "fr" && styles.langTextActive]}>
                {t("french")}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t("consumptionCategory")}</Text>
          <Text style={styles.description}>{t("consumptionDescription")}</Text>
          <TextInput
            style={styles.input}
            value={label}
            onChangeText={(v) => { setLabel(v); setLabelDirty(true); }}
            placeholder={t("consumptionPlaceholder")}
            placeholderTextColor={Colors.dark.textMuted}
          />
          <View style={styles.suggestions}>
            {SUGGESTIONS.map((s) => {
              const localizedName = t(s.translationKey);
              const isActive = label === localizedName;
              return (
                <Pressable
                  key={s.defaultLabel}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setLabel(localizedName);
                    setLabelDirty(true);
                  }}
                  style={[styles.suggestionChip, isActive && styles.suggestionChipActive]}
                >
                  <Text style={[styles.suggestionText, isActive && styles.suggestionTextActive]}>
                    {localizedName}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {labelDirty && (
            <Pressable
              style={({ pressed }) => [styles.saveButton, pressed && styles.buttonPressed, isSaving && styles.buttonDisabled]}
              onPress={handleSaveLabel}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.saveText}>{t("save")}</Text>
              )}
            </Pressable>
          )}
        </View>

        {__DEV__ && (
          <View style={styles.devSection}>
            <Text style={styles.devTitle}>{t("devTools")}</Text>
            <Pressable
              onPress={handleDevSeed}
              disabled={isSeeding}
              style={({ pressed }) => [styles.devButton, styles.devButtonSeed, pressed && styles.buttonPressed, isSeeding && styles.buttonDisabled]}
            >
              {isSeeding ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Ionicons name="flask-outline" size={18} color="#FFF" />
                  <Text style={styles.devButtonText}>{t("devGenerateData")}</Text>
                </>
              )}
            </Pressable>
            <Pressable
              onPress={handleDevClear}
              disabled={isClearing}
              style={({ pressed }) => [styles.devButton, styles.devButtonClear, pressed && styles.buttonPressed, isClearing && styles.buttonDisabled]}
            >
              {isClearing ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={18} color="#FFF" />
                  <Text style={styles.devButtonText}>{t("devClearData")}</Text>
                </>
              )}
            </Pressable>
          </View>
        )}

        <Pressable onPress={handleLogout} style={styles.logoutButton}>
          <Feather name="log-out" size={18} color={Colors.dark.mood1} />
          <Text style={styles.logoutText}>{t("logout")}</Text>
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
  sectionCard: {
    backgroundColor: "rgba(19, 23, 41, 0.5)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(37, 43, 69, 0.6)",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.dark.textSecondary,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.dark.textMuted,
    marginBottom: 12,
    lineHeight: 18,
  },
  langRow: {
    flexDirection: "row",
    gap: 10,
  },
  langChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(37, 43, 69, 0.8)",
    backgroundColor: "rgba(22, 27, 48, 0.6)",
    alignItems: "center",
  },
  langChipActive: {
    borderColor: Colors.dark.primary,
    backgroundColor: "rgba(124, 106, 250, 0.15)",
  },
  langText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.dark.textMuted,
  },
  langTextActive: {
    color: Colors.dark.primaryLight,
  },
  input: {
    backgroundColor: "rgba(22, 27, 48, 0.6)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(37, 43, 69, 0.8)",
    padding: 14,
    color: Colors.dark.text,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    marginBottom: 12,
  },
  suggestions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  suggestionChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(37, 43, 69, 0.8)",
    backgroundColor: "rgba(22, 27, 48, 0.6)",
  },
  suggestionChipActive: {
    borderColor: Colors.dark.primary,
    backgroundColor: "rgba(124, 106, 250, 0.15)",
  },
  suggestionText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.dark.textMuted,
  },
  suggestionTextActive: {
    color: Colors.dark.primaryLight,
  },
  saveButton: {
    backgroundColor: Colors.dark.primary,
    borderRadius: 14,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
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
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  devSection: {
    backgroundColor: "rgba(19, 23, 41, 0.5)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(250, 200, 50, 0.25)",
    marginBottom: 16,
    gap: 10,
  },
  devTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(250, 200, 50, 0.8)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  devButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 44,
    borderRadius: 14,
  },
  devButtonSeed: {
    backgroundColor: "rgba(124, 106, 250, 0.35)",
    borderWidth: 1,
    borderColor: "rgba(124, 106, 250, 0.5)",
  },
  devButtonClear: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.35)",
  },
  devButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    marginTop: 8,
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  logoutText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: Colors.dark.mood1,
  },
});
