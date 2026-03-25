import React, { createContext, useContext, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

export interface MoodEntry {
  id: number;
  userId: number;
  date: string;
  period: "morning" | "afternoon" | "evening";
  mood: number;
  energy: number;
  consumption: number;
  note: string | null;
  lunarPhase: string;
  createdAt: string;
}

interface MoodContextType {
  moods: MoodEntry[];
  isLoading: boolean;
  fetchMoods: (month: number, year: number) => Promise<void>;
  createMood: (date: string, period: string, mood: number, energy: number, consumption: number, note: string | null) => Promise<MoodEntry>;
  updateMood: (id: number, mood: number, energy: number, consumption: number, note: string | null) => Promise<MoodEntry>;
  deleteMood: (id: number) => Promise<void>;
  clearMoods: () => void;
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

export function MoodProvider({ children }: { children: React.ReactNode }) {
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getToken = async () => {
    return await AsyncStorage.getItem("auth_token");
  };

  const getHeaders = async () => {
    const token = await getToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Cookie: `token=${token}` } : {}),
    };
  };

  const fetchMoods = useCallback(async (month: number, year: number) => {
    setIsLoading(true);
    try {
      const headers = await getHeaders();
      const res = await fetch(
        `${API_BASE}/moods?month=${month}&year=${year}`,
        { headers }
      );
      if (res.ok) {
        const data = await res.json();
        setMoods(data);
      }
    } catch (err) {
      console.error("Failed to fetch moods:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createMood = async (
    date: string,
    period: string,
    mood: number,
    energy: number,
    consumption: number,
    note: string | null
  ): Promise<MoodEntry> => {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/moods`, {
      method: "POST",
      headers,
      body: JSON.stringify({ date, period, mood, energy, consumption, note }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to create mood");
    }

    const entry = await res.json();
    setMoods((prev) => {
      const filtered = prev.filter(m => !(m.date === date && m.period === period));
      return [...filtered, entry];
    });
    return entry;
  };

  const updateMood = async (
    id: number,
    mood: number,
    energy: number,
    consumption: number,
    note: string | null
  ): Promise<MoodEntry> => {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/moods/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ mood, energy, consumption, note }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to update mood");
    }

    const entry = await res.json();
    setMoods((prev) => prev.map((m) => (m.id === id ? entry : m)));
    return entry;
  };

  const deleteMood = async (id: number) => {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/moods/${id}`, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
      throw new Error("Failed to delete mood");
    }

    setMoods((prev) => prev.filter((m) => m.id !== id));
  };

  const clearMoods = () => {
    setMoods([]);
  };

  return (
    <MoodContext.Provider
      value={{ moods, isLoading, fetchMoods, createMood, updateMood, deleteMood, clearMoods }}
    >
      {children}
    </MoodContext.Provider>
  );
}

export function useMoods() {
  const context = useContext(MoodContext);
  if (!context) throw new Error("useMoods must be used within MoodProvider");
  return context;
}
