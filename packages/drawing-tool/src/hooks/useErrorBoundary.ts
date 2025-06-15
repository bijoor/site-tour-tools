import { useState, useCallback } from 'react';

interface ErrorInfo {
  message: string;
  stack?: string;
  timestamp: number;
}

export const useErrorBoundary = () => {
  const [error, setError] = useState<ErrorInfo | null>(null);

  const captureError = useCallback((error: Error | string, context?: string) => {
    const errorInfo: ErrorInfo = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      timestamp: Date.now(),
    };

    console.error(`[Error${context ? ` in ${context}` : ''}]:`, errorInfo);
    setError(errorInfo);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleAsyncError = useCallback(async <T>(
    promise: Promise<T>,
    context?: string
  ): Promise<T | null> => {
    try {
      return await promise;
    } catch (error) {
      captureError(error as Error, context);
      return null;
    }
  }, [captureError]);

  return {
    error,
    captureError,
    clearError,
    handleAsyncError,
  };
};