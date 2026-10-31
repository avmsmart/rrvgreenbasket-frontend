export interface CustomerUser {
  publicId: string;
  email: string;
  mobileNumber: string;
  role: "CUSTOMER" | "ADMIN" | "USER" | string;
  status: "PENDING" | "ACTIVE" | "BLOCKED" | "DISABLED" | string;
  roles?: string[];
  fullName?: string;
  avatarUrl?: string;
}

export interface CustomerRegisterSendOtpRequest {
  fullName: string;
  mobileNumber: string;
  email?: string;
}

export interface CustomerRegisterVerifyOtpRequest {
  mobileNumber: string;
  otp: string;
  fullName?: string;
  email?: string;
}

export interface CustomerLoginSendOtpRequest {
  mobileNumber: string;
}

export interface CustomerLoginVerifyOtpRequest {
  mobileNumber: string;
  otp: string;
}

export interface OtpDispatchData {
  email: string;
  expiresInMinutes: number;
  cooldownSeconds: number;
  message: string;
  retryAfterSeconds?: number;
}

export interface CustomerAuthData {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: CustomerUser;
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

export interface CustomerAuthSession {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresAt: number;
  user: CustomerUser;
}
