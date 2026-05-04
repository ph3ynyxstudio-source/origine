import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Animated,
  Modal,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation, type Language } from "@/lib/i18n";
import { getNotificationsEnabled, setNotificationsEnabled } from "@/lib/notifications";
import Colors from "@/constants/colors";
import CosmicBackground from "@/components/CosmicBackground";
import GlowingMoon from "@/components/GlowingMoon";

interface FloatingParticle {
  x: number;
  startY: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

function generateParticles(count: number): FloatingParticle[] {
  const particles: FloatingParticle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * 100,
      startY: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 6000 + 4000,
      delay: Math.random() * 4000,
      opacity: Math.random() * 0.4 + 0.1,
    });
  }
  return particles;
}

const FloatingParticleView = React.memo(({ particle }: { particle: FloatingParticle }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(particle.opacity)).current;

  useEffect(() => {
    const moveAnimation = Animated.loop(
      Animated.sequence([
        Animated.delay(particle.delay),
        Animated.timing(translateY, {
          toValue: -30,
          duration: particle.duration,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: particle.duration,
          useNativeDriver: true,
        }),
      ])
    );
    const fadeAnimation = Animated.loop(
      Animated.sequence([
        Animated.delay(particle.delay + 500),
        Animated.timing(opacityAnim, {
          toValue: particle.opacity * 0.2,
          duration: particle.duration * 0.8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: particle.opacity,
          duration: particle.duration * 0.8,
          useNativeDriver: true,
        }),
      ])
    );
    moveAnimation.start();
    fadeAnimation.start();
    return () => {
      moveAnimation.stop();
      fadeAnimation.stop();
    };
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: `${particle.x}%`,
        top: `${particle.startY}%`,
        width: particle.size,
        height: particle.size,
        borderRadius: particle.size / 2,
        backgroundColor: "rgba(155, 139, 255, 0.6)",
        opacity: opacityAnim,
        transform: [{ translateY }],
      }}
    />
  );
});

const particles = generateParticles(Platform.OS === "web" ? 8 : 12);

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const { t, language, setLanguage } = useTranslation();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(true);

  useEffect(() => {
    getNotificationsEnabled().then(setNotifEnabled);
  }, []);

  const handleToggleNotif = async () => {
    const newVal = !notifEnabled;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotifEnabled(newVal);
    const result = await setNotificationsEnabled(newVal, language);
    setNotifEnabled(result);
  };

  const handleSubmit = async () => {
    setError("");
    setIsSubmitting(true);

    try {
      await login("Lun4rMood");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/");
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(e.message || t("somethingWentWrong"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLang = (lang: Language) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLanguage(lang);
  };

  const handleDevSeed = async () => {
    setIsSeeding(true);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(t("devGenerateSuccess"), t("localFirstAccess"));
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
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert(t("devClearSuccess"), t("localFirstAccess"));
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
      <CosmicBackground variant="login" starCount={100} />
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {particles.map((p, i) => (
          <FloatingParticleView key={i} particle={p} />
        ))}
      </View>

      <Pressable
        style={[styles.gearButton, { top: insets.top + 12, left: 16 }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setShowSettings(true);
        }}
      >
        <Ionicons name="settings-outline" size={22} color={Colors.dark.textSecondary} />
      </Pressable>

      <Modal
        visible={showSettings}
        animationType="fade"
        transparent
        onRequestClose={() => setShowSettings(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowSettings(false)}>
          <Pressable
            style={[styles.settingsPanel, { marginTop: insets.top + 56 }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.settingsPanelHeader}>
              <Ionicons name="settings-outline" size={18} color={Colors.dark.primaryLight} />
              <Text style={styles.settingsPanelTitle}>{t("settings")}</Text>
              <Pressable onPress={() => setShowSettings(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={Colors.dark.textSecondary} />
              </Pressable>
            </View>

            <Text style={styles.settingsSectionLabel}>{t("language")}</Text>
            <View style={styles.langRow}>
              <Pressable
                onPress={() => toggleLang("en")}
                style={[styles.langChip, language === "en" && styles.langChipActive]}
              >
                <Text style={[styles.langText, language === "en" && styles.langTextActive]}>English</Text>
              </Pressable>
              <Pressable
                onPress={() => toggleLang("fr")}
                style={[styles.langChip, language === "fr" && styles.langChipActive]}
              >
                <Text style={[styles.langText, language === "fr" && styles.langTextActive]}>Français</Text>
              </Pressable>
            </View>

            <Text style={styles.settingsSectionLabel}>{t("notifications")}</Text>
            <Pressable
              onPress={handleToggleNotif}
              style={[styles.notifToggle, notifEnabled && styles.notifToggleActive]}
            >
              <Ionicons
                name={notifEnabled ? "notifications" : "notifications-off-outline"}
                size={18}
                color={notifEnabled ? Colors.dark.primaryLight : Colors.dark.textMuted}
              />
              <Text style={[styles.notifText, notifEnabled && styles.notifTextActive]}>
                {notifEnabled ? t("notificationsOn") : t("notificationsOff")}
              </Text>
              <View style={[styles.notifDot, notifEnabled && styles.notifDotActive]} />
            </Pressable>

            {__DEV__ && (
              <>
                <Text style={styles.devSectionLabel}>{t("devTools")}</Text>
                <Pressable
                  onPress={handleDevSeed}
                  disabled={isSeeding}
                  style={({ pressed }) => [styles.devButton, styles.devButtonSeed, pressed && styles.btnPressed, isSeeding && styles.btnDisabled]}
                >
                  {isSeeding ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name="flask-outline" size={16} color="#FFF" />
                      <Text style={styles.devButtonText}>{t("devGenerateData")}</Text>
                    </>
                  )}
                </Pressable>
                <Pressable
                  onPress={handleDevClear}
                  disabled={isClearing}
                  style={({ pressed }) => [styles.devButton, styles.devButtonClear, pressed && styles.btnPressed, isClearing && styles.btnDisabled]}
                >
                  {isClearing ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name="trash-outline" size={16} color="#FFF" />
                      <Text style={styles.devButtonText}>{t("devClearData")}</Text>
                    </>
                  )}
                </Pressable>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + (Platform.OS === "web" ? 67 : 40),
              paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 40),
            },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <GlowingMoon size={96} iconSize={52} />
            <Text style={styles.title}>{t("loginTitle")}</Text>
            <Text style={styles.subtitle}>{t("loginSubtitle")}</Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.localInfo}>
              <Ionicons
                name="sparkles-outline"
                size={22}
                color={Colors.dark.primaryLight}
              />
              <Text style={styles.localInfoText}>{t("localFirstAccess")}</Text>
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color={Colors.dark.mood1} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                pressed && styles.submitButtonPressed,
                isSubmitting && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.submitText}>
                  {t("enterOrbit")}
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  gearButton: {
    position: "absolute",
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(19, 23, 41, 0.7)",
    borderWidth: 1,
    borderColor: "rgba(37, 43, 69, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  settingsPanel: {
    marginHorizontal: 16,
    backgroundColor: "rgba(15, 18, 32, 0.97)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(37, 43, 69, 0.6)",
    gap: 12,
  },
  settingsPanelHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  settingsPanelTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.dark.text,
  },
  closeBtn: {
    padding: 4,
  },
  settingsSectionLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.dark.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  langRow: {
    flexDirection: "row",
    gap: 10,
  },
  langChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
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
  notifToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(37, 43, 69, 0.8)",
    backgroundColor: "rgba(22, 27, 48, 0.6)",
  },
  notifToggleActive: {
    borderColor: Colors.dark.primary,
    backgroundColor: "rgba(124, 106, 250, 0.1)",
  },
  notifText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.dark.textMuted,
  },
  notifTextActive: {
    color: Colors.dark.primaryLight,
  },
  notifDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(37, 43, 69, 0.8)",
  },
  notifDotActive: {
    backgroundColor: "#22C55E",
  },
  devSectionLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(250, 200, 50, 0.8)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 4,
  },
  devButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 40,
    borderRadius: 12,
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
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  btnDisabled: {
    opacity: 0.5,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  title: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    color: Colors.dark.primary,
    marginBottom: 8,
    textShadowColor: "rgba(124, 106, 250, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: Colors.dark.textSecondary,
  },
  formCard: {
    gap: 16,
    backgroundColor: "rgba(19, 23, 41, 0.6)",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(37, 43, 69, 0.6)",
    shadowColor: "#7C6AFA",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  localInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(34, 211, 238, 0.08)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(34, 211, 238, 0.22)",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  localInfoText: {
    flex: 1,
    color: Colors.dark.textSecondary,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(22, 27, 48, 0.7)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(37, 43, 69, 0.8)",
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: Colors.dark.text,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    height: "100%",
  },
  eyeBtn: {
    padding: 8,
    marginRight: -8,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 4,
  },
  errorText: {
    color: Colors.dark.mood1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  submitButton: {
    backgroundColor: Colors.dark.primary,
    borderRadius: 16,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#7C6AFA",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  submitButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: "#FFF",
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  toggleContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  toggleText: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  toggleLink: {
    color: Colors.dark.primaryLight,
    fontFamily: "Inter_500Medium",
  },
});
