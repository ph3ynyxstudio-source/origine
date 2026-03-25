import React, { useState } from "react";
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
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/contexts/AuthContext";
import Colors from "@/constants/colors";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    if (password.length < 3) {
      setError("Password must be at least 3 characters");
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
      setError(e.message || "Something went wrong");
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
    <KeyboardAvoidingView
      style={styles.container}
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
          <View style={styles.moonIcon}>
            <Ionicons
              name="moon"
              size={48}
              color={Colors.dark.moon}
            />
          </View>
          <Text style={styles.title}>LunarMood</Text>
          <Text style={styles.subtitle}>
            Align your orbit with the stars.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons
              name="person-outline"
              size={20}
              color={Colors.dark.textMuted}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Username"
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
              placeholder="Password"
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
                {isLogin ? "Enter Orbit" : "Launch Account"}
              </Text>
            )}
          </Pressable>

          <Pressable onPress={toggleMode} style={styles.toggleContainer}>
            <Text style={styles.toggleText}>
              {isLogin ? "New to the cosmos? " : "Already have an account? "}
              <Text style={styles.toggleLink}>
                {isLogin ? "Create an account" : "Log in"}
              </Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
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
  moonIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(240, 230, 211, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    color: Colors.dark.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: Colors.dark.textSecondary,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
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
