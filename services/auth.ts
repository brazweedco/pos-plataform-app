import { api, ApiError, LoginRequest, LoginResponse, UserInfo } from "./api";
import { storage } from "./storage";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user";

export const authService = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>(
      "/api/v1/auth/login",
      credentials,
      { skipAuth: true }
    );

    const { accessToken, refreshToken, user } = response.data;

    // Store tokens
    await storage.setItem(ACCESS_TOKEN_KEY, accessToken);
    await storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    await storage.setItem(USER_KEY, JSON.stringify(user));

    // Set tokens in API client
    api.setTokens(accessToken, refreshToken);

    return response.data;
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<LoginResponse> {
    const refreshToken = await storage.getItem(REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await api.post<LoginResponse>(
      "/api/v1/auth/refresh",
      { refreshToken },
      { skipAuth: true }
    );

    const { accessToken, refreshToken: newRefreshToken, user } = response.data;

    // Update stored tokens
    await storage.setItem(ACCESS_TOKEN_KEY, accessToken);
    await storage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
    await storage.setItem(USER_KEY, JSON.stringify(user));

    // Update API client
    api.setTokens(accessToken, newRefreshToken);

    return response.data;
  },

  /**
   * Logout and clear all stored data
   */
  async logout(): Promise<void> {
    await storage.removeItem(ACCESS_TOKEN_KEY);
    await storage.removeItem(REFRESH_TOKEN_KEY);
    await storage.removeItem(USER_KEY);
    api.clearTokens();
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const accessToken = await storage.getItem(ACCESS_TOKEN_KEY);
    return !!accessToken;
  },

  /**
   * Get stored user info
   */
  async getUser(): Promise<UserInfo | null> {
    const userJson = await storage.getItem(USER_KEY);
    if (!userJson) return null;
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  },

  /**
   * Initialize auth state from storage (call on app start)
   */
  async initialize(): Promise<boolean> {
    try {
      const accessToken = await storage.getItem(ACCESS_TOKEN_KEY);
      const refreshToken = await storage.getItem(REFRESH_TOKEN_KEY);

      if (accessToken && refreshToken) {
        api.setTokens(accessToken, refreshToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
};

export { ApiError };
