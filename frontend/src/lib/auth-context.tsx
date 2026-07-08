import type { ReactNode } from "react";
import { createContext, useContext, useCallback } from "react";
import {
  type BodyLoginLoginAccessToken as AccessToken,
  type UserRegister,
  type UserPublic,
} from "@/client";
import useAuthHook from "../hooks/useAuth";

export type UserRole = "admin" | "user";

export interface AuthUser {
  role: UserRole;
  name: string;
  email: string;
  avatarUrl: string | null;
  id: string;
}

interface MutationOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => void;
  logout: () => void;
  register: (name: string, email: string, password: string) => void;
  recoverPassword: (email: string, options?: MutationOptions) => void;
  resetPassword: (token: string, password: string, options?: MutationOptions) => void;
  refreshUser: () => void;
  isLoading: boolean;
  isLoggingIn: boolean;
  loginError: Error | null;
  isRegistering: boolean;
  isRecoveringPassword: boolean;
  isResettingPassword: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function adaptUser(backendUser: UserPublic | null): AuthUser | null {
  if (!backendUser) return null;
  return {
    role: backendUser.is_superuser ? "admin" : "user",
    name: backendUser.full_name || backendUser.email.split("@")[0] || "User",
    email: backendUser.email,
    avatarUrl: backendUser.avatar_url ?? null,
    id: backendUser.id,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthHook();

  const login = useCallback(
    (email: string, password: string) => {
      const data: AccessToken = { username: email, password };
      auth.loginMutation.mutate(data);
    },
    [auth.loginMutation],
  );

  const register = useCallback(
    (name: string, email: string, password: string) => {
      const data: UserRegister = { full_name: name, email, password };
      auth.signUpMutation.mutate(data);
    },
    [auth.signUpMutation],
  );

  const recoverPassword = useCallback(
    (email: string, options?: MutationOptions) => {
      auth.recoverPasswordMutation.mutate(email, {
        onSuccess: options?.onSuccess,
        onError: options?.onError,
      });
    },
    [auth.recoverPasswordMutation],
  );

  const resetPassword = useCallback(
    (token: string, password: string, options?: MutationOptions) => {
      auth.resetPasswordMutation.mutate(
        { token, newPassword: password },
        {
          onSuccess: options?.onSuccess,
          onError: options?.onError,
        },
      );
    },
    [auth.resetPasswordMutation],
  );

  const logout = useCallback(() => { auth.logout(); }, [auth.logout]);

  const refreshUser = useCallback(() => {
    auth.refreshUser();
  }, [auth.refreshUser]);

  const user = adaptUser(auth.user);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        recoverPassword,
        resetPassword,
        refreshUser,
        isLoading: auth.isLoading,
        isLoggingIn: auth.loginMutation.isPending,
        loginError: auth.loginMutation.error as Error | null,
        isRegistering: auth.signUpMutation.isPending,
        isRecoveringPassword: auth.recoverPasswordMutation.isPending,
        isResettingPassword: auth.resetPasswordMutation.isPending,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside an AuthProvider");
  return ctx;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
}
