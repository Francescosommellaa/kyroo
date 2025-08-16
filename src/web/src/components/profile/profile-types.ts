import type { LucideIcon } from 'lucide-react';

/**
 * Types for Profile Components
 */

export interface ProfileFormData {
  full_name: string;
  display_name: string;
  phone: string;
  first_name: string;
  last_name: string;
}

export interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ShowPasswordsState {
  current: boolean;
  new: boolean;
  confirm: boolean;
}

export interface MessageState {
  type: 'success' | 'error';
  text: string;
}

export interface PlanInfo {
  name: string;
  color: string;
  bgColor: string;
  icon: LucideIcon;
}

export interface ProfileFormProps {
  formData: ProfileFormData;
  loading: boolean;
  message: MessageState | null;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  userEmail: string;
}

export interface AvatarUploadProps {
  avatarUrl?: string;
  loading: boolean;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAvatarClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export interface PasswordChangeProps {
  passwordData: PasswordFormData;
  showPasswords: ShowPasswordsState;
  loading: boolean;
  message: MessageState | null;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onToggleVisibility: (field: 'current' | 'new' | 'confirm') => void;
}

export interface ProfileSettingsProps {
  userPlan: string;
  planInfo: Record<string, PlanInfo>;
  profile: {
    created_at?: string;
    role?: string;
  } | null;
  userId?: string;
}

export interface QuickActionsProps {
  onNavigate: (path: string) => void;
}

export interface AccountInfoProps {
  profile: {
    created_at?: string;
    role?: string;
  } | null;
  userId?: string;
}