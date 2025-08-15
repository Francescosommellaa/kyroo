// Form utility functions

import type { FormState, SubmissionState } from '../types/forms';

// Extract form data from FormData object
export function extractFormData(formData: FormData): Record<string, string> {
  const data: Record<string, string> = {};
  
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') {
      data[key] = value;
    }
  }
  
  return data;
}

// Convert form values to FormData
export function createFormData(values: Record<string, any>): FormData {
  const formData = new FormData();
  
  for (const [key, value] of Object.entries(values)) {
    if (value !== null && value !== undefined) {
      if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, String(value));
      }
    }
  }
  
  return formData;
}

// Sanitize form input
export function sanitizeInput(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

// Format field name for display
export function formatFieldName(fieldName: string): string {
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

// Check if form has changes
export function hasFormChanges<T extends Record<string, any>>(
  currentValues: T,
  initialValues: T
): boolean {
  const currentKeys = Object.keys(currentValues);
  const initialKeys = Object.keys(initialValues);
  
  if (currentKeys.length !== initialKeys.length) {
    return true;
  }
  
  for (const key of currentKeys) {
    if (currentValues[key] !== initialValues[key]) {
      return true;
    }
  }
  
  return false;
}

// Get changed fields
export function getChangedFields<T extends Record<string, any>>(
  currentValues: T,
  initialValues: T
): Partial<T> {
  const changes: Partial<T> = {};
  
  for (const key in currentValues) {
    if (currentValues[key] !== initialValues[key]) {
      changes[key] = currentValues[key];
    }
  }
  
  return changes;
}

// Reset form state
export function resetFormState<T extends Record<string, any>>(
  initialValues: T
): FormState<T> {
  return {
    values: { ...initialValues },
    errors: {},
    touched: {},
    dirty: {},
    isSubmitting: false,
    isValid: true,
    submitCount: 0,
  };
}

// Create initial form state
export function createInitialFormState<T extends Record<string, any>>(
  initialValues: T
): FormState<T> {
  return resetFormState(initialValues);
}

// Validate single field
export function validateSingleField<T>(
  value: T,
  validators: Array<(value: T) => string | undefined>
): string | undefined {
  for (const validator of validators) {
    const error = validator(value);
    if (error) {
      return error;
    }
  }
  return undefined;
}

// Create submission state
export function createSubmissionState(
  isSubmitting = false,
  error: string | null = null,
  success = false
): SubmissionState {
  return {
    isSubmitting,
    error,
    success,
  };
}

// Handle form submission wrapper
export async function handleFormSubmission<T extends Record<string, any>>(
  values: T,
  submitFn: (values: T) => Promise<void>,
  onSuccess?: () => void,
  onError?: (error: string) => void
): Promise<SubmissionState> {
  try {
    await submitFn(values);
    onSuccess?.();
    return createSubmissionState(false, null, true);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    onError?.(errorMessage);
    return createSubmissionState(false, errorMessage, false);
  }
}

// Debounce function for form validation
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Focus first error field
export function focusFirstErrorField(errors: Record<string, string>): void {
  const firstErrorField = Object.keys(errors)[0];
  if (firstErrorField) {
    const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  }
}

// Serialize form for URL params
export function serializeFormToParams(values: Record<string, any>): URLSearchParams {
  const params = new URLSearchParams();
  
  for (const [key, value] of Object.entries(values)) {
    if (value !== null && value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  }
  
  return params;
}

// Parse URL params to form values
export function parseParamsToForm(searchParams: URLSearchParams): Record<string, string> {
  const values: Record<string, string> = {};
  
  for (const [key, value] of searchParams.entries()) {
    values[key] = value;
  }
  
  return values;
}