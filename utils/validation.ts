/**
 * Validates an email address format
 * @param email - The email address to validate
 * @returns true if the email is valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") {
    return false;
  }

  // RFC 5322 compliant email regex (simplified version)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates that a string is not empty
 * @param value - The string to validate
 * @returns true if the string is not empty, false otherwise
 */
export function isNotEmpty(value: string): boolean {
  return value !== null && value !== undefined && value.trim().length > 0;
}

/**
 * Validates minimum length of a string
 * @param value - The string to validate
 * @param minLength - Minimum required length
 * @returns true if the string meets minimum length, false otherwise
 */
export function hasMinLength(value: string, minLength: number): boolean {
  return value !== null && value !== undefined && value.length >= minLength;
}

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Validates login form fields
 * @param email - The email/username
 * @param password - The password
 * @returns ValidationResult with isValid flag and optional error message
 */
export function validateLoginForm(email: string, password: string): ValidationResult {
  if (!isNotEmpty(email)) {
    return { isValid: false, message: "Email is required" };
  }

  if (!isNotEmpty(password)) {
    return { isValid: false, message: "Password is required" };
  }

  return { isValid: true };
}
