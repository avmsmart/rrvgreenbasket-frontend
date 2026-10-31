import { apiClient, setAuthToken, removeAuthToken, getAuthToken } from "./api-client";
import { AdminUser, LoginCredentials, AuthResponse } from "@/types";
import { MOCK_ADMIN_USER_DATA } from "@/data";

export const authService = {
  /**
   * Authenticate admin user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const fallback: AuthResponse = {
      user: MOCK_ADMIN_USER_DATA,
      token: "mock-jwt-token-" + Date.now(),
      expiresIn: 86400,
    };

    const response = await apiClient.post<AuthResponse>(
      "/auth/login",
      credentials,
      { skipAuth: true },
      fallback
    );

    if (response?.token) {
      setAuthToken(response.token, response.refreshToken);
    }

    return response;
  },

  /**
   * Log out admin user and clear tokens
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout", {}, {}, {});
    } catch {
      // Ignore network error on logout
    } finally {
      removeAuthToken();
    }
  },

  /**
   * Fetch currently logged-in administrator profile
   */
  async getCurrentUser(): Promise<AdminUser> {
    return apiClient.get<AdminUser>("/auth/me", {}, MOCK_ADMIN_USER_DATA);
  },

  /**
   * Update admin profile
   */
  async updateProfile(updates: Partial<AdminUser>): Promise<AdminUser> {
    const fallback: AdminUser = {
      ...MOCK_ADMIN_USER_DATA,
      ...updates,
    };

    return apiClient.put<AdminUser>("/auth/profile", updates, {}, fallback);
  },

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    return !!getAuthToken();
  },
};
