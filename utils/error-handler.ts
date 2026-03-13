import { ApiError } from "@/services/api";
import {
  AppError,
  AuthenticationError,
  ConflictError,
  ErrorCode,
  NetworkError,
  NotFoundError,
  ServerError,
  ValidationError,
} from "./errors";

interface ApiErrorBody {
  message?: string | { message?: string; code?: string };
  error?: string;
  errors?: string[];
  code?: string;
  timestamp?: string;
}

/**
 * Safely extracts a string message from a value that could be string or object
 */
function extractMessage(value: unknown): string | null {
  if (typeof value === "string") {
    return value;
  }
  if (value && typeof value === "object" && "message" in value) {
    const msg = (value as { message?: unknown }).message;
    if (typeof msg === "string") {
      return msg;
    }
  }
  return null;
}

/**
 * Parse API error body to extract message
 */
function parseApiErrorBody(body: string): string | null {
  try {
    const parsed: ApiErrorBody = JSON.parse(body);

    // Handle message (can be string or object with message property)
    const message = extractMessage(parsed.message);
    if (message) {
      return message;
    }

    // Handle error field
    const errorMsg = extractMessage(parsed.error);
    if (errorMsg) {
      return errorMsg;
    }

    // Handle errors array
    if (parsed.errors && Array.isArray(parsed.errors) && parsed.errors.length > 0) {
      return parsed.errors.filter((e) => typeof e === "string").join(", ");
    }

    return null;
  } catch {
    // Body is not JSON, return raw if it's a string
    if (body && typeof body === "string" && body.length < 200) {
      return body;
    }
    return null;
  }
}

/**
 * Get user-friendly message for HTTP status codes
 */
function getStatusMessage(status: number): string {
  switch (status) {
    case 400:
      return "Invalid request. Please check your input.";
    case 401:
      return "Session expired. Please log in again.";
    case 403:
      return "You don't have permission to perform this action.";
    case 404:
      return "The requested resource was not found.";
    case 409:
      return "This item already exists.";
    case 422:
      return "Validation error. Please check your input.";
    case 500:
      return "Server error. Please try again later.";
    case 503:
      return "Service temporarily unavailable. Please try again later.";
    default:
      return `Request failed (${status})`;
  }
}

/**
 * Get error code from HTTP status
 */
function getErrorCodeFromStatus(status: number): ErrorCode {
  switch (status) {
    case 401:
      return ErrorCode.UNAUTHORIZED;
    case 403:
      return ErrorCode.FORBIDDEN;
    case 404:
      return ErrorCode.NOT_FOUND;
    case 409:
      return ErrorCode.CONFLICT;
    case 422:
    case 400:
      return ErrorCode.VALIDATION_ERROR;
    case 500:
      return ErrorCode.SERVER_ERROR;
    case 503:
      return ErrorCode.SERVICE_UNAVAILABLE;
    default:
      return ErrorCode.UNKNOWN_ERROR;
  }
}

/**
 * Convert any error to AppError
 */
export function toAppError(error: unknown): AppError {
  // Already an AppError
  if (error instanceof AppError) {
    return error;
  }

  // API Error from our client
  if (error instanceof ApiError) {
    const message = parseApiErrorBody(error.body) || getStatusMessage(error.status);
    const code = getErrorCodeFromStatus(error.status);

    return new AppError({
      code,
      message,
      statusCode: error.status,
      originalError: error,
    });
  }

  // Standard Error
  if (error instanceof Error) {
    // Network errors
    if (
      error.message.includes("Network request failed") ||
      error.message.includes("Failed to fetch")
    ) {
      return new NetworkError();
    }

    // Timeout errors
    if (error.message.includes("timeout") || error.message.includes("Timeout")) {
      return new AppError({
        code: ErrorCode.TIMEOUT_ERROR,
        message: "Request timed out. Please try again.",
        originalError: error,
      });
    }

    return new AppError({
      code: ErrorCode.UNKNOWN_ERROR,
      message: error.message,
      originalError: error,
    });
  }

  // Object with message property
  if (error && typeof error === "object") {
    const msg = extractMessage(error);
    if (msg) {
      return new AppError({
        code: ErrorCode.UNKNOWN_ERROR,
        message: msg,
        originalError: error,
      });
    }
  }

  // Unknown error type
  return new AppError({
    code: ErrorCode.UNKNOWN_ERROR,
    message: "An unexpected error occurred. Please try again.",
    originalError: error,
  });
}

/**
 * Extract error message from any error type
 * @deprecated Use toAppError(error).message instead
 */
export function getErrorMessage(error: unknown): string {
  return toAppError(error).message;
}

/**
 * Safe wrapper to ensure we always get a string message
 * Use this in catch blocks for toast messages
 */
export function getSafeErrorMessage(error: unknown): string {
  try {
    const appError = toAppError(error);
    return typeof appError.message === "string"
      ? appError.message
      : "An unexpected error occurred. Please try again.";
  } catch {
    return "An unexpected error occurred. Please try again.";
  }
}

/**
 * Check if error requires re-authentication
 */
export function isAuthError(error: unknown): boolean {
  const appError = toAppError(error);
  return appError.isAuthError();
}

/**
 * Check if error is a network connectivity issue
 */
export function isNetworkError(error: unknown): boolean {
  const appError = toAppError(error);
  return appError.isNetworkError();
}

// Re-export error types for convenience
export {
  AppError,
  AuthenticationError,
  ConflictError,
  ErrorCode,
  NetworkError,
  NotFoundError,
  ServerError,
  ValidationError,
};
