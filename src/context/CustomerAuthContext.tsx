"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CustomerUser,
  CustomerRegisterSendOtpRequest,
  CustomerRegisterVerifyOtpRequest,
  OtpDispatchData,
  CustomerAuthData,
} from "@/types/customer-auth";
import {
  customerAuthService,
  customerTokenStorage,
} from "@/services/customer-auth.service";

interface CustomerAuthContextType {
  customer: CustomerUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginSendOtp: (mobileNumber: string) => Promise<OtpDispatchData>;
  loginVerifyOtp: (mobileNumber: string, otp: string) => Promise<CustomerAuthData>;
  registerSendOtp: (data: CustomerRegisterSendOtpRequest) => Promise<OtpDispatchData>;
  registerVerifyOtp: (data: CustomerRegisterVerifyOtpRequest) => Promise<CustomerAuthData>;
  refreshToken: () => Promise<CustomerAuthData>;
  logout: () => Promise<void>;
  updateProfile: (updatedData: Partial<CustomerUser>) => CustomerUser | null;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export const CustomerAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync state from storage
  const syncFromStorage = useCallback(() => {
    const token = customerTokenStorage.getAccessToken();
    const user = customerTokenStorage.getUser();

    // Authenticated ONLY if both valid customer token AND real customer user exist
    if (token && user && user.mobileNumber && user.mobileNumber.trim().length > 0) {
      setAccessToken(token);
      setCustomer(user);
    } else {
      // Clear any invalid/dummy session
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("rrv_customer_user");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (!parsed?.mobileNumber || parsed.publicId === "customer") {
              localStorage.removeItem("rrv_customer_user");
            }
          }
        } catch {}
      }
      setAccessToken(null);
      setCustomer(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    syncFromStorage();

    const handleAuthChange = () => {
      syncFromStorage();
    };

    window.addEventListener("rrv:customer:auth:changed", handleAuthChange);
    return () => {
      window.removeEventListener("rrv:customer:auth:changed", handleAuthChange);
    };
  }, [syncFromStorage]);

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

  const loginSendOtp = async (mobileNumber: string): Promise<OtpDispatchData> => {
    return customerAuthService.loginSendOtp(mobileNumber);
  };

  const loginVerifyOtp = async (
    mobileNumber: string,
    otp: string
  ): Promise<CustomerAuthData> => {
    const authData = await customerAuthService.loginVerifyOtp(mobileNumber, otp);
    const resolvedToken = authData.accessToken || customerTokenStorage.getAccessToken();
    const resolvedUser = authData.user || customerTokenStorage.getUser();
    setCustomer(resolvedUser);
    setAccessToken(resolvedToken);
    return authData;
  };

  const registerSendOtp = async (
    data: CustomerRegisterSendOtpRequest
  ): Promise<OtpDispatchData> => {
    return customerAuthService.registerSendOtp(data);
  };

  const registerVerifyOtp = async (
    data: CustomerRegisterVerifyOtpRequest
  ): Promise<CustomerAuthData> => {
    const authData = await customerAuthService.registerVerifyOtp(data);
    const resolvedToken = authData.accessToken || customerTokenStorage.getAccessToken();
    const resolvedUser = authData.user || customerTokenStorage.getUser();
    setCustomer(resolvedUser);
    setAccessToken(resolvedToken);
    return authData;
  };

  const refreshToken = async (): Promise<CustomerAuthData> => {
    const authData = await customerAuthService.refreshTokens();
    setCustomer(authData.user);
    setAccessToken(authData.accessToken);
    return authData;
  };

  const logout = async (): Promise<void> => {
    await customerAuthService.logout();
    setCustomer(null);
    setAccessToken(null);
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        accessToken,
        isAuthenticated: !!accessToken && !!customer && !!customer.mobileNumber,
        isLoading,
        loginSendOtp,
        loginVerifyOtp,
        registerSendOtp,
        registerVerifyOtp,
        refreshToken,
        logout,
        updateProfile,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = (): CustomerAuthContextType => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  }
  return context;
};
