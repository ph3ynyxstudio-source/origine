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
    cycleDay: "Cycle day",
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
    conso: "Conso",
    loginTitle: "Lun4rMood",
    loginSubtitle: "Une meilleure compréhension de soi commence ici.\nEntre pour découvrir tes cycles.",
    localFirstAccess: "Local-first beta: no account is required for now.",
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
    devTools: "Developer Tools",
    devGenerateData: "Generate 2 Months Test Data",
    devClearData: "Clear All Mood Data",
    devGenerating: "Generating...",
    devClearing: "Clearing...",
    devGenerateSuccess: "Test data generated!",
    devClearSuccess: "All data cleared!",
    devGenerateFailed: "Failed to generate test data",
    devClearFailed: "Failed to clear data",
    devEntries: "entries created",
    devEntriesDeleted: "entries deleted",
    devConfirmClear: "Are you sure? This will delete ALL your mood data.",
    consumptionTracking: "Consumption Tracking",
    consumptionTrackingDesc: "Show the consumption section in mood entries",
  },
  fr: {
    home: "Accueil",
    calendar: "Calendrier",
    statistics: "Statistiques",
    hello: "Bonjour",
    settings: "Réglages",
    logout: "Déconnexion",
    entries: "Entrées",
    emotion: "Émotion",
    energy: "Énergie",
    currentPhase: "Phase actuelle",
    cycleDay: "Jour du cycle",
    language: "Langue",
    english: "Anglais",
    french: "Français",
    consumptionCategory: "Catégorie de consommation",
    consumptionDescription: "Choisissez ce que vous souhaitez suivre (ex: Café, Tabac, Sucre, Alcool...)",
    consumptionPlaceholder: "Ex: Café, Tabac, Sucre...",
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    deleteConfirmTitle: "Supprimer",
    deleteConfirmMessage: "Êtes-vous sûr de vouloir supprimer cette entrée ?",
    errorEmptyCategory: "Le nom de la catégorie ne peut pas être vide.",
    errorUpdateFailed: "Échec de la mise à jour",
    period: "Période",
    morning: "Matin",
    afternoon: "Après-midi",
    evening: "Soir",
    periods: "Périodes",
    note: "Note",
    noteOptional: "Note (optionnel)",
    notePlaceholder: "Note sur cette période...",
    selectEmotion: "Sélectionnez une émotion",
    selectEmotionMessage: "Veuillez choisir comment vous vous sentez.",
    editEntry: "Modifier",
    saveEntry: "Enregistrer",
    saveFailed: "Échec de la sauvegarde",
    deleteFailed: "Échec de la suppression",
    terrible: "Terrible",
    bad: "Mauvais",
    okay: "Moyen",
    good: "Bien",
    great: "Super",
    none: "Aucune",
    veryLittle: "Très peu",
    little: "Peu",
    moderate: "Modéré",
    aLot: "Beaucoup",
    excessive: "Excessif",
    consumption: "Consommation",
    conso: "Conso",
    loginTitle: "Lun4rMood",
    loginSubtitle: "Une meilleure compréhension de soi commence ici.\nEntre pour découvrir tes cycles.",
    localFirstAccess: "Bêta local-first : aucun compte requis pour le moment.",
    username: "Nom d'utilisateur",
    password: "Mot de passe",
    enterOrbit: "Entrer en orbite",
    launchAccount: "Créer un compte",
    newToCosmos: "Nouveau dans le cosmos ? ",
    createAccount: "Créer un compte",
    alreadyHaveAccount: "Déjà un compte ? ",
    logIn: "Se connecter",
    fillAllFields: "Veuillez remplir tous les champs",
    passwordMinLength: "Le mot de passe doit contenir au moins 3 caractères",
    somethingWentWrong: "Quelque chose s'est mal passé",
    phaseNewMoon: "Nouvelle Lune",
    phaseWaxingCrescent: "Premier Croissant",
    phaseFirstQuarter: "Premier Quartier",
    phaseWaxingGibbous: "Gibeuse Croissante",
    phaseFullMoon: "Pleine Lune",
    phaseWaningGibbous: "Gibeuse Décroissante",
    phaseLastQuarter: "Dernier Quartier",
    phaseWaningCrescent: "Dernier Croissant",
    emotionByPhase: "Émotion par phase lunaire",
    energyByPhase: "Énergie par phase lunaire",
    consumptionByPhase: "Consommation par phase lunaire",
    monthlyTrends: "Tendances mensuelles",
    noDataYet: "Pas encore de données",
    noDataMessage: "Commencez à enregistrer votre humeur pour voir les corrélations lunaires !",
    avg: "moy",
    coffee: "Café",
    tobacco: "Tabac",
    sugar: "Sucre",
    alcohol: "Alcool",
    snacks: "Snacks",
    quickSuggestions: "Suggestions rapides",
    profile: "Profil",
    lunarInfluence: "Influence lunaire",
    averageEmotion: "Émotion moy.",
    averageEnergy: "Énergie moy.",
    averageConsumption: "Conso. moy.",
    devTools: "Outils développeur",
    devGenerateData: "Générer 2 mois de données test",
    devClearData: "Effacer toutes les données",
    devGenerating: "Génération...",
    devClearing: "Suppression...",
    devGenerateSuccess: "Données test générées !",
    devClearSuccess: "Toutes les données supprimées !",
    devGenerateFailed: "Échec de la génération",
    devClearFailed: "Échec de la suppression",
    devEntries: "entrées créées",
    devEntriesDeleted: "entrées supprimées",
    devConfirmClear: "Êtes-vous sûr ? Cela supprimera TOUTES vos données d'humeur.",
    consumptionTracking: "Suivi de consommation",
    consumptionTrackingDesc: "Afficher la section consommation dans les saisies d'humeur",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

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
