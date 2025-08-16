import { supabase } from "../../lib/supabase";
import { AuthResult, AuthEvent } from "./auth-types";
import {
  validateEmail,
  validatePassword,
  validateFullName,
  validateDisplayName,
  mapSupabaseError,
  logAuthEvent,
  logAuthError
} from "./auth-utils";
import { handleNetworkOperation, createNetworkError } from "../../utils/network-error-utils";

export const useAuthActions = () => {
  // Sign up with email and password
  const signUp = async (
    email: string,
    password: string,
    fullName?: string,
    displayName?: string
  ): Promise<AuthResult> => {
    try {
      logAuthEvent(AuthEvent.SIGNUP_ATTEMPT, { email, hasFullName: !!fullName, hasDisplayName: !!displayName });

      // Validate inputs
      const emailError = validateEmail(email);
      if (emailError) {
        return { success: false, error: emailError };
      }

      const passwordError = validatePassword(password);
      if (passwordError) {
        return { success: false, error: passwordError };
      }

      if (fullName) {
        const fullNameError = validateFullName(fullName);
        if (fullNameError) {
          return { success: false, error: fullNameError };
        }
      }

      if (displayName) {
        const displayNameError = validateDisplayName(displayName);
        if (displayNameError) {
          return { success: false, error: displayNameError };
        }
      }

      // Attempt signup with network error handling
      const result = await handleNetworkOperation(
        async () => {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName || '',
                display_name: displayName || fullName || ''
              }
            }
          });

          if (error) {
            throw error;
          }

          return data;
        },
        {
          maxRetries: 2,
          context: 'Registrazione utente',
          onRetry: (attempt, error) => {
            logAuthEvent(AuthEvent.SIGNUP_ATTEMPT, { 
              email, 
              retryAttempt: attempt,
              networkError: error.type 
            });
          }
        }
      );

      if (result.user && !result.user.email_confirmed_at) {
        logAuthEvent(AuthEvent.SIGNUP_SUCCESS, { email, needsVerification: true });
        return {
          success: true,
          needsVerification: true,
          details: { email }
        };
      }

      logAuthEvent(AuthEvent.SIGNUP_SUCCESS, { email, needsVerification: false });
      return { success: true };

    } catch (error: any) {
      logAuthError(AuthEvent.SIGNUP_ERROR, error, { email });
      
      // Check if it's a network error
      if (error.type && error.suggestion) {
        return { 
          success: false, 
          error: `${error.message}\n💡 ${error.suggestion}` 
        };
      }
      
      const { message } = mapSupabaseError(error);
      return { success: false, error: message };
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    try {
      logAuthEvent(AuthEvent.SIGNIN_ATTEMPT, { email });

      // Validate inputs
      const emailError = validateEmail(email);
      if (emailError) {
        return { success: false, error: emailError };
      }

      if (!password) {
        return { success: false, error: 'Password is required' };
      }

      // Attempt signin with network error handling
      const result = await handleNetworkOperation(
        async () => {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (error) {
            throw error;
          }

          return data;
        },
        {
          maxRetries: 2,
          context: 'Accesso utente',
          onRetry: (attempt, error) => {
            logAuthEvent(AuthEvent.SIGNIN_ATTEMPT, { 
              email, 
              retryAttempt: attempt,
              networkError: error.type 
            });
          }
        }
      );

      logAuthEvent(AuthEvent.SIGNIN_SUCCESS, { email, userId: result.user?.id });
      return { success: true };

    } catch (error: any) {
      logAuthError(AuthEvent.SIGNIN_ERROR, error, { email });
      
      // Check if it's a network error
      if (error.type && error.suggestion) {
        return { 
          success: false, 
          error: `${error.message}\n💡 ${error.suggestion}` 
        };
      }
      
      const { message } = mapSupabaseError(error);
      return { success: false, error: message };
    }
  };

  // Sign in with Google
  const signInWithGoogle = async (): Promise<AuthResult> => {
    try {
      logAuthEvent(AuthEvent.SIGNIN_ATTEMPT, { provider: 'google' });

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        throw error;
      }

      logAuthEvent(AuthEvent.SIGNIN_SUCCESS, { provider: 'google' });
      return { success: true };

    } catch (error: any) {
      logAuthError(AuthEvent.SIGNIN_ERROR, error, { provider: 'google' });
      
      // Create network error for Google sign-in
      const networkError = createNetworkError(error, 'Accesso con Google');
      return {
        success: false,
        error: `${networkError.message}\n💡 ${networkError.suggestion}`
      };
    }
  };

  // Sign out
  const signOut = async (): Promise<AuthResult> => {
    try {
      logAuthEvent(AuthEvent.SIGNOUT_ATTEMPT);

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      logAuthEvent(AuthEvent.SIGNOUT_SUCCESS);
      return { success: true };

    } catch (error: any) {
      logAuthError(AuthEvent.SIGNOUT_ERROR, error);
      
      // Create network error for sign out
      const networkError = createNetworkError(error, 'Disconnessione');
      return {
        success: false,
        error: `${networkError.message}\n💡 ${networkError.suggestion}`
      };
    }
  };

  // Reset password
  const resetPassword = async (email: string): Promise<AuthResult> => {
    try {
      logAuthEvent(AuthEvent.PASSWORD_RESET_ATTEMPT, { email });

      // Validate email
      const emailError = validateEmail(email);
      if (emailError) {
        return { success: false, error: emailError };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        throw error;
      }

      logAuthEvent(AuthEvent.PASSWORD_RESET_SUCCESS, { email });
      return { success: true };

    } catch (error: any) {
      logAuthError(AuthEvent.PASSWORD_RESET_ERROR, error, { email });
      const { message } = mapSupabaseError(error);
      return { success: false, error: message };
    }
  };

  // Update password
  const updatePassword = async (password: string): Promise<AuthResult> => {
    try {
      logAuthEvent(AuthEvent.PASSWORD_UPDATE_ATTEMPT);

      // Validate password
      const passwordError = validatePassword(password);
      if (passwordError) {
        return { success: false, error: passwordError };
      }

      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        throw error;
      }

      logAuthEvent(AuthEvent.PASSWORD_UPDATE_SUCCESS);
      return { success: true };

    } catch (error: any) {
      logAuthError(AuthEvent.PASSWORD_UPDATE_ERROR, error);
      const { message } = mapSupabaseError(error);
      return { success: false, error: message };
    }
  };

  // Resend verification email
  const resendVerificationEmail = async (): Promise<AuthResult> => {
    try {
      logAuthEvent(AuthEvent.EMAIL_RESEND_ATTEMPT);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        return {
          success: false,
          error: 'No user email found. Please sign up again.'
        };
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email
      });

      if (error) {
        throw error;
      }

      logAuthEvent(AuthEvent.EMAIL_RESEND_SUCCESS, { email: user.email });
      return { success: true };

    } catch (error: any) {
      logAuthError(AuthEvent.EMAIL_RESEND_ERROR, error);
      const { message } = mapSupabaseError(error);
      return { success: false, error: message };
    }
  };

  // Logout (alias for signOut for backward compatibility)
  const logout = signOut;

  return {
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    resendVerificationEmail,
    logout
  };
};