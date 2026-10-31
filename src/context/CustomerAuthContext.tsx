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
    setAccessToken(token);
    setCustomer(user);
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
    setCustomer(authData.user);
    setAccessToken(authData.accessToken);
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
    setCustomer(authData.user);
    setAccessToken(authData.accessToken);
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
        isAuthenticated: !!accessToken,
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
