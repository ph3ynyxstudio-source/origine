import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CONSUMPTION_TRACKING_KEY = "settings_consumption_tracking";

interface SettingsContextType {
  consumptionTrackingEnabled: boolean;
  setConsumptionTrackingEnabled: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [consumptionTrackingEnabled, setConsumptionTrackingState] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(CONSUMPTION_TRACKING_KEY).then((saved) => {
      if (saved !== null) {
        setConsumptionTrackingState(saved === "true");
      }
    });
  }, []);

  const setConsumptionTrackingEnabled = useCallback((enabled: boolean) => {
    setConsumptionTrackingState(enabled);
    AsyncStorage.setItem(CONSUMPTION_TRACKING_KEY, String(enabled));
  }, []);

  return (
    <SettingsContext.Provider value={{ consumptionTrackingEnabled, setConsumptionTrackingEnabled }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within SettingsProvider");
  return context;
}
