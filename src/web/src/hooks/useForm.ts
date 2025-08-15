import { useState, useCallback, useMemo } from 'react';
import type {
  FormConfig,
  ValidationRule,
} from '../types/forms';

export interface UseFormReturn<T extends Record<string, any>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  dirty: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
  
  // Field operations
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setError: <K extends keyof T>(field: K, error: string | null) => void;
  setTouched: <K extends keyof T>(field: K, touched: boolean) => void;
  
  // Form operations
  handleChange: (field: keyof T) => (value: any) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  reset: () => void;
  validate: (field?: keyof T) => boolean;
  
  // Utilities
  getFieldProps: <K extends keyof T>(field: K) => {
    value: T[K];
    onChange: (value: T[K]) => void;
    onBlur: () => void;
    error: string | undefined;
    touched: boolean;
    dirty: boolean;
  };
}

export function useForm<T extends Record<string, any>>(
  config: FormConfig<T>
): UseFormReturn<T> {
  const {
    initialValues,
    validationRules = {} as Partial<Record<keyof T, ValidationRule<T[keyof T]>[]>>,
    onSubmit,
    validateOnChange = true,
    validateOnBlur = true,
  } = config;
  
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouchedState] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Calculate derived state
  const dirty = useMemo(() => {
    const dirtyFields: Partial<Record<keyof T, boolean>> = {};
    for (const key in values) {
      dirtyFields[key] = values[key] !== initialValues[key];
    }
    return dirtyFields;
  }, [values, initialValues]);
  
  const isDirty = useMemo(() => {
    return Object.values(dirty).some(Boolean);
  }, [dirty]);
  
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);
  
  // Validation function
  const validateField = useCallback(
    (field: keyof T, value: T[keyof T]): string | null => {
      const rules = validationRules[field];
      if (!rules) return null;
      
      for (const rule of rules) {
        if (!rule.validate(value, values)) {
          return rule.message;
        }
      }
      
      return null;
    },
    [validationRules, values]
  );
  
  const validate = useCallback(
    (field?: keyof T): boolean => {
      if (field) {
        const error = validateField(field, values[field]);
        setErrors(prev => ({
          ...prev,
          [field]: error || undefined,
        }));
        return !error;
      }
      
      // Validate all fields
      const newErrors: Partial<Record<keyof T, string>> = {};
      let hasErrors = false;
      
      for (const key in values) {
        const error = validateField(key, values[key]);
        if (error) {
          newErrors[key] = error;
          hasErrors = true;
        }
      }
      
      setErrors(newErrors);
      return !hasErrors;
    },
    [validateField, values]
  );
  
  // Field setters
  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    if (validateOnChange) {
      const error = validateField(field, value);
      setErrors(prev => ({
        ...prev,
        [field]: error || undefined,
      }));
    }
  }, [validateField, validateOnChange]);
  
  const setError = useCallback(<K extends keyof T>(field: K, error: string | null) => {
    setErrors(prev => ({
      ...prev,
      [field]: error || undefined,
    }));
  }, []);
  
  const setTouched = useCallback(<K extends keyof T>(field: K, touchedValue: boolean) => {
    setTouchedState(prev => ({ ...prev, [field]: touchedValue }));
  }, []);
  
  // Event handlers
  const handleChange = useCallback(
    (field: keyof T) => (value: any) => {
      setValue(field, value);
    },
    [setValue]
  );
  
  const handleBlur = useCallback(
    (field: keyof T) => () => {
      setTouched(field, true);
      
      if (validateOnBlur) {
        validate(field);
      }
    },
    [setTouched, validate, validateOnBlur]
  );
  
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      
      if (isSubmitting) return;
      
      setIsSubmitting(true);
      
      try {
        // Mark all fields as touched
        const allTouched: Partial<Record<keyof T, boolean>> = {};
        for (const key in values) {
          allTouched[key] = true;
        }
        setTouchedState(allTouched);
        
        // Validate all fields
        const isFormValid = validate();
        
        if (isFormValid) {
          await onSubmit(values);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, values, validate, onSubmit]
  );
  
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouchedState({});
    setIsSubmitting(false);
  }, [initialValues]);
  
  const getFieldProps = useCallback(
    <K extends keyof T>(field: K) => ({
      value: values[field],
      onChange: (value: T[K]) => setValue(field, value),
      onBlur: () => {
        setTouched(field, true);
        if (validateOnBlur) validate(field);
      },
      error: errors[field],
      touched: touched[field] || false,
      dirty: dirty[field] || false,
    }),
    [values, setValue, setTouched, validateOnBlur, validate, errors, touched, dirty]
  );
  
  return {
    values,
    errors,
    touched,
    dirty,
    isValid,
    isSubmitting,
    isDirty,
    setValue,
    setError,
    setTouched,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    validate,
    getFieldProps,
  };
}

export default useForm;