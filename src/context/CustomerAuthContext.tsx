"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import {
  CustomerUser,
  CustomerEmailRegisterSendOtpRequest,
  CustomerEmailRegisterVerifyOtpRequest,
  CustomerEmailLoginRequest,
  CustomerForgotPasswordResetRequest,
  OtpDispatchData,
  CustomerAuthData,
} from "@/types/customer-auth";
import {
  customerAuthService,
  customerTokenStorage,
  CustomerAuthError,
} from "@/services/customer-auth.service";

interface CustomerAuthContextType {
  customer: CustomerUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<CustomerAuthData>;
  registerSendOtp: (data: CustomerEmailRegisterSendOtpRequest) => Promise<OtpDispatchData>;
  registerVerifyOtp: (data: CustomerEmailRegisterVerifyOtpRequest) => Promise<CustomerAuthData>;
  forgotPasswordSendOtp: (email: string) => Promise<OtpDispatchData>;
  forgotPasswordVerifyOtp: (email: string, otp: string) => Promise<any>;
  forgotPasswordReset: (data: CustomerForgotPasswordResetRequest) => Promise<any>;
  refreshToken: () => Promise<CustomerAuthData>;
  logout: () => Promise<void>;
  updateProfile: (updatedData: Partial<CustomerUser>) => CustomerUser | null;
  // Legacy aliases for backward compatibility
  loginSendOtp: (mobileNumber: string) => Promise<OtpDispatchData>;
  loginVerifyOtp: (mobileNumber: string, otp: string) => Promise<CustomerAuthData>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export const CustomerAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Proactive token refresh timer setup
  const scheduleProactiveRefresh = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    const expiresAt = customerTokenStorage.getExpiresAt();
    const token = customerTokenStorage.getAccessToken();
    const refreshTokenVal = customerTokenStorage.getRefreshToken();

    if (!token || !refreshTokenVal || !expiresAt) return;

    // Refresh 60 seconds before expiration, or in 10s if already close
    const timeUntilRefresh = Math.max(10000, expiresAt - Date.now() - 60000);

    refreshTimerRef.current = setTimeout(async () => {
      try {
        const refreshed = await customerAuthService.refreshTokens();
        setAccessToken(refreshed.accessToken);
        setCustomer(refreshed.user);
        scheduleProactiveRefresh();
      } catch (err) {
        console.warn("[CustomerAuthContext] Proactive refresh error:", err);
      }
    }, timeUntilRefresh);
  }, []);

  // Sync state from storage
  const syncFromStorage = useCallback(() => {
    const token = customerTokenStorage.getAccessToken();
    const user = customerTokenStorage.getUser();

    if (token && user) {
      setAccessToken(token);
      setCustomer(user);
      scheduleProactiveRefresh();
    } else {
      setAccessToken(null);
      setCustomer(null);
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    }
    setIsLoading(false);
  }, [scheduleProactiveRefresh]);

  useEffect(() => {
    syncFromStorage();

    const handleAuthChange = () => {
      syncFromStorage();
    };

    window.addEventListener("rrv:customer:auth:changed", handleAuthChange);
    return () => {
      window.removeEventListener("rrv:customer:auth:changed", handleAuthChange);
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [syncFromStorage]);

  /**
   * CUSTOMER EMAIL / PASSWORD LOGIN
   */
  const login = async (email: string, password: string): Promise<CustomerAuthData> => {
    setIsLoading(true);
    try {
      const authData = await customerAuthService.emailLogin({ email, password });
      const resolvedToken = authData.accessToken || customerTokenStorage.getAccessToken();
      const resolvedUser = authData.user || customerTokenStorage.getUser();
      setCustomer(resolvedUser);
      setAccessToken(resolvedToken);
      scheduleProactiveRefresh();
      return authData;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * CUSTOMER REGISTRATION - SEND OTP
   */
  const registerSendOtp = async (
    data: CustomerEmailRegisterSendOtpRequest
  ): Promise<OtpDispatchData> => {
    return customerAuthService.emailRegisterSendOtp(data);
  };

  /**
   * CUSTOMER REGISTRATION - VERIFY OTP
   */
  const registerVerifyOtp = async (
    data: CustomerEmailRegisterVerifyOtpRequest
  ): Promise<CustomerAuthData> => {
    setIsLoading(true);
    try {
      const authData = await customerAuthService.emailRegisterVerifyOtp(data);
      const resolvedToken = authData.accessToken || customerTokenStorage.getAccessToken();
      const resolvedUser = authData.user || customerTokenStorage.getUser();
      setCustomer(resolvedUser);
      setAccessToken(resolvedToken);
      scheduleProactiveRefresh();
      return authData;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * FORGOT PASSWORD - SEND OTP
   */
  const forgotPasswordSendOtp = async (email: string): Promise<OtpDispatchData> => {
    return customerAuthService.forgotPasswordSendOtp(email);
  };

  /**
   * FORGOT PASSWORD - VERIFY OTP
   */
  const forgotPasswordVerifyOtp = async (email: string, otp: string): Promise<any> => {
    return customerAuthService.forgotPasswordVerifyOtp(email, otp);
  };

  /**
   * FORGOT PASSWORD - RESET
   */
  const forgotPasswordReset = async (
    data: CustomerForgotPasswordResetRequest
  ): Promise<any> => {
    return customerAuthService.forgotPasswordReset(data);
  };

  /**
   * TOKEN REFRESH
   */
  const refreshToken = async (): Promise<CustomerAuthData> => {
    const authData = await customerAuthService.refreshTokens();
    setCustomer(authData.user);
    setAccessToken(authData.accessToken);
    scheduleProactiveRefresh();
    return authData;
  };

  /**
   * LOGOUT
   */
  const logout = async (): Promise<void> => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    await customerAuthService.logout();
    setCustomer(null);
    setAccessToken(null);
  };

  /**
   * UPDATE PROFILE
   */
  const updateProfile = useCallback(
    (updatedData: Partial<CustomerUser>): CustomerUser | null => {
      const updated = customerAuthService.updateProfile(updatedData);
      if (updated) {
        setCustomer(updated);
      }
      return updated;
    },
    []
  );

  // Backward-compatibility aliases
  const loginSendOtp = async (mobileNumber: string): Promise<OtpDispatchData> => {
    return customerAuthService.loginSendOtp(mobileNumber);
  };
  const loginVerifyOtp = async (mobileNumber: string, otp: string): Promise<CustomerAuthData> => {
    return customerAuthService.loginVerifyOtp(mobileNumber, otp);
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        accessToken,
        isAuthenticated: Boolean(accessToken && customer),
        isLoading,
        login,
        registerSendOtp,
        registerVerifyOtp,
        forgotPasswordSendOtp,
        forgotPasswordVerifyOtp,
        forgotPasswordReset,
        refreshToken,
        logout,
        updateProfile,
        loginSendOtp,
        loginVerifyOtp,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = (): CustomerAuthContextType => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error(
      "useCustomerAuth must be used within a CustomerAuthProvider"
    );
  }
  return context;
};

export default CustomerAuthContext;
