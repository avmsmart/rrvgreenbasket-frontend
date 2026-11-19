export interface CustomerUser {
  publicId: string;
  email: string;
  mobileNumber?: string;
  role: "CUSTOMER" | "ADMIN" | "USER" | string;
  status: "PENDING" | "ACTIVE" | "BLOCKED" | "DISABLED" | string;
  roles?: string[];
  fullName?: string;
  avatarUrl?: string;
}

export interface CustomerEmailRegisterSendOtpRequest {
  fullName: string;
  mobileNumber: string;
  email: string;
  password: string;
}

export interface CustomerEmailRegisterVerifyOtpRequest {
  email: string;
  otp: string;
  mobileNumber?: string;
  fullName?: string;
}

export interface CustomerEmailLoginRequest {
  email: string;
  password: string;
}

export interface CustomerForgotPasswordSendOtpRequest {
  email: string;
}

export interface CustomerForgotPasswordVerifyOtpRequest {
  email: string;
  otp: string;
}

export interface CustomerForgotPasswordResetRequest {
  resetToken?: string;
  newPassword?: string;
  confirmPassword?: string;
  email?: string;
  otp?: string;
  password?: string;
}

export interface CustomerRefreshTokenRequest {
  refreshToken: string;
}

export interface CustomerLogoutRequest {
  refreshToken: string;
}

export interface CustomerLogoutData {
  loggedOut: boolean;
}

export interface OtpDispatchData {
  email?: string;
  mobileNumber?: string;
  expiresInMinutes?: number;
  cooldownSeconds?: number;
  message?: string;
  retryAfterSeconds?: number;
}

export interface CustomerAuthData {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: CustomerUser;
}

export interface CustomerAuthSession {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresAt: number;
  user: CustomerUser;
}

// Backward-compatibility aliases for any legacy imports
export type CustomerRegisterSendOtpRequest = CustomerEmailRegisterSendOtpRequest;
export type CustomerRegisterVerifyOtpRequest = CustomerEmailRegisterVerifyOtpRequest;
export type CustomerLoginSendOtpRequest = { mobileNumber?: string; email?: string };
export type CustomerLoginVerifyOtpRequest = { mobileNumber?: string; email?: string; otp: string };
