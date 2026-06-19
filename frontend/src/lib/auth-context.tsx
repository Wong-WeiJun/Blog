import type { ReactNode } from "react";
import { createContext, useContext, useState, useCallback } from "react";

export type UserRole = "admin" | "user";

export interface AuthUser {
  role: UserRole;
  name: string;
  email: string;
}

export const CREDENTIALS: Record<UserRole, { email: string; password: string; name: string }> = {
  admin: { email: "hello@yourdomain.dev", password: "Password1!", name: "Admin" },
  user:  { email: "reader@example.com",  password: "Reader123!", name: "Reader" },
};

interface AuthContextValue {
  user: AuthUser | null;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = useCallback((role: UserRole) => {
    const cred = CREDENTIALS[role];
    setUser({ role, name: cred.name, email: cred.email });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
}
