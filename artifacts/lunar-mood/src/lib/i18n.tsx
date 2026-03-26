import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "fr";

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
    french: "Français",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    period: "Period",
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",
    note: "Note",
    noteOptional: "Note (optional)",
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
    conso: "Conso",
    loginTitle: "LunarMood",
    loginSubtitle: "Align your orbit with the stars.",
    username: "Username",
    password: "Password",
    enterOrbit: "Enter Orbit",
    createAccount: "Create Account",
    noAccount: "New to the cosmos?",
    hasAccount: "Already have an account?",
    emotionByPhase: "Emotion by Lunar Phase",
    energyByPhase: "Energy by Lunar Phase",
    consumptionByPhase: "Consumption by Lunar Phase",
    monthlyTrends: "Monthly Trends",
    noDataYet: "No data yet",
    todaySummary: "Today's Orbit",
    addMood: "Log Mood",
    editMood: "Edit Mood",
    illumination: "Illumination",
    fillAllFields: "Please fill in all fields",
    somethingWentWrong: "Something went wrong",
    launchAccount: "Launch Account",
    logIn: "Log In",
    phaseNewMoon: "New Moon",
    phaseWaxingCrescent: "Waxing Crescent",
    phaseFirstQuarter: "First Quarter",
    phaseWaxingGibbous: "Waxing Gibbous",
    phaseFullMoon: "Full Moon",
    phaseWaningGibbous: "Waning Gibbous",
    phaseLastQuarter: "Last Quarter",
    phaseWaningCrescent: "Waning Crescent",
    passwordMinLength: "Password must be at least 3 characters",
    consumption: "Consumption",
    notLogged: "Not logged",
    sun: "Sun",
    mon: "Mon",
    tue: "Tue",
    wed: "Wed",
    thu: "Thu",
    fri: "Fri",
    sat: "Sat",
    logged: "logged",
    astronaut: "Astronaut",
    pageNotFound: "This page doesn't exist",
  },
  fr: {
    home: "Accueil",
    calendar: "Calendrier",
    statistics: "Statistiques",
    hello: "Bonjour",
    settings: "Réglages",
    logout: "Se déconnecter",
    entries: "Entrées",
    emotion: "Émotion",
    energy: "Énergie",
    currentPhase: "Phase Actuelle",
    language: "Langue",
    english: "English",
    french: "Français",
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    period: "Période",
    morning: "Matin",
    afternoon: "Après-midi",
    evening: "Soir",
    note: "Note",
    noteOptional: "Note (optionnel)",
    terrible: "Terrible",
    bad: "Mauvais",
    okay: "Moyen",
    good: "Bon",
    great: "Excellent",
    none: "Aucun",
    veryLittle: "Très peu",
    little: "Un peu",
    moderate: "Modéré",
    aLot: "Beaucoup",
    excessive: "Excessif",
    conso: "Conso",
    loginTitle: "LunarMood",
    loginSubtitle: "Alignez votre orbite avec les étoiles.",
    username: "Nom d'utilisateur",
    password: "Mot de passe",
    enterOrbit: "Entrer en Orbite",
    createAccount: "Créer un compte",
    noAccount: "Nouveau dans le cosmos ?",
    hasAccount: "Vous avez déjà un compte ?",
    emotionByPhase: "Émotion par Phase Lunaire",
    energyByPhase: "Énergie par Phase Lunaire",
    consumptionByPhase: "Consommation par Phase Lunaire",
    monthlyTrends: "Tendances Mensuelles",
    noDataYet: "Pas encore de données",
    todaySummary: "L'orbite d'aujourd'hui",
    addMood: "Noter l'humeur",
    editMood: "Modifier l'humeur",
    illumination: "Illumination",
    fillAllFields: "Veuillez remplir tous les champs",
    somethingWentWrong: "Quelque chose s'est mal passé",
    launchAccount: "Créer le compte",
    logIn: "Se connecter",
    phaseNewMoon: "Nouvelle Lune",
    phaseWaxingCrescent: "Premier Croissant",
    phaseFirstQuarter: "Premier Quartier",
    phaseWaxingGibbous: "Gibbeuse Croissante",
    phaseFullMoon: "Pleine Lune",
    phaseWaningGibbous: "Gibbeuse Décroissante",
    phaseLastQuarter: "Dernier Quartier",
    phaseWaningCrescent: "Dernier Croissant",
    passwordMinLength: "Le mot de passe doit contenir au moins 3 caractères",
    consumption: "Consommation",
    notLogged: "Non enregistré",
    sun: "Dim",
    mon: "Lun",
    tue: "Mar",
    wed: "Mer",
    thu: "Jeu",
    fri: "Ven",
    sat: "Sam",
    logged: "enregistrées",
    astronaut: "Astronaute",
    pageNotFound: "Cette page n'existe pas",
  },
};

type Translations = typeof translations.en;

interface I18nContextType {
  t: (key: keyof Translations | string) => string;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("app_language") as Language;
    if (saved && (saved === "en" || saved === "fr")) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app_language", lang);
  };

  const t = (key: keyof Translations | string): string => {
    const k = key as keyof Translations;
    return translations[language][k] || translations.en[k] || key;
  };

  return (
    <I18nContext.Provider value={{ t, language, setLanguage }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useTranslation must be used within I18nProvider");
  return context;
}
