// Error handling utilities

export interface AppError {
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
  stack?: string;
}

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

// Create standardized error object
export function createAppError(
  message: string,
  code?: string,
  details?: any
): AppError {
  return {
    message,
    code,
    details,
    timestamp: new Date(),
    stack: new Error().stack,
  };
}

// Format error for display
export function formatErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return 'An unexpected error occurred';
}

// Extract error details from various error types
export function extractErrorDetails(error: unknown): {
  message: string;
  code?: string;
  details?: any;
} {
  if (typeof error === 'string') {
    return { message: error };
  }
  
  if (error instanceof Error) {
    return {
      message: error.message,
      code: (error as any).code,
      details: (error as any).details,
    };
  }
  
  if (error && typeof error === 'object') {
    const errorObj = error as any;
    return {
      message: errorObj.message || 'An unexpected error occurred',
      code: errorObj.code,
      details: errorObj.details || errorObj,
    };
  }
  
  return { message: 'An unexpected error occurred' };
}

// Handle Supabase auth errors
export function handleAuthError(error: any): string {
  const { message, code } = extractErrorDetails(error);
  
  // Map common Supabase auth error codes to user-friendly messages
  const authErrorMap: Record<string, string> = {
    'invalid_credentials': 'Invalid email or password',
    'email_not_confirmed': 'Please check your email and click the confirmation link',
    'signup_disabled': 'New registrations are currently disabled',
    'email_address_invalid': 'Please enter a valid email address',
    'password_too_short': 'Password must be at least 6 characters long',
    'user_already_registered': 'An account with this email already exists',
    'weak_password': 'Password is too weak. Please choose a stronger password',
    'rate_limit_exceeded': 'Too many attempts. Please try again later',
  };
  
  return authErrorMap[code || ''] || message;
}

// Handle API errors
export function handleApiError(error: any): string {
  const { message, code } = extractErrorDetails(error);
  
  // Map common API error codes
  const apiErrorMap: Record<string, string> = {
    '400': 'Bad request. Please check your input',
    '401': 'You are not authorized to perform this action',
    '403': 'Access denied',
    '404': 'The requested resource was not found',
    '409': 'A conflict occurred. The resource may already exist',
    '422': 'Invalid data provided',
    '429': 'Too many requests. Please try again later',
    '500': 'Server error. Please try again later',
    '502': 'Service temporarily unavailable',
    '503': 'Service temporarily unavailable',
  };
  
  return apiErrorMap[code || ''] || message;
}

// Log error with context
export function logError(
  error: unknown,
  context?: ErrorContext
): void {
  const errorDetails = extractErrorDetails(error);
  const logData = {
    ...errorDetails,
    context,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
  };
  
  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('Application Error:', logData);
  }
  
  // In production, you might want to send to an error tracking service
  // Example: Sentry, LogRocket, etc.
}

// Retry wrapper for async operations
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
}

// Check if error is retryable
export function isRetryableError(error: unknown): boolean {
  const { code } = extractErrorDetails(error);
  
  // Network errors and server errors are typically retryable
  const retryableCodes = ['500', '502', '503', '504', 'NETWORK_ERROR', 'TIMEOUT'];
  
  return retryableCodes.includes(code || '');
}

// Create error boundary fallback props
export function createErrorBoundaryFallback(error: Error, errorInfo?: any) {
  return {
    error: {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
    },
    timestamp: new Date().toISOString(),
  };
}

// Validate and sanitize error message for display
export function sanitizeErrorMessage(message: string): string {
  // Remove sensitive information patterns
  return message
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[email]')
    .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[card]')
    .replace(/\b(?:password|token|key|secret)\s*[:=]\s*\S+/gi, '[redacted]');
}