import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { AuthUser } from "@/types/auth";
import { getToken, setToken as persistToken } from "@/services/api";
import * as authApi from "@/services/authApi";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    persistToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    // Si el backend responde 401 en cualquier llamada, se cierra la sesión localmente.
    const onUnauthorized = () => setUser(null);
    window.addEventListener("researchlens:unauthorized", onUnauthorized);
    return () => window.removeEventListener("researchlens:unauthorized", onUnauthorized);
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    authApi
      .me()
      .then(setUser)
      .catch(() => persistToken(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: loggedInUser } = await authApi.login(email, password);
    persistToken(token);
    setUser(loggedInUser);
  }, []);

  const register = useCallback(async (email: string, password: string, firstName: string, lastName: string) => {
    const { token, user: newUser } = await authApi.register(email, password, firstName, lastName);
    persistToken(token);
    setUser(newUser);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, isAuthenticated: Boolean(user), login, register, logout }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
