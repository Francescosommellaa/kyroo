// Application constants and error messages

// Error Messages
export const ERROR_MESSAGES = {
  // Generic errors
  GENERIC: 'An unexpected error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection and try again.',
  TIMEOUT: 'Request timed out. Please try again.',
  
  // Authentication errors
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password.',
    EMAIL_NOT_CONFIRMED: 'Please check your email and click the confirmation link.',
    SIGNUP_DISABLED: 'New registrations are currently disabled.',
    EMAIL_INVALID: 'Please enter a valid email address.',
    PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long.',
    USER_EXISTS: 'An account with this email already exists.',
    WEAK_PASSWORD: 'Password is too weak. Please choose a stronger password.',
    RATE_LIMIT: 'Too many attempts. Please try again later.',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
  },
  
  // Form validation errors
  VALIDATION: {
    REQUIRED: 'This field is required.',
    EMAIL_INVALID: 'Please enter a valid email address.',
    PASSWORD_WEAK: 'Password must contain uppercase, lowercase, number and special character.',
    PASSWORDS_MISMATCH: 'Passwords do not match.',
    MIN_LENGTH: (length: number) => `Must be at least ${length} characters long.`,
    MAX_LENGTH: (length: number) => `Must be no more than ${length} characters long.`,
    INVALID_FORMAT: 'Invalid format.',
    INVALID_URL: 'Please enter a valid URL.',
    INVALID_PHONE: 'Please enter a valid phone number.',
  },
  
  // API errors
  API: {
    BAD_REQUEST: 'Bad request. Please check your input.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    FORBIDDEN: 'Access denied.',
    NOT_FOUND: 'The requested resource was not found.',
    CONFLICT: 'A conflict occurred. The resource may already exist.',
    UNPROCESSABLE: 'Invalid data provided.',
    RATE_LIMITED: 'Too many requests. Please try again later.',
    SERVER_ERROR: 'Server error. Please try again later.',
    SERVICE_UNAVAILABLE: 'Service temporarily unavailable.',
  },
  
  // Plan and billing errors
  BILLING: {
    PLAN_LIMIT_REACHED: 'You have reached your plan limit.',
    UPGRADE_REQUIRED: 'Please upgrade your plan to continue.',
    PAYMENT_FAILED: 'Payment failed. Please check your payment method.',
    SUBSCRIPTION_EXPIRED: 'Your subscription has expired.',
  },
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN: 'Successfully logged in!',
    LOGOUT: 'Successfully logged out!',
    SIGNUP: 'Account created successfully! Please check your email.',
    PASSWORD_RESET: 'Password reset email sent!',
    PASSWORD_UPDATED: 'Password updated successfully!',
    PROFILE_UPDATED: 'Profile updated successfully!',
  },
  
  GENERAL: {
    SAVED: 'Changes saved successfully!',
    DELETED: 'Item deleted successfully!',
    COPIED: 'Copied to clipboard!',
    UPLOADED: 'File uploaded successfully!',
  },
} as const;

// Application Configuration
export const APP_CONFIG = {
  // Form settings
  FORM: {
    DEBOUNCE_DELAY: 300,
    VALIDATION_DELAY: 500,
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },
  
  // API settings
  API: {
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
  },
  
  // UI settings
  UI: {
    TOAST_DURATION: 5000,
    MODAL_ANIMATION_DURATION: 200,
    LOADING_DELAY: 200,
  },
  
  // Validation rules
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 8,
    EMAIL_MAX_LENGTH: 254,
    NAME_MAX_LENGTH: 100,
    DESCRIPTION_MAX_LENGTH: 500,
  },
} as const;

// Regular Expressions
export const REGEX_PATTERNS = {
  EMAIL: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  PASSWORD_STRENGTH: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'kyroo_auth_token',
  USER_PREFERENCES: 'kyroo_user_preferences',
  THEME: 'kyroo_theme',
  LANGUAGE: 'kyroo_language',
  ONBOARDING_COMPLETED: 'kyroo_onboarding_completed',
} as const;

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  PRICING: '/pricing',
  TERMS: '/terms',
  PRIVACY: '/privacy',
} as const;

// Plan Types
export const PLAN_TYPES = {
  FREE: 'free',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
} as const;

// Plan Limits
export const PLAN_LIMITS = {
  [PLAN_TYPES.FREE]: {
    PROJECTS: 3,
    STORAGE: 100, // MB
    API_CALLS: 1000,
  },
  [PLAN_TYPES.PRO]: {
    PROJECTS: 10,
    STORAGE: 1000, // MB
    API_CALLS: 10000,
  },
  [PLAN_TYPES.ENTERPRISE]: {
    PROJECTS: -1, // Unlimited
    STORAGE: -1, // Unlimited
    API_CALLS: -1, // Unlimited
  },
} as const;

// Animation Durations (in milliseconds)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 200,
  SLOW: 300,
  EXTRA_SLOW: 500,
} as const;

// Breakpoints (matching Tailwind CSS)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;