import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface User {
  id: number;
  username: string;
  consumptionLabel: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username?: string) => Promise<void>;
  register: (username?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateConsumptionLabel: (label: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = "local_user";
const LOCAL_USER_ID = 1;
const DEFAULT_LOCAL_USER: User = {
  id: LOCAL_USER_ID,
  username: "Lun4rMood",
  consumptionLabel: null,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = await AsyncStorage.getItem(LOCAL_USER_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          await AsyncStorage.setItem(LOCAL_USER_KEY, JSON.stringify(DEFAULT_LOCAL_USER));
          setUser(DEFAULT_LOCAL_USER);
        }
      } catch {
        await AsyncStorage.removeItem(LOCAL_USER_KEY);
        await AsyncStorage.setItem(LOCAL_USER_KEY, JSON.stringify(DEFAULT_LOCAL_USER));
        setUser(DEFAULT_LOCAL_USER);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (username = "Lun4rMood") => {
    const localUser: User = {
      id: LOCAL_USER_ID,
      username: username.trim() || "Lun4rMood",
      consumptionLabel: null,
    };
    await AsyncStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localUser));
    setUser(localUser);
  };

  const register = async (username = "Lun4rMood") => {
    await login(username);
  };

  const logout = async () => {
    await AsyncStorage.setItem(LOCAL_USER_KEY, JSON.stringify(DEFAULT_LOCAL_USER));
    setUser(DEFAULT_LOCAL_USER);
  };

  const updateConsumptionLabel = async (label: string) => {
    const nextUser = user ? { ...user, consumptionLabel: label } : null;
    if (nextUser) {
      await AsyncStorage.setItem(LOCAL_USER_KEY, JSON.stringify(nextUser));
    }
    setUser(nextUser);
  };

  const refreshUser = async () => {
    const storedUser = await AsyncStorage.getItem(LOCAL_USER_KEY);
    setUser(storedUser ? JSON.parse(storedUser) : null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateConsumptionLabel, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
