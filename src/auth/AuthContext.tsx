import React, { createContext, useContext, useEffect, useState } from "react";

export interface AuthState {
  username: string;
  role: "admin" | "user";
  token: string;
}

export interface AuthContextValue {
  user: AuthState | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);
const STORAGE_KEY = "music_app_auth_v1";

function encodeToken(payload: Omit<AuthState, "token">): string {
  return btoa(JSON.stringify({ ...payload, iat: Date.now() }));
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthState | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as AuthState);
    } catch {
      // ignore
    }
  }, []);

  async function login(username: string, password: string): Promise<boolean> {
    // Mock validation (demo creds)
    if (
      (username === "admin" && password === "admin") ||
      (username === "user" && password === "user")
    ) {
      const role = username === "admin" ? "admin" : "user";
      const base: Omit<AuthState, "token"> = { username, role };
      const token = encodeToken(base);
      const auth: AuthState = { ...base, token };
      setUser(auth);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
      return true;
    }
    return false;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
