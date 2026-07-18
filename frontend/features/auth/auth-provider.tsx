"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "@/services";
import { setAuthUserId } from "@/services/api-client";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  users: User[];
  isLoading: boolean;
  switchUser: (userId: number) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = "airbnb-current-user-id";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const allUsers = await authApi.getUsers();
        setUsers(allUsers);
        const storedId = localStorage.getItem(STORAGE_KEY);
        const defaultUser = storedId
          ? allUsers.find((u) => u.id === Number(storedId)) ?? allUsers[0]
          : allUsers[0];
        if (defaultUser) {
          setAuthUserId(defaultUser.id);
          setUser(defaultUser);
          localStorage.setItem(STORAGE_KEY, String(defaultUser.id));
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  const switchUser = useCallback(async (userId: number) => {
    const result = await authApi.switchUser(userId);
    setUser(result.user);
    setAuthUserId(result.user.id);
    localStorage.setItem(STORAGE_KEY, String(result.user.id));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setAuthUserId(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({ user, users, isLoading, switchUser, logout }),
    [user, users, isLoading, switchUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
