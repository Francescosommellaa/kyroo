import { createContext, useContext } from 'react';
import { AuthContextType } from './auth-types';

// Create the authentication context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook to use the authentication context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};