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
      console.log('🚀 Starting signup process for:', { email, hasFullName: !!fullName, hasDisplayName: !!displayName });
      
      const result = await withRetry(
        async () => {
          console.log('📞 Calling supabase.auth.signUp...');
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

          console.log('📞 Supabase signup response:', {
            hasUser: !!data?.user,
            userId: data?.user?.id,
            userEmail: data?.user?.email,
            emailConfirmed: data?.user?.email_confirmed_at,
            hasSession: !!data?.session,
            error: error ? {
              name: error.name,
              message: error.message,
              status: error.status,
              statusCode: error instanceof Error && error.name === 'AuthError' ? 'AuthError' : 'Unknown'
            } : null
          });

          if (error) {
            console.error('🚨 Supabase signup error:', error);
            handleSupabaseError(error, 'User signup');
          }

          // Ensure user profile exists (handles both trigger success and failure cases)
          if (data.user) {
            console.log('👤 User created, ensuring profile exists...');
            
            // Use ensureUserProfile which checks if profile exists and creates it if needed
            // This handles both cases: when the trigger works and when it doesn't
            await ensureUserProfile(data.user, { fullName, displayName });
          } else {
            console.warn('⚠️ No user returned from signup');
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

  // Update user profile with additional data
  const updateUserProfile = async (user: any, additionalData?: { fullName?: string; displayName?: string }): Promise<void> => {
    await withRetry(
      async () => {
        console.log('🔄 Updating user profile for user:', {
          userId: user.id,
          email: user.email,
          additionalData
        });

        const updateData: any = {};
        
        if (additionalData?.fullName) {
          updateData.full_name = additionalData.fullName;
        }
        
        if (additionalData?.displayName) {
          updateData.display_name = additionalData.displayName;
        }
        
        if (Object.keys(updateData).length > 0) {
          updateData.updated_at = new Date().toISOString();
          
          console.log('📝 Updating profile with data:', updateData);
          
          const { error: updateError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', user.id);
            
          if (updateError) {
            console.error('❌ Profile update failed:', {
              code: updateError.code,
              message: updateError.message,
              details: updateError.details,
              hint: updateError.hint,
              updateData
            });
            handleSupabaseError(updateError, 'Update user profile');
          } else {
            console.log('✅ Profile updated successfully:', user.id);
          }
        } else {
          console.log('ℹ️ No additional data to update for user:', user.id);
        }
      },
      {
        operation: 'Update user profile',
        userId: user.id,
        timestamp: new Date().toISOString()
      },
      { maxAttempts: 3 }
    );
  };

  // Create user profile if it doesn't exist (for both OAuth and normal registration)
  const ensureUserProfile = async (user: any, additionalData?: { fullName?: string; displayName?: string }): Promise<void> => {
    await withRetry(
      async () => {
        console.log('🔍 Starting ensureUserProfile for user:', {
          userId: user.id,
          email: user.email,
          provider: user.app_metadata?.provider,
          emailConfirmed: user.email_confirmed_at,
          additionalData
        });

        // Check if user profile exists
        console.log('📋 Checking if user profile exists...');
        const { data: existingUser, error: selectError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        console.log('📋 Profile check result:', {
          existingUser: !!existingUser,
          selectError: selectError ? {
            code: selectError.code,
            message: selectError.message,
            details: selectError.details,
            hint: selectError.hint
          } : null
        });

        if (selectError && selectError.code !== 'PGRST116') {
          console.warn('⚠️ Error checking user profile existence:', selectError);
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

          console.log('📝 Creating user profile with data:', userData);

          // Try multiple approaches for user creation
          let profileError = null;
          
          // First attempt: normal insert
          console.log('🔄 Attempt 1: Normal insert...');
          const { error: insertError } = await supabase
            .from('profiles')
            .insert(userData);

          if (insertError) {
            profileError = insertError;
            console.error('❌ First insert attempt failed:', {
              code: insertError.code,
              message: insertError.message,
              details: insertError.details,
              hint: insertError.hint,
              userData
            });
            
            // Second attempt: upsert (insert or update)
            console.log('🔄 Attempt 2: Upsert...');
            const { error: upsertError } = await supabase
              .from('profiles')
              .upsert(userData, { onConflict: 'id' });
              
            if (upsertError) {
              profileError = upsertError;
              console.error('❌ Upsert attempt failed:', {
                code: upsertError.code,
                message: upsertError.message,
                details: upsertError.details,
                hint: upsertError.hint,
                userData
              });
              
              // Third attempt: using service role if available
              console.log('🔄 Attempt 3: Service role insert...');
              try {
                const { error: serviceError } = await supabase
                  .from('profiles')
                  .insert(userData);
                  
                if (serviceError) {
                  profileError = serviceError;
                  console.error('❌ Service role attempt failed:', {
                    code: serviceError.code,
                    message: serviceError.message,
                    details: serviceError.details,
                    hint: serviceError.hint,
                    userData
                  });
                } else {
                  profileError = null; // Success
                  console.log('✅ Service role insert succeeded');
                }
              } catch (serviceAttemptError) {
                console.error('❌ Service role attempt exception:', serviceAttemptError);
              }
            } else {
              profileError = null; // Upsert succeeded
              console.log('✅ Upsert succeeded');
            }
          } else {
            profileError = null; // First insert succeeded
            console.log('✅ First insert succeeded');
          }

          if (profileError) {
            console.error('💥 ALL user profile creation attempts failed:', {
              finalError: {
                code: profileError.code,
                message: profileError.message,
                details: profileError.details,
                hint: profileError.hint
              },
              userId: user.id,
              email: user.email,
              provider: user.app_metadata?.provider,
              userData
            });
            
            // Don't throw error for OAuth users to prevent auth flow interruption
            if (user.app_metadata?.provider) {
              console.warn('⚠️ OAuth user profile creation failed, but continuing auth flow');
            } else {
              console.error('🚨 Throwing error for non-OAuth user');
              handleSupabaseError(profileError, 'Create user profile');
            }
          } else {
            console.log('🎉 User profile created successfully:', user.id);
          }
        } else {
          console.log('ℹ️ User profile already exists:', user.id);
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
    updateUserProfile,
    logout
  };
};
