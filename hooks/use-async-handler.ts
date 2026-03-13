import { useCallback, useState } from "react";

import { useToast } from "@/contexts/toast-context";
import { AppError, getSafeErrorMessage, isAuthError, toAppError } from "@/utils/error-handler";

interface AsyncHandlerOptions {
  /**
   * Called on success
   */
  onSuccess?: () => void;

  /**
   * Called on error with the AppError
   */
  onError?: (error: AppError) => void;

  /**
   * Custom success message for toast
   */
  successMessage?: string;

  /**
   * Show error toast automatically (default: true)
   */
  showErrorToast?: boolean;

  /**
   * Show success toast automatically (default: false)
   */
  showSuccessToast?: boolean;

  /**
   * Rethrow the error after handling (default: false)
   */
  rethrow?: boolean;
}

interface AsyncHandlerResult<T> {
  /**
   * Execute the async operation
   */
  execute: (fn: () => Promise<T>) => Promise<T | undefined>;

  /**
   * Loading state
   */
  isLoading: boolean;

  /**
   * Last error that occurred
   */
  error: AppError | null;

  /**
   * Clear the error state
   */
  clearError: () => void;
}

/**
 * Hook for handling async operations with standardized error handling
 *
 * @example
 * const { execute, isLoading, error } = useAsyncHandler({
 *   successMessage: "Product created!",
 *   showSuccessToast: true,
 * });
 *
 * const handleSubmit = async () => {
 *   const result = await execute(async () => {
 *     return await productsService.create(data);
 *   });
 *
 *   if (result) {
 *     router.back();
 *   }
 * };
 */
export function useAsyncHandler<T = void>(
  options: AsyncHandlerOptions = {}
): AsyncHandlerResult<T> {
  const {
    onSuccess,
    onError,
    successMessage,
    showErrorToast = true,
    showSuccessToast = false,
    rethrow = false,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const { showSuccess, showError } = useToast();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const execute = useCallback(
    async (fn: () => Promise<T>): Promise<T | undefined> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fn();

        if (showSuccessToast && successMessage) {
          showSuccess(successMessage);
        }

        onSuccess?.();
        return result;
      } catch (err) {
        const appError = toAppError(err);
        setError(appError);

        if (showErrorToast) {
          showError(getSafeErrorMessage(err));
        }

        onError?.(appError);

        if (rethrow) {
          throw appError;
        }

        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess, onError, successMessage, showErrorToast, showSuccessToast, rethrow, showSuccess, showError]
  );

  return {
    execute,
    isLoading,
    error,
    clearError,
  };
}

/**
 * Simple async wrapper with error handling
 * For one-off async calls that don't need loading state
 *
 * @example
 * const result = await safeAsync(
 *   () => productsService.delete(id),
 *   { onError: (e) => showError(e.message) }
 * );
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  options: {
    onError?: (error: AppError) => void;
    rethrow?: boolean;
  } = {}
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (err) {
    const appError = toAppError(err);
    options.onError?.(appError);

    if (options.rethrow) {
      throw appError;
    }

    return undefined;
  }
}

/**
 * Wrap an async function to automatically handle errors
 *
 * @example
 * const handleDelete = withErrorHandling(
 *   async (id: string) => {
 *     await productsService.delete(id);
 *     showSuccess("Deleted!");
 *   },
 *   { showErrorToast: true }
 * );
 */
export function withErrorHandling<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  options: {
    onError?: (error: AppError) => void;
    rethrow?: boolean;
  } = {}
): (...args: TArgs) => Promise<TResult | undefined> {
  return async (...args: TArgs): Promise<TResult | undefined> => {
    try {
      return await fn(...args);
    } catch (err) {
      const appError = toAppError(err);
      options.onError?.(appError);

      if (options.rethrow) {
        throw appError;
      }

      return undefined;
    }
  };
}

export { isAuthError };
