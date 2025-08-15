// Debug utility functions and tracking

import { debugLogger } from './debug-logger';

// Convenience functions
export const debug = {
  log: (message: string, data?: any, context?: string) => 
    debugLogger.debug(message, data, context),
  info: (message: string, data?: any, context?: string) => 
    debugLogger.info(message, data, context),
  warn: (message: string, data?: any, context?: string) => 
    debugLogger.warn(message, data, context),
  error: (message: string, data?: any, context?: string) => 
    debugLogger.error(message, data, context),
  clear: () => debugLogger.clearLogs(),
  export: () => debugLogger.exportLogs(),
  getLogs: () => debugLogger.getLogs(),
};

// Performance monitoring
export function measurePerformance<T>(
  name: string,
  fn: () => T,
  context?: string
): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  debugLogger.debug(
    `Performance: ${name} took ${(end - start).toFixed(2)}ms`,
    { duration: end - start },
    context || 'performance'
  );
  
  return result;
}

// Async performance monitoring
export async function measureAsyncPerformance<T>(
  name: string,
  fn: () => Promise<T>,
  context?: string
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  
  debugLogger.debug(
    `Async Performance: ${name} took ${(end - start).toFixed(2)}ms`,
    { duration: end - start },
    context || 'performance'
  );
  
  return result;
}

// Component render tracking
export function trackRender(componentName: string, props?: any): void {
  debugLogger.debug(
    `Component rendered: ${componentName}`,
    { props },
    'render'
  );
}

// API call tracking
export function trackApiCall(
  method: string,
  url: string,
  status?: number,
  duration?: number
): void {
  debugLogger.info(
    `API Call: ${method} ${url}`,
    { status, duration },
    'api'
  );
}

// User action tracking
export function trackUserAction(
  action: string,
  details?: any
): void {
  debugLogger.info(
    `User Action: ${action}`,
    details,
    'user'
  );
}