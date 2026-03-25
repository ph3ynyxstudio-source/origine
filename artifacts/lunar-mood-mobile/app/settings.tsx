import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";
import { router } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/contexts/AuthContext";
import { useMoods } from "@/contexts/MoodContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useTranslation, type Language } from "@/lib/i18n";
import { getNotificationsEnabled, setNotificationsEnabled } from "@/lib/notifications";
import Colors from "@/constants/colors";
import CosmicBackground from "@/components/CosmicBackground";

const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const { clearMoods, fetchMoods } = useMoods();
  const { consumptionTrackingEnabled, setConsumptionTrackingEnabled } = useSettings();
  const { t, language, setLanguage } = useTranslation();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(true);

  useEffect(() => {
    getNotificationsEnabled().then(setNotifEnabled);
  }, []);

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    clearMoods();
    await logout();
    router.replace("/login");
  };

  const toggleLang = async (lang: Language) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLanguage(lang);
    if (notifEnabled) {
      const { scheduleReminders } = await import("@/lib/notifications");
      scheduleReminders(lang).catch(console.warn);
    }
  };

  const handleToggleNotif = async () => {
    const newVal = !notifEnabled;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotifEnabled(newVal);
    const result = await setNotificationsEnabled(newVal, language);
    setNotifEnabled(result);
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

  return (
    <View style={styles.container}>
      <CosmicBackground starCount={60} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.dark.text} />
          </Pressable>
          <Text style={styles.headerTitle}>{t("settings")}</Text>
          <View style={{ width: 40 }} />
        </View>

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
          <Text style={styles.sectionTitle}>{t("consumptionTracking")}</Text>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleDescription}>{t("consumptionTrackingDesc")}</Text>
            <Switch
              value={consumptionTrackingEnabled}
              onValueChange={(val) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setConsumptionTrackingEnabled(val);
              }}
              trackColor={{ false: "rgba(37, 43, 69, 0.8)", true: "rgba(124, 106, 250, 0.4)" }}
              thumbColor={consumptionTrackingEnabled ? Colors.dark.primaryLight : Colors.dark.textMuted}
              ios_backgroundColor="rgba(37, 43, 69, 0.8)"
            />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t("notifications")}</Text>
          <Pressable onPress={handleToggleNotif} style={styles.notifRow}>
            <Ionicons
              name={notifEnabled ? "notifications" : "notifications-off-outline"}
              size={20}
              color={notifEnabled ? Colors.dark.primaryLight : Colors.dark.textMuted}
            />
            <Text style={[styles.notifText, notifEnabled && { color: Colors.dark.primaryLight }]}>
              {notifEnabled ? t("notificationsOn") : t("notificationsOff")}
            </Text>
          </Pressable>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(19, 23, 41, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(37, 43, 69, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.dark.text,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
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
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  toggleDescription: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.dark.textSecondary,
    lineHeight: 20,
  },
  notifRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  notifText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.dark.textMuted,
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
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.5,
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
