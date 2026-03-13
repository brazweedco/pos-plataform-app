/**
 * Utils barrel export
 * Import utilities from "@/utils" instead of individual files
 */

// Error handling
export {
  AppError,
  AuthenticationError,
  ConflictError,
  ErrorCode,
  getSafeErrorMessage,
  getErrorMessage,
  isAuthError,
  isNetworkError,
  NetworkError,
  NotFoundError,
  ServerError,
  toAppError,
  ValidationError,
} from "./error-handler";

// Validation
export {
  hasMinLength,
  isNotEmpty,
  isValidEmail,
  validateLoginForm,
  type ValidationResult,
} from "./validation";
