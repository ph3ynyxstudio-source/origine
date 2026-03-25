import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Animated,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/lib/i18n";
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
  const { login, register } = useAuth();
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      setError(t("fillAllFields"));
      return;
    }
    if (password.length < 3) {
      setError(t("passwordMinLength"));
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      if (isLogin) {
        await login(username.trim(), password);
      } else {
        await register(username.trim(), password);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/");
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(e.message || t("somethingWentWrong"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLogin(!isLogin);
    setError("");
  };

  return (
    <View style={styles.container}>
      <CosmicBackground variant="login" starCount={100} />
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {particles.map((p, i) => (
          <FloatingParticleView key={i} particle={p} />
        ))}
      </View>
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
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color={Colors.dark.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder={t("username")}
                placeholderTextColor={Colors.dark.textMuted}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={Colors.dark.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder={t("password")}
                placeholderTextColor={Colors.dark.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={Colors.dark.textMuted}
                />
              </Pressable>
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
                  {isLogin ? t("enterOrbit") : t("launchAccount")}
                </Text>
              )}
            </Pressable>

            <Pressable onPress={toggleMode} style={styles.toggleContainer}>
              <Text style={styles.toggleText}>
                {isLogin ? t("newToCosmos") : t("alreadyHaveAccount")}
                <Text style={styles.toggleLink}>
                  {isLogin ? t("createAccount") : t("logIn")}
                </Text>
              </Text>
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
