import React, { ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { useAuthState } from './useAuthState';
import { useAuthActions } from './useAuthActions';
import { useProfileActions } from './useProfileActions';
import { AuthContextType } from './auth-types';
import { logAuthEvent } from './auth-utils';
import { AuthEvent } from './auth-types';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Initialize state management
  const {
    user,
    profile,
    session,
    loading,

    updateProfileInState,
    clearAuthState
  } = useAuthState();

  // Initialize authentication actions
  const {
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    resendVerificationEmail
  } = useAuthActions();

  // Initialize profile actions
  const {
    updateProfile,
    uploadAvatar
  } = useProfileActions();

  // Enhanced signOut that clears state
  const handleSignOut = async () => {
    try {
      logAuthEvent(AuthEvent.SIGNOUT_ATTEMPT, { userId: user?.id });
      
      const result = await signOut();
      
      if (result.success) {
        clearAuthState();
        logAuthEvent(AuthEvent.SIGNOUT_SUCCESS, { userId: user?.id });
      }
      
      return result;
    } catch (error) {
      logAuthEvent(AuthEvent.SIGNOUT_ERROR, { error, userId: user?.id });
      throw error;
    }
  };

  // Enhanced updateProfile that updates state
  const handleUpdateProfile = async (updates: any) => {
    try {
      const result = await updateProfile(updates);
      
      if (result.success && result.details) {
        updateProfileInState(result.details);
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  };

  // Enhanced uploadAvatar that updates state
  const handleUploadAvatar = async (file: File) => {
    try {
      const result = await uploadAvatar(file);
      
      if (result.success && result.url) {
        // Update profile state with new avatar URL
        updateProfileInState({ avatar_url: result.url });
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  };

  // Create context value
  const contextValue: AuthContextType = {
    // State
    user,
    profile,
    session,
    loading,
    
    // Authentication actions
    signUp,
    signIn,
    signInWithGoogle,
    signOut: handleSignOut,
    logout: handleSignOut,
    resetPassword,
    updatePassword,
    resendVerificationEmail,
    
    // Profile actions
    updateProfile: handleUpdateProfile,
    uploadAvatar: handleUploadAvatar,
    
    // Utility functions
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};