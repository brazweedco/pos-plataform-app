const API_BASE_URL = "http://localhost:8080";

interface ApiResponse<T> {
  data: T;
  timestamp: string;
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tenantId: string | null = null;
  private refreshPromise: Promise<boolean> | null = null;

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  setTenantId(tenantId: string | null) {
    this.tenantId = tenantId;
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tenantId = null;
  }

  getAccessToken() {
    return this.accessToken;
  }

  getRefreshToken() {
    return this.refreshToken;
  }

  getTenantId() {
    return this.tenantId;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { skipAuth = false, ...fetchOptions } = options;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(fetchOptions.headers || {}),
    };

    if (!skipAuth && this.accessToken) {
      (headers as Record<string, string>)["Authorization"] =
        `Bearer ${this.accessToken}`;
    }

    // Add X-Tenant-ID header if available
    if (this.tenantId) {
      (headers as Record<string, string>)["X-Tenant-ID"] = this.tenantId;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    // If unauthorized and we have refresh token, try to refresh
    if (response.status === 401 && this.refreshToken && !skipAuth) {
      const refreshed = await this.tryRefreshToken();
      if (refreshed) {
        // Retry original request with new token
        (headers as Record<string, string>)["Authorization"] =
          `Bearer ${this.accessToken}`;
        const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...fetchOptions,
          headers,
        });
        if (!retryResponse.ok) {
          throw new ApiError(retryResponse.status, await retryResponse.text());
        }
        return retryResponse.json();
      }
    }

    if (!response.ok) {
      throw new ApiError(response.status, await response.text());
    }

    return response.json();
  }

  private async tryRefreshToken(): Promise<boolean> {
    // Prevent multiple refresh calls
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const response = await this.request<LoginResponse>(
          "/api/v1/auth/refresh",
          {
            method: "POST",
            body: JSON.stringify({ refreshToken: this.refreshToken }),
            skipAuth: true,
          }
        );
        this.setTokens(response.data.accessToken, response.data.refreshToken);
        if (response.data.user?.tenantId) {
          this.setTenantId(response.data.user.tenantId);
        }
        return true;
      } catch {
        this.clearTokens();
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  // Public methods
  async get<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: string
  ) {
    super(`API Error ${status}: ${body}`);
    this.name = "ApiError";
  }
}

// Types
export interface UserInfo {
  id: string;
  email: string;
  name?: string;
  role?: string;
  tenantId?: string;
  tenantName?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserInfo;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Singleton instance
export const api = new ApiClient();
