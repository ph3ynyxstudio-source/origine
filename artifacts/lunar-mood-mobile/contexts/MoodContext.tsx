import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLunarPhase } from "@/lib/lunar";
import { normalizeTags, parseInput, type InputSignal } from "@/lib/inputParser";

const MOODS_STORAGE_KEY = "local_moods";
const LOCAL_USER_ID = 1;

export interface MoodEntry {
  id: number;
  userId: number;
  date: string;
  period: "morning" | "afternoon" | "evening";
  mood: number;
  energy: number;
  consumption: number;
  note: string | null;
  tags: string[];
  signal: InputSignal;
  lunarPhase: string;
  createdAt: string;
}

type StoredMoodEntry = Omit<MoodEntry, "tags" | "signal"> & {
  tags?: string[];
  signal?: InputSignal;
};

interface MoodContextType {
  moods: MoodEntry[];
  isLoading: boolean;
  fetchMoods: (month: number, year: number) => Promise<void>;
  createMood: (date: string, period: string, mood: number, energy: number, consumption: number, note: string | null, tags?: string[]) => Promise<MoodEntry>;
  updateMood: (id: number, mood: number, energy: number, consumption: number, note: string | null, tags?: string[]) => Promise<MoodEntry>;
  deleteMood: (id: number) => Promise<void>;
  clearMoods: () => void;
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

async function readLocalMoods(): Promise<MoodEntry[]> {
  const raw = await AsyncStorage.getItem(MOODS_STORAGE_KEY);
  const entries = raw ? (JSON.parse(raw) as StoredMoodEntry[]) : [];
  return entries.map((entry): MoodEntry => {
    const tags = normalizeTags(entry.tags);
    return {
      ...entry,
      tags,
      signal: entry.signal ?? parseInput({ mood: entry.mood, energy: entry.energy, tags, note: entry.note }),
    };
  });
}

async function writeLocalMoods(entries: MoodEntry[]): Promise<void> {
  await AsyncStorage.setItem(MOODS_STORAGE_KEY, JSON.stringify(entries));
}

export function MoodProvider({ children }: { children: React.ReactNode }) {
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadLocalMoods = useCallback(async () => {
    setIsLoading(true);
    try {
      setMoods(await readLocalMoods());
    } catch (err) {
      console.error("Failed to load local moods:", err);
      setMoods([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLocalMoods();
  }, [loadLocalMoods]);

  const fetchMoods = useCallback(async () => {
    await loadLocalMoods();
  }, [loadLocalMoods]);

  const createMood = async (
    date: string,
    period: string,
    mood: number,
    energy: number,
    consumption: number,
    note: string | null,
    tags: string[] = []
  ): Promise<MoodEntry> => {
    const periodKey = period as MoodEntry["period"];
    const normalizedTags = normalizeTags(tags);
    const signal = parseInput({ mood, energy, tags: normalizedTags, note });
    const entry: MoodEntry = {
      id: Date.now(),
      userId: LOCAL_USER_ID,
      date,
      period: periodKey,
      mood,
      energy,
      consumption,
      note,
      tags: normalizedTags,
      signal,
      lunarPhase: getLunarPhase(new Date(`${date}T12:00:00`)).phase,
      createdAt: new Date().toISOString(),
    };

    const current = await readLocalMoods();
    const next = [...current.filter((m) => !(m.date === date && m.period === periodKey)), entry];
    setMoods(next);
    await writeLocalMoods(next);
    return entry;
  };

  const updateMood = async (
    id: number,
    mood: number,
    energy: number,
    consumption: number,
    note: string | null,
    tags?: string[]
  ): Promise<MoodEntry> => {
    const current = await readLocalMoods();
    const existing = current.find((m) => m.id === id);
    if (!existing) {
      throw new Error("Entry not found");
    }

    const nextTags = normalizeTags(tags ?? existing.tags);
    const entry = {
      ...existing,
      mood,
      energy,
      consumption,
      note,
      tags: nextTags,
      signal: parseInput({ mood, energy, tags: nextTags, note }),
    };
    const next = current.map((m) => (m.id === id ? entry : m));
    setMoods(next);
    await writeLocalMoods(next);
    return entry;
  };

  const deleteMood = async (id: number) => {
    const current = await readLocalMoods();
    const next = current.filter((m) => m.id !== id);
    setMoods(next);
    await writeLocalMoods(next);
  };

  const clearMoods = () => {
    setMoods([]);
    AsyncStorage.removeItem(MOODS_STORAGE_KEY).catch(console.warn);
  };

  return (
    <MoodContext.Provider value={{ moods, isLoading, fetchMoods, createMood, updateMood, deleteMood, clearMoods }}>
      {children}
    </MoodContext.Provider>
  );
}

export function useMoods() {
  const context = useContext(MoodContext);
  if (!context) throw new Error("useMoods must be used within MoodProvider");
  return context;
}
