import { ApiError } from "@/services/api";

interface ApiErrorBody {
  message?: string;
  error?: string;
  errors?: string[];
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    try {
      const body: ApiErrorBody = JSON.parse(error.body);

      if (body.message) {
        return body.message;
      }

      if (body.error) {
        return body.error;
      }

      if (body.errors && body.errors.length > 0) {
        return body.errors.join(", ");
      }
    } catch {
      // Body is not JSON, use raw message
      if (error.body) {
        return error.body;
      }
    }

    // HTTP status-based fallback
    switch (error.status) {
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
      default:
        return `Request failed (${error.status})`;
    }
  }

  if (error instanceof Error) {
    if (error.message.includes("Network request failed")) {
      return "Unable to connect. Please check your internet connection.";
    }
    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
}
