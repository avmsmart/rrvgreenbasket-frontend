"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  AdminUser,
  LoginCredentials,
  LoginResult,
  TwoFactorVerifyResult,
} from "@/types";
import { authService } from "@/services/auth.service";
import { getAuthToken } from "@/services/api-client";
import {
  MOCK_ADMIN_USER_DATA,
  getSaved2FAEnabled,
  save2FAEnabled,
} from "@/data";

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  is2FAEnabled: boolean;
  set2FAEnabled: (enabled: boolean) => void;
  login: (credentials: LoginCredentials) => Promise<LoginResult>;
  verify2FA: (code: string, tempToken: string, email: string) => Promise<TwoFactorVerifyResult>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [is2FAEnabled, setIs2FAEnabledState] = useState<boolean>(true);

  // Synchronize 2FA preference
  const set2FAEnabled = useCallback((enabled: boolean) => {
    setIs2FAEnabledState(enabled);
    save2FAEnabled(enabled);
    if (user) {
      setUser((prev) => (prev ? { ...prev, twoFactorEnabled: enabled } : null));
    }
  }, [user]);

  // Refresh current user session
  const refreshUser = useCallback(async () => {
    const activeToken = getAuthToken();
    if (!activeToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    setToken(activeToken);
    try {
      const currentUser = await authService.getCurrentUser();
      const current2FA = getSaved2FAEnabled();
      setUser({
        ...currentUser,
        twoFactorEnabled: current2FA,
      });
    } catch {
      setUser(MOCK_ADMIN_USER_DATA);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize session on mount
  useEffect(() => {
    setIs2FAEnabledState(getSaved2FAEnabled());
    refreshUser();

    // Listen for auth change events across tabs and windows
    const handleAuthChange = () => {
      refreshUser();
    };

    const handle2FAChange = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      if (typeof customEvent.detail === "boolean") {
        setIs2FAEnabledState(customEvent.detail);
      }
    };

    window.addEventListener("rrv:auth:changed", handleAuthChange);
    window.addEventListener("rrv:auth:2fa:updated", handle2FAChange);

    return () => {
      window.removeEventListener("rrv:auth:changed", handleAuthChange);
      window.removeEventListener("rrv:auth:2fa:updated", handle2FAChange);
    };
  }, [refreshUser]);

  // Login handler
  const login = async (credentials: LoginCredentials): Promise<LoginResult> => {
    const result = await authService.login(credentials);
    if (result.success && !result.requires2FA) {
      await refreshUser();
    }
    return result;
  };

  // 2FA Verification handler
  const verify2FA = async (
    code: string,
    tempToken: string,
    email: string
  ): Promise<TwoFactorVerifyResult> => {
    const result = await authService.verify2FA({
      code,
      tempToken,
      email,
      rememberDevice: true,
    });

    if (result.success) {
      await refreshUser();
    }

    return result;
  };

  // Logout handler
  const logout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        is2FAEnabled,
        set2FAEnabled,
        login,
        verify2FA,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
