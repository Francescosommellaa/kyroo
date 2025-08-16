export type AuthMode = 'login' | 'signup' | 'register' | 'reset' | 'verify';

export interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  fullName?: string;
  displayName?: string;
}

export interface AuthFormState {
  mode: AuthMode;
  isLoading: boolean;
  error: string | null;
  message: string | null;
  showPassword: boolean;
  showConfirmPassword: boolean;
}

export interface AuthFormProps {
  onSubmit: (data: AuthFormData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  message: string | null;
  onModeChange: (mode: AuthMode) => void;
}

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: AuthMode;
}

export interface FormFieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  showToggle?: boolean;
  onToggleVisibility?: () => void;
}