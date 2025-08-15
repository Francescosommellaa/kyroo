// Types - Main export file

// Form types
export * from './forms';

// Re-export specific types for convenience
export type {
  FormField,
  FormState,
  FormConfig,
  ValidationRule,
  FormValidationSchema,
  FormSubmissionResult,
  UseFormOptions,
  UseFormReturn,
  SubmissionState,
  FormChangeEvent,
  FormBlurEvent,
  FieldValidationResult,
} from './forms';

// Auth types
export * from './auth';
export type {
  User,
  AuthState,
  LoginCredentials,
  RegisterCredentials,
  ResetPasswordCredentials,
  UpdatePasswordCredentials,
  AuthError,
  AuthResponse,
  AuthContextValue,
  ProtectedRouteProps,
  AuthGuardProps,
  SupabaseAuthError,
  SupabaseUser,
  SupabaseSession,
} from './auth';