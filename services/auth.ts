import { api, ApiError, LoginRequest, LoginResponse, UserInfo } from "./api";
import { storage } from "./storage";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user";
const TENANT_ID_KEY = "tenant_id";
const EMPLOYEE_ID_KEY = "employee_id";

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

    // Store and set tenant ID
    if (user.tenantId) {
      await storage.setItem(TENANT_ID_KEY, user.tenantId);
      api.setTenantId(user.tenantId);
    }

    // Store and set employee ID (user.id)
    if (user.id) {
      await storage.setItem(EMPLOYEE_ID_KEY, user.id);
      api.setEmployeeId(user.id);
    }

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

    // Update tenant ID
    if (user.tenantId) {
      await storage.setItem(TENANT_ID_KEY, user.tenantId);
      api.setTenantId(user.tenantId);
    }

    // Update employee ID
    if (user.id) {
      await storage.setItem(EMPLOYEE_ID_KEY, user.id);
      api.setEmployeeId(user.id);
    }

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
    await storage.removeItem(TENANT_ID_KEY);
    await storage.removeItem(EMPLOYEE_ID_KEY);
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
      const tenantId = await storage.getItem(TENANT_ID_KEY);
      let employeeId = await storage.getItem(EMPLOYEE_ID_KEY);

      // Fallback: get employee ID from stored user if not separately stored
      if (!employeeId) {
        const userJson = await storage.getItem(USER_KEY);
        if (userJson) {
          try {
            const user = JSON.parse(userJson);
            if (user.id) {
              employeeId = user.id;
              await storage.setItem(EMPLOYEE_ID_KEY, employeeId);
            }
          } catch {
            // Ignore parse errors
          }
        }
      }

      if (accessToken && refreshToken) {
        api.setTokens(accessToken, refreshToken);
        if (tenantId) {
          api.setTenantId(tenantId);
        }
        if (employeeId) {
          api.setEmployeeId(employeeId);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
};

export { ApiError };
