// Pure validation functions

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Email validation
const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
}

// Password validation
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_STRENGTH_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < PASSWORD_MIN_LENGTH) {
    return { 
      isValid: false, 
      error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long` 
    };
  }
  
  if (!PASSWORD_STRENGTH_REGEX.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain uppercase, lowercase, number and special character'
    };
  }
  
  return { isValid: true };
}

// Confirm password validation
export function validateConfirmPassword(
  password: string, 
  confirmPassword: string
): ValidationResult {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password' };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }
  
  return { isValid: true };
}

// Required field validation
export function validateRequired(value: any, fieldName = 'This field'): ValidationResult {
  if (value === null || value === undefined) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  if (typeof value === 'string' && value.trim().length === 0) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  return { isValid: true };
}

// String length validation
export function validateLength(
  value: string, 
  min?: number, 
  max?: number, 
  fieldName = 'Field'
): ValidationResult {
  if (!value) {
    return { isValid: true }; // Let required validation handle empty values
  }
  
  if (min !== undefined && value.length < min) {
    return { 
      isValid: false, 
      error: `${fieldName} must be at least ${min} characters long` 
    };
  }
  
  if (max !== undefined && value.length > max) {
    return { 
      isValid: false, 
      error: `${fieldName} must be no more than ${max} characters long` 
    };
  }
  
  return { isValid: true };
}

// URL validation
const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

export function validateUrl(url: string): ValidationResult {
  if (!url) {
    return { isValid: true }; // Optional field
  }
  
  if (!URL_REGEX.test(url)) {
    return { isValid: false, error: 'Please enter a valid URL' };
  }
  
  return { isValid: true };
}

// Phone number validation (basic)
const PHONE_REGEX = /^[\+]?[1-9][\d]{0,15}$/;

export function validatePhone(phone: string): ValidationResult {
  if (!phone) {
    return { isValid: true }; // Optional field
  }
  
  // Remove spaces, dashes, parentheses
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  if (!PHONE_REGEX.test(cleanPhone)) {
    return { isValid: false, error: 'Please enter a valid phone number' };
  }
  
  return { isValid: true };
}

// Generic pattern validation
export function validatePattern(
  value: string, 
  pattern: RegExp, 
  errorMessage = 'Invalid format'
): ValidationResult {
  if (!value) {
    return { isValid: true }; // Let required validation handle empty values
  }
  
  if (!pattern.test(value)) {
    return { isValid: false, error: errorMessage };
  }
  
  return { isValid: true };
}

// Batch validation helper
export function validateFields(
  fields: Record<string, any>, 
  validators: Record<string, (value: any) => ValidationResult>
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  let isValid = true;
  
  for (const [fieldName, value] of Object.entries(fields)) {
    const validator = validators[fieldName];
    if (validator) {
      const result = validator(value);
      if (!result.isValid && result.error) {
        errors[fieldName] = result.error;
        isValid = false;
      }
    }
  }
  
  return { isValid, errors };
}

// Simple boolean validators for convenience
export function isValidEmail(email: string): boolean {
  return validateEmail(email).isValid;
}

export function isStrongPassword(password: string): boolean {
  return validatePassword(password).isValid;
}