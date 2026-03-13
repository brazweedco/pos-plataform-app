/**
 * Custom Error Types
 * Market-standard error classes for different scenarios
 */

export enum ErrorCode {
  // Network errors
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",

  // Authentication errors
  UNAUTHORIZED = "UNAUTHORIZED",
  SESSION_EXPIRED = "SESSION_EXPIRED",
  FORBIDDEN = "FORBIDDEN",

  // Validation errors
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",

  // Resource errors
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",

  // Server errors
  SERVER_ERROR = "SERVER_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",

  // Unknown
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export interface ErrorDetails {
  code: ErrorCode;
  message: string;
  originalError?: unknown;
  field?: string;
  statusCode?: number;
}

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode?: number;
  public readonly field?: string;
  public readonly originalError?: unknown;

  constructor(details: ErrorDetails) {
    super(details.message);
    this.name = "AppError";
    this.code = details.code;
    this.statusCode = details.statusCode;
    this.field = details.field;
    this.originalError = details.originalError;

    // Maintains proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * Check if error is a specific type
   */
  is(code: ErrorCode): boolean {
    return this.code === code;
  }

  /**
   * Check if error is an authentication error
   */
  isAuthError(): boolean {
    return [
      ErrorCode.UNAUTHORIZED,
      ErrorCode.SESSION_EXPIRED,
      ErrorCode.FORBIDDEN,
    ].includes(this.code);
  }

  /**
   * Check if error is a validation error
   */
  isValidationError(): boolean {
    return [ErrorCode.VALIDATION_ERROR, ErrorCode.INVALID_INPUT].includes(
      this.code
    );
  }

  /**
   * Check if error is a network error
   */
  isNetworkError(): boolean {
    return [ErrorCode.NETWORK_ERROR, ErrorCode.TIMEOUT_ERROR].includes(
      this.code
    );
  }
}

/**
 * Network error - connection issues
 */
export class NetworkError extends AppError {
  constructor(message = "Unable to connect. Please check your internet connection.") {
    super({
      code: ErrorCode.NETWORK_ERROR,
      message,
    });
    this.name = "NetworkError";
  }
}

/**
 * Authentication error - unauthorized access
 */
export class AuthenticationError extends AppError {
  constructor(
    message = "Session expired. Please log in again.",
    code: ErrorCode = ErrorCode.UNAUTHORIZED
  ) {
    super({
      code,
      message,
      statusCode: 401,
    });
    this.name = "AuthenticationError";
  }
}

/**
 * Validation error - invalid input
 */
export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super({
      code: ErrorCode.VALIDATION_ERROR,
      message,
      field,
      statusCode: 422,
    });
    this.name = "ValidationError";
  }
}

/**
 * Not found error - resource doesn't exist
 */
export class NotFoundError extends AppError {
  constructor(message = "The requested resource was not found.") {
    super({
      code: ErrorCode.NOT_FOUND,
      message,
      statusCode: 404,
    });
    this.name = "NotFoundError";
  }
}

/**
 * Conflict error - resource already exists
 */
export class ConflictError extends AppError {
  constructor(message = "This item already exists.") {
    super({
      code: ErrorCode.CONFLICT,
      message,
      statusCode: 409,
    });
    this.name = "ConflictError";
  }
}

/**
 * Server error - backend issues
 */
export class ServerError extends AppError {
  constructor(message = "Server error. Please try again later.") {
    super({
      code: ErrorCode.SERVER_ERROR,
      message,
      statusCode: 500,
    });
    this.name = "ServerError";
  }
}
