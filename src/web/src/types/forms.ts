// Form-related types

export interface FormField {
  value: string;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

export interface FormState<T extends Record<string, any> = Record<string, any>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  dirty: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  submitCount: number;
}

export interface SubmissionState {
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
}

export interface ValidationRule<T = any> {
  validate: (value: T, allValues?: Record<string, any>) => boolean;
  message: string;
}

export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FormChangeEvent {
  target: {
    name: string;
    value: any;
  };
}

export interface FormBlurEvent {
  target: {
    name: string;
  };
}

export type FormValidationSchema<T extends Record<string, any> = Record<string, any>> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
}

export interface FormSubmissionResult {
  success: boolean;
  data?: any;
  errors?: Record<string, string>;
}

export interface FormConfig<T extends Record<string, any> = Record<string, any>> {
  initialValues: T;
  validationRules?: FormValidationSchema<T>;
  onSubmit: (values: T) => Promise<void>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
  debounceMs?: number;
}

export interface UseFormOptions<T extends Record<string, any> = Record<string, any>> {
  initialValues: T;
  validationSchema?: FormValidationSchema<T>;
  config?: FormConfig;
  onSubmit?: (values: T) => Promise<FormSubmissionResult> | FormSubmissionResult;
}

export interface UseFormReturn<T extends Record<string, any> = Record<string, any>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  dirty: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  setValue: (field: keyof T, value: any) => void;
  setError: (field: keyof T, error: string) => void;
  setTouched: (field: keyof T, touched?: boolean) => void;
  validateField: (field: keyof T) => void;
  validateForm: () => boolean;
  resetForm: () => void;
  resetField: (field: keyof T) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  getFieldProps: (field: keyof T) => {
    value: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    name: string;
  };
}