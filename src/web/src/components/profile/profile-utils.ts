import { Crown, Star, Zap } from 'lucide-react';
import { PlanInfo, ProfileFormData, PasswordFormData } from './profile-types';

/**
 * Utility functions for Profile components
 */

/**
 * Plan information configuration
 */
export const PLAN_INFO: Record<string, PlanInfo> = {
  free: {
    name: 'Free',
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    icon: Crown
  },
  pro: {
    name: 'Pro',
    color: 'text-accent-violet',
    bgColor: 'bg-accent-violet/10',
    icon: Star
  },
  enterprise: {
    name: 'Enterprise',
    color: 'text-accent-cyan',
    bgColor: 'bg-accent-cyan/10',
    icon: Zap
  }
};

/**
 * Validates profile form data
 */
export const validateProfileForm = (formData: ProfileFormData): string | null => {
  if (!formData.full_name.trim()) {
    return 'Il nome completo è obbligatorio';
  }

  if (formData.full_name.trim().length < 2) {
    return 'Il nome completo deve contenere almeno 2 caratteri';
  }

  if (formData.phone && !isValidPhoneNumber(formData.phone)) {
    return 'Inserisci un numero di telefono valido';
  }

  return null;
};

/**
 * Validates password form data
 */
export const validatePasswordForm = (passwordData: PasswordFormData): string | null => {
  if (!passwordData.currentPassword) {
    return 'La password attuale è obbligatoria';
  }

  if (!passwordData.newPassword) {
    return 'La nuova password è obbligatoria';
  }

  if (passwordData.newPassword.length < 8) {
    return 'La nuova password deve contenere almeno 8 caratteri';
  }

  if (!isStrongPassword(passwordData.newPassword)) {
    return 'La password deve contenere almeno una lettera maiuscola, una minuscola, un numero e un simbolo';
  }

  if (passwordData.newPassword !== passwordData.confirmPassword) {
    return 'Le password non corrispondono';
  }

  if (passwordData.currentPassword === passwordData.newPassword) {
    return 'La nuova password deve essere diversa da quella attuale';
  }

  return null;
};

/**
 * Validates phone number format
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Check if it's a valid Italian phone number (mobile or landline)
  // Mobile: starts with 3 and has 10 digits total
  // Landline: various formats, typically 9-11 digits
  if (cleanPhone.length >= 9 && cleanPhone.length <= 15) {
    return true;
  }
  
  return false;
};

/**
 * Validates password strength
 */
export const isStrongPassword = (password: string): boolean => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
};

/**
 * Formats file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))  } ${  sizes[i]}`;
};

/**
 * Validates image file for avatar upload
 */
export const validateImageFile = (file: File): string | null => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  
  if (!allowedTypes.includes(file.type)) {
    return 'Formato file non supportato. Usa JPG, PNG o GIF.';
  }
  
  if (file.size > maxSize) {
    return `File troppo grande. Dimensione massima: ${formatFileSize(maxSize)}.`;
  }
  
  return null;
};

/**
 * Generates initials from full name
 */
export const getInitials = (fullName: string): string => {
  if (!fullName) return '';
  
  const names = fullName.trim().split(' ');
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

/**
 * Formats date for display
 */
export const formatDisplayDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  
  try {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Data non valida';
  }
};

/**
 * Debounce function for form inputs
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};