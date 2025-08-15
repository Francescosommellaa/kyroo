// Main context and provider
export { AuthContext, useAuth } from './AuthContext';
export { AuthProvider } from './AuthProvider';

// Types
export type {
  AuthContextType,
  AuthResult,
  AvatarUploadResult,
  AuthState,
  AuthActions,
  ProfileActions,
  AuthErrorCode,
  AuthEvent,
  FormValidationRules,
  LoginFormData,
  SignupFormData,
  ResetPasswordFormData
} from './auth-types';

// Hooks
export { useAuthState } from './useAuthState';
export { useAuthActions } from './useAuthActions';
export { useProfileActions } from './useProfileActions';

// Utilities
export {
  validateEmail,
  validatePassword,
  validateFullName,
  validateDisplayName,
  validateAvatarFile,
  mapSupabaseError,
  logAuthEvent,
  logAuthError,
  generateAvatarPath,
  getAvatarUrl,
  isSessionValid,
  withRetry
} from './auth-utils';