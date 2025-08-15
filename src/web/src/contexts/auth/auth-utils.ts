import { AuthError } from "@supabase/supabase-js";
import { AuthErrorCode, AuthEvent, ValidationRule, FormValidationRules } from "./auth-types";
// import { debug } from "../../lib/debug";

// Validation utilities
export const createValidationRule = (validate: (value: string) => boolean, message: string): ValidationRule => ({
  validate,
  message
});

export const emailValidationRules: ValidationRule[] = [
  createValidationRule(
    (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    "Please enter a valid email address"
  )
];

export const passwordValidationRules: ValidationRule[] = [
  createValidationRule(
    (password) => password.length >= 8,
    "Password must be at least 8 characters long"
  ),
  createValidationRule(
    (password) => /[A-Z]/.test(password),
    "Password must contain at least one uppercase letter"
  ),
  createValidationRule(
    (password) => /[a-z]/.test(password),
    "Password must contain at least one lowercase letter"
  ),
  createValidationRule(
    (password) => /\d/.test(password),
    "Password must contain at least one number"
  )
];

export const fullNameValidationRules: ValidationRule[] = [
  createValidationRule(
    (name) => name.trim().length >= 2,
    "Full name must be at least 2 characters long"
  ),
  createValidationRule(
    (name) => /^[a-zA-Z\s'-]+$/.test(name.trim()),
    "Full name can only contain letters, spaces, hyphens, and apostrophes"
  )
];

export const displayNameValidationRules: ValidationRule[] = [
  createValidationRule(
    (name) => name.trim().length >= 2,
    "Display name must be at least 2 characters long"
  ),
  createValidationRule(
    (name) => name.trim().length <= 50,
    "Display name must be less than 50 characters"
  )
];

export const authValidationRules: FormValidationRules = {
  email: emailValidationRules,
  password: passwordValidationRules,
  fullName: fullNameValidationRules,
  displayName: displayNameValidationRules
};

// Validation functions
export const validateField = (value: string, rules: ValidationRule[]): string | null => {
  for (const rule of rules) {
    if (!rule.validate(value)) {
      return rule.message;
    }
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  return validateField(email, emailValidationRules);
};

export const validatePassword = (password: string): string | null => {
  return validateField(password, passwordValidationRules);
};

export const validateFullName = (fullName: string): string | null => {
  return validateField(fullName, fullNameValidationRules);
};

export const validateDisplayName = (displayName: string): string | null => {
  return validateField(displayName, displayNameValidationRules);
};

// File validation utilities
export const validateAvatarFile = (file: File): { isValid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)'
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size must be less than 5MB'
    };
  }

  return { isValid: true };
};

// Error mapping utilities
export const mapSupabaseError = (error: AuthError): { code: AuthErrorCode; message: string } => {
  const errorMessage = error.message.toLowerCase();

  // Map common Supabase errors to our error codes
  if (errorMessage.includes('user already registered')) {
    return { code: AuthErrorCode.USER_ALREADY_EXISTS, message: 'An account with this email already exists' };
  }
  
  if (errorMessage.includes('invalid email')) {
    return { code: AuthErrorCode.INVALID_EMAIL, message: 'Please enter a valid email address' };
  }
  
  if (errorMessage.includes('password') && errorMessage.includes('short')) {
    return { code: AuthErrorCode.PASSWORD_TOO_SHORT, message: 'Password must be at least 8 characters long' };
  }
  
  if (errorMessage.includes('email not confirmed')) {
    return { code: AuthErrorCode.EMAIL_NOT_CONFIRMED, message: 'Please check your email and click the confirmation link' };
  }
  
  if (errorMessage.includes('invalid login credentials')) {
    return { code: AuthErrorCode.INVALID_CREDENTIALS, message: 'Invalid email or password' };
  }
  
  if (errorMessage.includes('too many requests')) {
    return { code: AuthErrorCode.TOO_MANY_REQUESTS, message: 'Too many requests. Please try again later' };
  }
  
  if (errorMessage.includes('rate limit')) {
    return { code: AuthErrorCode.EMAIL_RATE_LIMIT, message: 'Please wait before requesting another email' };
  }
  
  if (errorMessage.includes('permission denied') || errorMessage.includes('access denied')) {
    return { code: AuthErrorCode.PERMISSION_DENIED, message: 'Permission denied. Please try again' };
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('connection')) {
    return { code: AuthErrorCode.CONNECTION_ERROR, message: 'Connection error. Please check your internet connection' };
  }

  // Default fallback
  return { code: AuthErrorCode.UNKNOWN_SIGNIN_ERROR, message: error.message };
};

// Logging utilities
export const logAuthEvent = (event: AuthEvent, details?: any): void => {
  console.log(`Auth Event: ${event}`, details);
};

export const logAuthError = (event: AuthEvent, error: any, context?: any): void => {
  console.error(`Auth Error: ${event}`, { error, context });
};

// Avatar utilities
export const generateAvatarPath = (userId: string, fileName: string): string => {
  const timestamp = Date.now();
  const extension = fileName.split('.').pop();
  return `avatars/${userId}/${timestamp}.${extension}`;
};

export const getAvatarUrl = (path: string, supabaseUrl: string): string => {
  return `${supabaseUrl}/storage/v1/object/public/avatars/${path}`;
};

// Session utilities
export const isSessionValid = (session: any): boolean => {
  if (!session || !session.access_token) {
    return false;
  }
  
  const expiresAt = session.expires_at;
  if (!expiresAt) {
    return false;
  }
  
  const now = Math.floor(Date.now() / 1000);
  return expiresAt > now;
};

// Retry utilities
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;
  
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
};