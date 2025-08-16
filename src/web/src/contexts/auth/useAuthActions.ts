import { supabase } from "../../lib/supabase";
import { AuthResult, AuthEvent } from "./auth-types";
import {
  validateEmail,
  validatePassword,
  validateFullName,
  validateDisplayName,
  mapSupabaseError
} from "./auth-utils";
import {
  withRetry,
  handleSupabaseError,
  NetworkError,
  AuthenticationError,
  ValidationError
} from '@/lib/error-handling';
import {
  logAuthEvent,
  logAuthError
} from './auth-utils';

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

      // Attempt signup with enhanced retry logic
      const result = await withRetry(
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
            handleSupabaseError(error, 'User signup');
          }

          // Create user profile in the users table with enhanced retry and error handling
          if (data.user) {
            await ensureUserProfile(data.user, { fullName, displayName });
          }

          return data;
        },
        {
          operation: 'User signup',
          timestamp: new Date().toISOString()
        },
        { maxAttempts: 3 }
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

      if (error instanceof NetworkError) {
        return {
          success: false,
          error: `Network error: ${error.message}. Please check your connection and try again.`
        };
      }

      if (error instanceof AuthenticationError) {
        return {
          success: false,
          error: error.message
        };
      }

      if (error instanceof ValidationError) {
        return {
          success: false,
          error: error.message
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

      // Attempt signin with enhanced retry logic
      const result = await withRetry(
        async () => {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (error) {
            handleSupabaseError(error, 'User signin');
          }

          return data;
        },
        {
          operation: 'User signin',
          timestamp: new Date().toISOString()
        },
        { maxAttempts: 3 }
      );

      logAuthEvent(AuthEvent.SIGNIN_SUCCESS, { email, userId: result.user?.id });
      return { success: true };

    } catch (error: any) {
      logAuthError(AuthEvent.SIGNIN_ERROR, error, { email });

      if (error instanceof NetworkError) {
        return {
          success: false,
          error: `Network error: ${error.message}. Please check your connection and try again.`
        };
      }

      if (error instanceof AuthenticationError) {
        return {
          success: false,
          error: error.message
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

      await withRetry(
        async () => {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`
            }
          });

          if (error) {
            handleSupabaseError(error, 'Google OAuth signin');
          }
        },
        {
          operation: 'Google OAuth signin',
          timestamp: new Date().toISOString()
        },
        { maxAttempts: 2 }
      );

      logAuthEvent(AuthEvent.SIGNIN_SUCCESS, { provider: 'google' });
      return { success: true };

    } catch (error: any) {
      logAuthError(AuthEvent.SIGNIN_ERROR, error, { provider: 'google' });

      if (error instanceof NetworkError) {
        return {
          success: false,
          error: `Network error during Google sign-in: ${error.message}. Please try again.`
        };
      }

      return {
        success: false,
        error: 'Failed to sign in with Google. Please try again.'
      };
    }
  };

  // Create user profile if it doesn't exist (for both OAuth and normal registration)
  const ensureUserProfile = async (user: any, additionalData?: { fullName?: string; displayName?: string }): Promise<void> => {
    await withRetry(
      async () => {
        // Check if user profile exists
        const { data: existingUser, error: selectError } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single();

        if (selectError && selectError.code !== 'PGRST116') {
          console.warn('Error checking user profile existence:', selectError);
          // Don't throw error, continue with creation attempt
        }

        if (!existingUser) {
          // Prepare user data with fallbacks
          const userData = {
            id: user.id,
            email: user.email!,
            full_name: additionalData?.fullName || 
                      user.user_metadata?.full_name || 
                      user.user_metadata?.name || 
                      null,
            display_name: additionalData?.displayName || 
                         additionalData?.fullName ||
                         user.user_metadata?.full_name || 
                         user.user_metadata?.name || 
                         user.email?.split('@')[0] || 
                         null,
            avatar_url: user.user_metadata?.avatar_url || null,
            role: 'user',
            plan: 'free',
            email_verified: user.email_confirmed_at ? true : false
          };

          console.log('Creating user profile:', { userId: user.id, email: user.email });

          // Try multiple approaches for user creation
          let profileError = null;
          
          // First attempt: normal insert
          const { error: insertError } = await supabase
            .from('users')
            .insert(userData);

          if (insertError) {
            profileError = insertError;
            console.warn('First insert attempt failed:', insertError);
            
            // Second attempt: upsert (insert or update)
            const { error: upsertError } = await supabase
              .from('users')
              .upsert(userData, { onConflict: 'id' });
              
            if (upsertError) {
              profileError = upsertError;
              console.warn('Upsert attempt failed:', upsertError);
              
              // Third attempt: using service role if available
              try {
                const { error: serviceError } = await supabase
                  .from('users')
                  .insert(userData);
                  
                if (serviceError) {
                  profileError = serviceError;
                } else {
                  profileError = null; // Success
                }
              } catch (serviceAttemptError) {
                console.warn('Service role attempt failed:', serviceAttemptError);
              }
            } else {
              profileError = null; // Upsert succeeded
            }
          } else {
            profileError = null; // First insert succeeded
          }

          if (profileError) {
            console.error('All user profile creation attempts failed:', {
              error: profileError,
              userId: user.id,
              email: user.email,
              provider: user.app_metadata?.provider
            });
            
            // Don't throw error for OAuth users to prevent auth flow interruption
            if (user.app_metadata?.provider) {
              console.warn('OAuth user profile creation failed, but continuing auth flow');
            } else {
              handleSupabaseError(profileError, 'Create user profile');
            }
          } else {
            console.log('User profile created successfully:', user.id);
          }
        } else {
          console.log('User profile already exists:', user.id);
        }
      },
      {
        operation: 'Ensure user profile',
        userId: user.id,
        timestamp: new Date().toISOString()
      },
      { maxAttempts: 3 }
    );
  };

  // Sign out
  const signOut = async (): Promise<AuthResult> => {
    try {
      logAuthEvent(AuthEvent.SIGNOUT_ATTEMPT);

      await withRetry(
        async () => {
          const { error } = await supabase.auth.signOut();

          if (error) {
            handleSupabaseError(error, 'User signout');
          }
        },
        {
          operation: 'User signout',
          timestamp: new Date().toISOString()
        },
        { maxAttempts: 2 }
      );

      logAuthEvent(AuthEvent.SIGNOUT_SUCCESS);
      return { success: true };

    } catch (error: any) {
      logAuthError(AuthEvent.SIGNOUT_ERROR, error);

      if (error instanceof NetworkError) {
        return {
          success: false,
          error: `Network error during sign out: ${error.message}. You may already be signed out.`
        };
      }

      return {
        success: false,
        error: 'Failed to sign out. Please try again.'
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

      await withRetry(
        async () => {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
          });

          if (error) {
            handleSupabaseError(error, 'Password reset');
          }
        },
        {
          operation: 'Password reset',
          timestamp: new Date().toISOString()
        },
        { maxAttempts: 3 }
      );

      logAuthEvent(AuthEvent.PASSWORD_RESET_SUCCESS, { email });
      return { success: true };

    } catch (error: any) {
      logAuthError(AuthEvent.PASSWORD_RESET_ERROR, error, { email });

      if (error instanceof NetworkError) {
        return {
          success: false,
          error: `Network error: ${error.message}. Please check your connection and try again.`
        };
      }

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

      await withRetry(
        async () => {
          const { error } = await supabase.auth.updateUser({ password });

          if (error) {
            handleSupabaseError(error, 'Password update');
          }
        },
        {
          operation: 'Password update',
          timestamp: new Date().toISOString()
        },
        { maxAttempts: 2 }
      );

      logAuthEvent(AuthEvent.PASSWORD_UPDATE_SUCCESS);
      return { success: true };

    } catch (error: any) {
      logAuthError(AuthEvent.PASSWORD_UPDATE_ERROR, error);

      if (error instanceof NetworkError) {
        return {
          success: false,
          error: `Network error: ${error.message}. Please check your connection and try again.`
        };
      }

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

      await withRetry(
        async () => {
          const { error } = await supabase.auth.resend({
            type: 'signup',
            email: user.email!
          });

          if (error) {
            handleSupabaseError(error, 'Resend verification email');
          }
        },
        {
          operation: 'Resend verification email',
          userId: user.id,
          timestamp: new Date().toISOString()
        },
        { maxAttempts: 3 }
      );

      logAuthEvent(AuthEvent.EMAIL_RESEND_SUCCESS, { email: user.email! });
      return { success: true };

    } catch (error: any) {
      logAuthError(AuthEvent.EMAIL_RESEND_ERROR, error);

      if (error instanceof NetworkError) {
        return {
          success: false,
          error: `Network error: ${error.message}. Please check your connection and try again.`
        };
      }

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
    ensureUserProfile,
    logout
  };
};
