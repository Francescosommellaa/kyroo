import { useCallback, useMemo } from 'react';
import type { ValidationRule, FieldValidationResult } from '../types/forms';

export interface ValidationRules {
  required: (message?: string) => ValidationRule<any>;
  email: (message?: string) => ValidationRule<string>;
  minLength: (length: number, message?: string) => ValidationRule<string>;
  maxLength: (length: number, message?: string) => ValidationRule<string>;
  pattern: (regex: RegExp, message?: string) => ValidationRule<string>;
  passwordStrength: (message?: string) => ValidationRule<string>;
  confirmPassword: (passwordField: string, message?: string) => ValidationRule<string>;
  custom: <T>(validator: (value: T) => boolean, message: string) => ValidationRule<T>;
}

export interface UseValidationReturn {
  rules: ValidationRules;
  validateField: <T>(value: T, rules: ValidationRule<T>[], allValues?: Record<string, any>) => FieldValidationResult;
  validateForm: <T extends Record<string, any>>(values: T, validationSchema: Partial<Record<keyof T, ValidationRule<T[keyof T]>[]>>) => {
    isValid: boolean;
    errors: Partial<Record<keyof T, string>>;
  };
}

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const PASSWORD_STRENGTH_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

export function useValidation(): UseValidationReturn {
  const rules = useMemo<ValidationRules>(() => ({
    required: (message = 'This field is required') => ({
      validate: (value: any) => {
        if (typeof value === 'string') {
          return value.trim().length > 0;
        }
        return value != null && value !== '';
      },
      message,
    }),
    
    email: (message = 'Please enter a valid email address') => ({
      validate: (value: string) => {
        if (!value) return true; // Let required rule handle empty values
        return EMAIL_REGEX.test(value);
      },
      message,
    }),
    
    minLength: (length: number, message?: string) => ({
      validate: (value: string) => {
        if (!value) return true; // Let required rule handle empty values
        return value.length >= length;
      },
      message: message || `Must be at least ${length} characters`,
    }),
    
    maxLength: (length: number, message?: string) => ({
      validate: (value: string) => {
        if (!value) return true;
        return value.length <= length;
      },
      message: message || `Must be no more than ${length} characters`,
    }),
    
    pattern: (regex: RegExp, message = 'Invalid format') => ({
      validate: (value: string) => {
        if (!value) return true;
        return regex.test(value);
      },
      message,
    }),
    
    passwordStrength: (message = 'Password must contain at least 8 characters with uppercase, lowercase, number and special character') => ({
      validate: (value: string) => {
        if (!value) return true;
        return value.length >= 8 && PASSWORD_STRENGTH_REGEX.test(value);
      },
      message,
    }),
    
    confirmPassword: (passwordField: string, message = 'Passwords do not match') => ({
      validate: (value: string, allValues?: Record<string, any>) => {
        if (!value || !allValues) return true;
        return value === allValues[passwordField];
      },
      message,
    }),
    
    custom: <T>(validator: (value: T) => boolean, message: string) => ({
      validate: validator,
      message,
    }),
  }), []);
  
  const validateField = useCallback(
    <T>(value: T, fieldRules: ValidationRule<T>[], allValues?: Record<string, any>): FieldValidationResult => {
      for (const rule of fieldRules) {
        if (!rule.validate(value, allValues)) {
          return {
            isValid: false,
            error: rule.message,
          };
        }
      }
      
      return { isValid: true };
    },
    []
  );
  
  const validateForm = useCallback(
    <T extends Record<string, any>>(
      values: T,
      validationSchema: Partial<Record<keyof T, ValidationRule<T[keyof T]>[]>>
    ) => {
      const errors: Partial<Record<keyof T, string>> = {};
      let isValid = true;
      
      for (const field in validationSchema) {
        const fieldRules = validationSchema[field];
        if (fieldRules) {
          const result = validateField(values[field], fieldRules, values);
          if (!result.isValid) {
            errors[field] = result.error;
            isValid = false;
          }
        }
      }
      
      return { isValid, errors };
    },
    [validateField]
  );
  
  return {
    rules,
    validateField,
    validateForm,
  };
}

export default useValidation;