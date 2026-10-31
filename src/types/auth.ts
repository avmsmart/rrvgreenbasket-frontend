export interface AdminUser {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  avatarInitial?: string;
  avatarUrl?: string;
  storeName?: string;
  operatingHours?: string;
  orderCutoff?: string;
  status: string;
  permissions: string[];
  twoFactorEnabled?: boolean;
  lastLogin?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export type LoginStep = "credentials" | "two_factor" | "success";

export interface AuthResponse {
  user: AdminUser;
  token: string;
  refreshToken?: string;
  expiresIn?: number;
  requires2FA?: boolean;
  tempToken?: string;
}

export interface LoginResult {
  success: boolean;
  requires2FA: boolean;
  nextStep: LoginStep;
  tempToken?: string;
  targetEmail?: string;
  targetPhone?: string;
  error?: string;
}

export interface TwoFactorVerifyRequest {
  email: string;
  tempToken: string;
  code: string;
  rememberDevice?: boolean;
}

export interface TwoFactorVerifyResult {
  success: boolean;
  user?: AdminUser;
  token?: string;
  error?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResult {
  success: boolean;
  message: string;
}

export interface RegisterAdminData {
  name: string;
  email: string;
  password: string;
  phone: string;
  storeName?: string;
  role?: string;
  twoFactorEnabled?: boolean;
}

export interface RegisterResult {
  success: boolean;
  user?: AdminUser;
  requires2FA: boolean;
  tempToken?: string;
  error?: string;
}

export interface RegisteredAdminAccount extends AdminUser {
  passwordHash?: string;
  createdAt?: string;
}

