import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setBaseUrl } from "@workspace/api-client-react";

setBaseUrl(`https://${process.env.EXPO_PUBLIC_DOMAIN}`);

interface User {
  id: number;
  username: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const getHeaders = useCallback(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Cookie: `token=${token}` } : {}),
    }),
    [token]
  );

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedToken = await AsyncStorage.getItem("auth_token");
        if (savedToken) {
          setToken(savedToken);
          const res = await fetch(`${API_BASE}/auth/me`, {
            headers: { Cookie: `token=${savedToken}` },
          });
          if (res.ok) {
            const data = await res.json();
            setUser({ id: data.id, username: data.username });
          } else {
            await AsyncStorage.removeItem("auth_token");
            setToken(null);
          }
        }
      } catch {
        await AsyncStorage.removeItem("auth_token");
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Login failed");
    }

    const data = await res.json();
    await AsyncStorage.setItem("auth_token", data.token);
    setToken(data.token);
    setUser({ id: data.id, username: data.username });
  };

  const register = async (username: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Registration failed");
    }

    const data = await res.json();
    await AsyncStorage.setItem("auth_token", data.token);
    setToken(data.token);
    setUser({ id: data.id, username: data.username });
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: getHeaders(),
      });
    } catch {}
    await AsyncStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
