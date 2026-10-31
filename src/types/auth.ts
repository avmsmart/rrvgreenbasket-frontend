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
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  user: AdminUser;
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}
