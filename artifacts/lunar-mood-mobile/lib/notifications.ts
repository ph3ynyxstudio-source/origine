import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Language } from "./i18n";

const NOTIF_ENABLED_KEY = "notifications_enabled";

export async function requestNotificationPermissions(): Promise<boolean> {
  return false;
}

export async function getNotificationsEnabled(): Promise<boolean> {
  return false;
}

export async function setNotificationsEnabled(enabled: boolean, _language: Language = "en"): Promise<boolean> {
  await AsyncStorage.setItem(NOTIF_ENABLED_KEY, "false");
  return false;
}

export async function scheduleReminders(_language: Language = "en"): Promise<void> {
  await AsyncStorage.setItem(NOTIF_ENABLED_KEY, "false");
}

export async function cancelAllReminders(): Promise<void> {
  await AsyncStorage.setItem(NOTIF_ENABLED_KEY, "false");
}
