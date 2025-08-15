import { useState, useCallback } from 'react';

export interface UsePasswordToggleReturn {
  showPassword: boolean;
  togglePassword: () => void;
  setShowPassword: (show: boolean) => void;
  inputType: 'password' | 'text';
  iconName: 'eye' | 'eye-off';
}

export interface PasswordToggleOptions {
  initialVisible?: boolean;
}

export function usePasswordToggle(
  options: PasswordToggleOptions = {}
): UsePasswordToggleReturn {
  const { initialVisible = false } = options;
  
  const [showPassword, setShowPasswordState] = useState(initialVisible);
  
  const togglePassword = useCallback(() => {
    setShowPasswordState(prev => !prev);
  }, []);
  
  const setShowPassword = useCallback((show: boolean) => {
    setShowPasswordState(show);
  }, []);
  
  const inputType = showPassword ? 'text' : 'password';
  const iconName = showPassword ? 'eye-off' : 'eye';
  
  return {
    showPassword,
    togglePassword,
    setShowPassword,
    inputType,
    iconName,
  };
}

export default usePasswordToggle;