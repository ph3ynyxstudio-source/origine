import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import type { Language } from "./i18n";

const NOTIF_ENABLED_KEY = "notifications_enabled";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

interface ReminderConfig {
  id: string;
  hour: number;
  minute: number;
  title: { en: string; fr: string };
  body: { en: string; fr: string };
}

const REMINDER_TIMES: ReminderConfig[] = [
  {
    id: "morning",
    hour: 8,
    minute: 0,
    title: { en: "Morning", fr: "Matin" },
    body: { en: "Time to log your morning mood!", fr: "N'oubliez pas de noter votre humeur du matin !" },
  },
  {
    id: "afternoon",
    hour: 13,
    minute: 0,
    title: { en: "Afternoon", fr: "Apr\u00e8s-midi" },
    body: { en: "Time to log your afternoon mood!", fr: "C'est l'heure de noter votre humeur de l'apr\u00e8s-midi !" },
  },
  {
    id: "evening",
    hour: 20,
    minute: 0,
    title: { en: "Evening", fr: "Soir" },
    body: { en: "How was your evening? Log your mood!", fr: "Comment s'est pass\u00e9e votre soir\u00e9e ? Notez votre humeur !" },
  },
];

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "web") return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === "granted";
}

export async function getNotificationsEnabled(): Promise<boolean> {
  const stored = await AsyncStorage.getItem(NOTIF_ENABLED_KEY);
  return stored !== "false";
}

export async function setNotificationsEnabled(enabled: boolean, language: Language = "en"): Promise<boolean> {
  if (enabled) {
    const granted = await requestNotificationPermissions();
    if (!granted) {
      await AsyncStorage.setItem(NOTIF_ENABLED_KEY, "false");
      return false;
    }
    await AsyncStorage.setItem(NOTIF_ENABLED_KEY, "true");
    await scheduleReminders(language);
    return true;
  } else {
    await AsyncStorage.setItem(NOTIF_ENABLED_KEY, "false");
    await cancelAllReminders();
    return false;
  }
}

export async function scheduleReminders(language: Language = "en"): Promise<void> {
  const enabled = await getNotificationsEnabled();
  if (!enabled) return;

  const granted = await requestNotificationPermissions();
  if (!granted) return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  for (const reminder of REMINDER_TIMES) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.title[language],
        body: reminder.body[language],
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: reminder.hour,
        minute: reminder.minute,
      },
    });
  }
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
