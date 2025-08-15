// Library utilities - Main export file

// Validators
export * from './validators';
export {
  validateEmail,
  validatePassword,
  validateRequired,
  isValidEmail,
  isStrongPassword,
} from './validators';

// Form utilities
export * from './form-utils';
export {
  extractFormData,
  createFormData,
  sanitizeInput,
  formatFieldName,
  hasFormChanges,
  getChangedFields,
  resetFormState,
  createInitialFormState,
  validateSingleField,
  createSubmissionState,
  handleFormSubmission,
  debounce,
  focusFirstErrorField,
  serializeFormToParams,
  parseParamsToForm,
} from './form-utils';

// Error utilities
export * from './error-utils';
export {
  createAppError,
  formatErrorMessage,
  extractErrorDetails,
  handleAuthError,
  handleApiError,
  logError,
  withRetry,
  isRetryableError,
  createErrorBoundaryFallback,
  sanitizeErrorMessage,
} from './error-utils';

// Constants
export * from './constants';
export {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  APP_CONFIG,
  REGEX_PATTERNS,
  HTTP_STATUS,
} from './constants';

// Debug utilities
export * from './debug';
export * from './debug-logger';
export * from './debug-utils';
export {
  debug,
  debugLogger,
  measurePerformance,
  measureAsyncPerformance,
  trackRender,
  trackApiCall,
  trackUserAction,
} from './debug';