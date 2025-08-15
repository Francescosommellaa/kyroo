// Authentication-related types

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  name?: string;
  acceptTerms: boolean;
}

export interface ResetPasswordCredentials {
  email: string;
}

export interface UpdatePasswordCredentials {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthError {
  code: string;
  message: string;
  details?: any;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: AuthError;
  token?: string;
}

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (credentials: RegisterCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  resetPassword: (credentials: ResetPasswordCredentials) => Promise<AuthResponse>;
  updatePassword: (credentials: UpdatePasswordCredentials) => Promise<AuthResponse>;
  updateProfile: (data: Partial<User>) => Promise<AuthResponse>;
  clearError: () => void;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredRole?: string;
}

export interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: string;
}

// Supabase specific types
export interface SupabaseAuthError {
  message: string;
  status?: number;
}

export interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: SupabaseUser;
}