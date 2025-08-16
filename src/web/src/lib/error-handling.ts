/**
 * Error handling utilities with retry logic and network error management
 */

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryCondition?: (error: any) => boolean;
}

export interface ErrorContext {
  operation: string;
  userId?: string;
  workspaceId?: string;
  timestamp: string;
  attempt?: number;
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: any
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Enhanced error logger with context
 */
export const errorLogger = {
  log: (error: Error, context: ErrorContext) => {
    const logData = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context,
      timestamp: new Date().toISOString(),
    };
    
    console.error('[ERROR]', JSON.stringify(logData, null, 2));
    
    // In production, you might want to send this to a logging service
    if (process.env.NODE_ENV === 'production') {
      // Send to logging service (e.g., Sentry, LogRocket, etc.)
    }
  },
  
  warn: (message: string, context: Partial<ErrorContext>) => {
    console.warn('[WARNING]', { message, context, timestamp: new Date().toISOString() });
  },
  
  info: (message: string, context: Partial<ErrorContext>) => {
    console.info('[INFO]', { message, context, timestamp: new Date().toISOString() });
  }
};

/**
 * Sleep utility for delays
 */
const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Default retry condition - retry on network errors and 5xx status codes
 */
const defaultRetryCondition = (error: any): boolean => {
  if (error instanceof NetworkError) {
    return !error.statusCode || error.statusCode >= 500;
  }
  
  // Retry on network connectivity issues
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return true;
  }
  
  // Retry on timeout errors
  if (error.name === 'AbortError' || error.message.includes('timeout')) {
    return true;
  }
  
  return false;
};

/**
 * Retry wrapper with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  context: ErrorContext,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    retryCondition = defaultRetryCondition
  } = options;
  
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await operation();
      
      if (attempt > 1) {
        errorLogger.info(
          `Operation succeeded after ${attempt} attempts`,
          { ...context, attempt }
        );
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      const errorContext = { ...context, attempt };
      
      if (attempt === maxAttempts || !retryCondition(error)) {
        errorLogger.log(error as Error, errorContext);
        throw error;
      }
      
      const delay = Math.min(
        baseDelay * Math.pow(backoffFactor, attempt - 1),
        maxDelay
      );
      
      errorLogger.warn(
        `Operation failed, retrying in ${delay}ms (attempt ${attempt}/${maxAttempts})`,
        errorContext
      );
      
      await sleep(delay);
    }
  }
  
  throw lastError;
}

/**
 * Enhanced fetch wrapper with retry and error handling
 */
export async function enhancedFetch(
  url: string,
  options: RequestInit = {},
  context: ErrorContext,
  retryOptions?: RetryOptions
): Promise<Response> {
  return withRetry(
    async () => {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });
        
        if (!response.ok) {
          throw new NetworkError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status
          );
        }
        
        return response;
      } catch (error) {
        if (error instanceof NetworkError) {
          throw error;
        }
        
        // Handle network connectivity issues
        throw new NetworkError(
          'Network request failed',
          undefined,
          error
        );
      }
    },
    context,
    retryOptions
  );
}

/**
 * Supabase error handler
 */
export function handleSupabaseError(error: any, operation: string): never {
  const context: ErrorContext = {
    operation,
    timestamp: new Date().toISOString()
  };
  
  if (error?.code === 'PGRST116') {
    const authError = new AuthenticationError(
      'Authentication required or session expired',
      error
    );
    errorLogger.log(authError, context);
    throw authError;
  }
  
  if (error?.code === '23505') {
    const validationError = new ValidationError(
      'Duplicate entry - this record already exists',
      error.details
    );
    errorLogger.log(validationError, context);
    throw validationError;
  }
  
  if (error?.code === '42501') {
    const authError = new AuthenticationError(
      'Insufficient permissions for this operation',
      error
    );
    errorLogger.log(authError, context);
    throw authError;
  }
  
  // Generic database error
  const dbError = new Error(
    error?.message || 'Database operation failed'
  );
  errorLogger.log(dbError, context);
  throw dbError;
}

/**
 * Milvus error handler
 */
export function handleMilvusError(error: any, operation: string): never {
  const context: ErrorContext = {
    operation,
    timestamp: new Date().toISOString()
  };
  
  if (error?.code === 1) {
    const networkError = new NetworkError(
      'Failed to connect to Milvus cluster',
      undefined,
      error
    );
    errorLogger.log(networkError, context);
    throw networkError;
  }
  
  if (error?.code === 5) {
    const validationError = new ValidationError(
      'Invalid collection schema or parameters',
      error.reason
    );
    errorLogger.log(validationError, context);
    throw validationError;
  }
  
  // Generic Milvus error
  const milvusError = new Error(
    error?.reason || error?.message || 'Milvus operation failed'
  );
  errorLogger.log(milvusError, context);
  throw milvusError;
}

/**
 * Global error boundary helper
 */
export function createErrorBoundary(componentName: string) {
  return (error: Error) => {
    errorLogger.log(error, {
      operation: `React Error Boundary: ${componentName}`,
      timestamp: new Date().toISOString()
    });
  };
}