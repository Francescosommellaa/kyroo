import { User, Session } from "@supabase/supabase-js";
import { Profile } from "../../lib/supabase";

// Result types for auth operations
export interface AuthResult {
  success: boolean;
  error?: string;
  needsVerification?: boolean;
  details?: any;
}

export interface AvatarUploadResult extends AuthResult {
  url?: string;
}

// Auth state types
export interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
}

// Auth action types
export interface AuthActions {
  signUp: (
    email: string,
    password: string,
    fullName?: string,
    displayName?: string,
  ) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
  resendVerificationEmail: () => Promise<AuthResult>;
  logout: () => Promise<AuthResult>;
}

// Profile action types
export interface ProfileActions {
  updateProfile: (updates: Partial<Profile>) => Promise<AuthResult>;
  uploadAvatar: (file: File) => Promise<AvatarUploadResult>;
}

// Complete auth context type
export interface AuthContextType extends AuthState, AuthActions, ProfileActions {}

// Error codes for better error handling
export enum AuthErrorCode {
  SUPABASE_NOT_CONFIGURED = 'SUPABASE_NOT_CONFIGURED',
  INVALID_FULL_NAME = 'INVALID_FULL_NAME',
  INVALID_DISPLAY_NAME = 'INVALID_DISPLAY_NAME',
  PASSWORD_TOO_SHORT = 'PASSWORD_TOO_SHORT',
  API_KEY_ERROR = 'API_KEY_ERROR',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  INVALID_EMAIL = 'INVALID_EMAIL',
  PASSWORD_REQUIREMENTS = 'PASSWORD_REQUIREMENTS',
  DATABASE_SAVE_ERROR = 'DATABASE_SAVE_ERROR',
  UNKNOWN_SIGNUP_ERROR = 'UNKNOWN_SIGNUP_ERROR',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  EMAIL_NOT_CONFIRMED = 'EMAIL_NOT_CONFIRMED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  UNKNOWN_SIGNIN_ERROR = 'UNKNOWN_SIGNIN_ERROR',
  GOOGLE_OAUTH_ERROR = 'GOOGLE_OAUTH_ERROR',
  LOGOUT_ERROR = 'LOGOUT_ERROR',
  PASSWORD_RESET_ERROR = 'PASSWORD_RESET_ERROR',
  EMAIL_RATE_LIMIT = 'EMAIL_RATE_LIMIT',
  NO_USER_LOGGED_IN = 'NO_USER_LOGGED_IN',
  EMAIL_RESEND_ERROR = 'EMAIL_RESEND_ERROR',
  PASSWORD_UPDATE_ERROR = 'PASSWORD_UPDATE_ERROR',
  USER_NOT_AUTHENTICATED = 'USER_NOT_AUTHENTICATED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  PROFILE_UPDATE_ERROR = 'PROFILE_UPDATE_ERROR',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  STORAGE_NOT_CONFIGURED = 'STORAGE_NOT_CONFIGURED',
  UPLOAD_ERROR = 'UPLOAD_ERROR',
  PROFILE_UPDATE_FAILED = 'PROFILE_UPDATE_FAILED'
}

// Auth event types for logging
export enum AuthEvent {
  SIGNUP_ATTEMPT = 'signup_attempt',
  SIGNUP_SUCCESS = 'signup_success',
  SIGNUP_ERROR = 'signup_error',
  SIGNIN_ATTEMPT = 'signin_attempt',
  SIGNIN_SUCCESS = 'signin_success',
  SIGNIN_ERROR = 'signin_error',
  SIGNOUT_ATTEMPT = 'signout_attempt',
  SIGNOUT_SUCCESS = 'signout_success',
  SIGNOUT_ERROR = 'signout_error',
  PASSWORD_RESET_ATTEMPT = 'password_reset_attempt',
  PASSWORD_RESET_SUCCESS = 'password_reset_success',
  PASSWORD_RESET_ERROR = 'password_reset_error',
  PASSWORD_UPDATE_ATTEMPT = 'password_update_attempt',
  PASSWORD_UPDATE_SUCCESS = 'password_update_success',
  PASSWORD_UPDATE_ERROR = 'password_update_error',
  PROFILE_UPDATE_ATTEMPT = 'profile_update_attempt',
  PROFILE_UPDATE_SUCCESS = 'profile_update_success',
  PROFILE_UPDATE_ERROR = 'profile_update_error',
  AVATAR_UPLOAD_ATTEMPT = 'avatar_upload_attempt',
  AVATAR_UPLOAD_SUCCESS = 'avatar_upload_success',
  AVATAR_UPLOAD_ERROR = 'avatar_upload_error',
  EMAIL_RESEND_ATTEMPT = 'email_resend_attempt',
  EMAIL_RESEND_SUCCESS = 'email_resend_success',
  EMAIL_RESEND_ERROR = 'email_resend_error',
  PROFILE_LOAD_ATTEMPT = 'profile_load_attempt',
  PROFILE_LOAD_SUCCESS = 'profile_load_success',
  PROFILE_LOAD_ERROR = 'profile_load_error',
  PROFILE_NOT_FOUND = 'profile_not_found',
  PROFILE_CREATE_ATTEMPT = 'profile_create_attempt',
  PROFILE_CREATE_SUCCESS = 'profile_create_success',
  PROFILE_CREATE_ERROR = 'profile_create_error',
  SESSION_LOAD_ATTEMPT = 'session_load_attempt',
  SESSION_LOAD_SUCCESS = 'session_load_success',
  SESSION_LOAD_ERROR = 'session_load_error',
  AUTH_STATE_CHANGE = 'auth_state_change'
}

// Validation types
export interface ValidationRule {
  validate: (value: string) => boolean;
  message: string;
}

export interface FormValidationRules {
  email?: ValidationRule[];
  password?: ValidationRule[];
  fullName?: ValidationRule[];
  displayName?: ValidationRule[];
}

// Form validation types
export interface AuthFormData {
  email: string;
  password: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  email: string;
  password: string;
  fullName: string;
}

export interface ResetPasswordFormData {
  email: string;
}