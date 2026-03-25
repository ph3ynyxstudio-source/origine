import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Language = "en" | "fr";

const LANG_KEY = "app_language";

const translations = {
  en: {
    home: "Home",
    calendar: "Calendar",
    statistics: "Statistics",
    hello: "Hello",
    settings: "Settings",
    logout: "Log Out",
    entries: "Entries",
    emotion: "Emotion",
    energy: "Energy",
    currentPhase: "Current Phase",
    language: "Language",
    english: "English",
    french: "French",
    consumptionCategory: "Consumption Category",
    consumptionDescription: "Choose what you want to track (e.g. Coffee, Tobacco, Sugar, Alcohol...)",
    consumptionPlaceholder: "E.g. Coffee, Tobacco, Sugar...",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    deleteConfirmTitle: "Delete",
    deleteConfirmMessage: "Are you sure you want to delete this entry?",
    errorEmptyCategory: "Category name cannot be empty.",
    errorUpdateFailed: "Update failed",
    period: "Period",
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",
    periods: "Periods",
    note: "Note",
    noteOptional: "Note (optional)",
    notePlaceholder: "Note about this period...",
    selectEmotion: "Select an emotion",
    selectEmotionMessage: "Please choose how you feel.",
    editEntry: "Edit",
    saveEntry: "Save",
    saveFailed: "Save failed",
    deleteFailed: "Delete failed",
    terrible: "Terrible",
    bad: "Bad",
    okay: "Okay",
    good: "Good",
    great: "Great",
    none: "None",
    veryLittle: "Very little",
    little: "Little",
    moderate: "Moderate",
    aLot: "A lot",
    excessive: "Excessive",
    consumption: "Consumption",
    loginTitle: "LunarMood",
    loginSubtitle: "Align your orbit with the stars.",
    username: "Username",
    password: "Password",
    enterOrbit: "Enter Orbit",
    launchAccount: "Launch Account",
    newToCosmos: "New to the cosmos? ",
    createAccount: "Create an account",
    alreadyHaveAccount: "Already have an account? ",
    logIn: "Log in",
    fillAllFields: "Please fill in all fields",
    passwordMinLength: "Password must be at least 3 characters",
    somethingWentWrong: "Something went wrong",
    phaseNewMoon: "New Moon",
    phaseWaxingCrescent: "Waxing Crescent",
    phaseFirstQuarter: "First Quarter",
    phaseWaxingGibbous: "Waxing Gibbous",
    phaseFullMoon: "Full Moon",
    phaseWaningGibbous: "Waning Gibbous",
    phaseLastQuarter: "Last Quarter",
    phaseWaningCrescent: "Waning Crescent",
    emotionByPhase: "Emotion by Lunar Phase",
    energyByPhase: "Energy by Lunar Phase",
    consumptionByPhase: "Consumption by Lunar Phase",
    monthlyTrends: "Monthly Trends",
    noDataYet: "No data yet",
    noDataMessage: "Start logging your mood to see lunar correlations!",
    avg: "avg",
    coffee: "Coffee",
    tobacco: "Tobacco",
    sugar: "Sugar",
    alcohol: "Alcohol",
    snacks: "Snacks",
    quickSuggestions: "Quick suggestions",
    profile: "Profile",
    lunarInfluence: "Lunar Influence",
    averageEmotion: "Avg Emotion",
    averageEnergy: "Avg Energy",
    averageConsumption: "Avg Consumption",
  },
  fr: {
    home: "Accueil",
    calendar: "Calendrier",
    statistics: "Statistiques",
    hello: "Bonjour",
    settings: "R\u00e9glages",
    logout: "D\u00e9connexion",
    entries: "Entr\u00e9es",
    emotion: "\u00c9motion",
    energy: "\u00c9nergie",
    currentPhase: "Phase actuelle",
    language: "Langue",
    english: "Anglais",
    french: "Fran\u00e7ais",
    consumptionCategory: "Cat\u00e9gorie de consommation",
    consumptionDescription: "Choisissez ce que vous souhaitez suivre (ex: Caf\u00e9, Tabac, Sucre, Alcool...)",
    consumptionPlaceholder: "Ex: Caf\u00e9, Tabac, Sucre...",
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    deleteConfirmTitle: "Supprimer",
    deleteConfirmMessage: "\u00cates-vous s\u00fbr de vouloir supprimer cette entr\u00e9e ?",
    errorEmptyCategory: "Le nom de la cat\u00e9gorie ne peut pas \u00eatre vide.",
    errorUpdateFailed: "\u00c9chec de la mise \u00e0 jour",
    period: "P\u00e9riode",
    morning: "Matin",
    afternoon: "Apr\u00e8s-midi",
    evening: "Soir",
    periods: "P\u00e9riodes",
    note: "Note",
    noteOptional: "Note (optionnel)",
    notePlaceholder: "Note sur cette p\u00e9riode...",
    selectEmotion: "S\u00e9lectionnez une \u00e9motion",
    selectEmotionMessage: "Veuillez choisir comment vous vous sentez.",
    editEntry: "Modifier",
    saveEntry: "Enregistrer",
    saveFailed: "\u00c9chec de la sauvegarde",
    deleteFailed: "\u00c9chec de la suppression",
    terrible: "Terrible",
    bad: "Mauvais",
    okay: "Moyen",
    good: "Bien",
    great: "Super",
    none: "Aucune",
    veryLittle: "Tr\u00e8s peu",
    little: "Peu",
    moderate: "Mod\u00e9r\u00e9",
    aLot: "Beaucoup",
    excessive: "Excessif",
    consumption: "Consommation",
    loginTitle: "LunarMood",
    loginSubtitle: "Alignez votre orbite avec les \u00e9toiles.",
    username: "Nom d'utilisateur",
    password: "Mot de passe",
    enterOrbit: "Entrer en orbite",
    launchAccount: "Cr\u00e9er un compte",
    newToCosmos: "Nouveau dans le cosmos ? ",
    createAccount: "Cr\u00e9er un compte",
    alreadyHaveAccount: "D\u00e9j\u00e0 un compte ? ",
    logIn: "Se connecter",
    fillAllFields: "Veuillez remplir tous les champs",
    passwordMinLength: "Le mot de passe doit contenir au moins 3 caract\u00e8res",
    somethingWentWrong: "Quelque chose s'est mal pass\u00e9",
    phaseNewMoon: "Nouvelle Lune",
    phaseWaxingCrescent: "Premier Croissant",
    phaseFirstQuarter: "Premier Quartier",
    phaseWaxingGibbous: "Gibeuse Croissante",
    phaseFullMoon: "Pleine Lune",
    phaseWaningGibbous: "Gibeuse D\u00e9croissante",
    phaseLastQuarter: "Dernier Quartier",
    phaseWaningCrescent: "Dernier Croissant",
    emotionByPhase: "\u00c9motion par phase lunaire",
    energyByPhase: "\u00c9nergie par phase lunaire",
    consumptionByPhase: "Consommation par phase lunaire",
    monthlyTrends: "Tendances mensuelles",
    noDataYet: "Pas encore de donn\u00e9es",
    noDataMessage: "Commencez \u00e0 enregistrer votre humeur pour voir les corr\u00e9lations lunaires !",
    avg: "moy",
    coffee: "Caf\u00e9",
    tobacco: "Tabac",
    sugar: "Sucre",
    alcohol: "Alcool",
    snacks: "Snacks",
    quickSuggestions: "Suggestions rapides",
    profile: "Profil",
    lunarInfluence: "Influence lunaire",
    averageEmotion: "\u00c9motion moy.",
    averageEnergy: "\u00c9nergie moy.",
    averageConsumption: "Conso. moy.",
  },
} as const;

type TranslationKey = keyof typeof translations.en;

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then((saved) => {
      if (saved === "fr" || saved === "en") {
        setLanguageState(saved);
      }
      setIsLoaded(true);
    });
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    AsyncStorage.setItem(LANG_KEY, lang);
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[language][key] || translations.en[key] || key;
    },
    [language]
  );

  if (!isLoaded) return null;

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useTranslation must be used within I18nProvider");
  return context;
}

const PHASE_LABELS: Record<string, TranslationKey> = {
  new_moon: "phaseNewMoon",
  waxing_crescent: "phaseWaxingCrescent",
  first_quarter: "phaseFirstQuarter",
  waxing_gibbous: "phaseWaxingGibbous",
  full_moon: "phaseFullMoon",
  waning_gibbous: "phaseWaningGibbous",
  last_quarter: "phaseLastQuarter",
  waning_crescent: "phaseWaningCrescent",
};

export function getPhaseTranslationKey(phaseKey: string): TranslationKey {
  return PHASE_LABELS[phaseKey] || "phaseNewMoon";
}

const MOOD_LABELS: Record<number, TranslationKey> = {
  1: "terrible",
  2: "bad",
  3: "okay",
  4: "good",
  5: "great",
};

export function getMoodTranslationKey(mood: number): TranslationKey {
  return MOOD_LABELS[mood] || "okay";
}

const CONSUMPTION_LABELS_MAP: TranslationKey[] = [
  "none",
  "veryLittle",
  "little",
  "moderate",
  "aLot",
  "excessive",
];

export function getConsumptionTranslationKey(level: number): TranslationKey {
  return CONSUMPTION_LABELS_MAP[level] || "none";
}
