import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import { Profile } from "../../lib/supabase";
import { AuthState, AuthEvent } from "./auth-types";
import { logAuthEvent, logAuthError, isSessionValid } from "./auth-utils";

export const useAuthState = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true
  });

  // Load user profile from database
  const loadUserProfile = async (userId: string): Promise<Profile | null> => {
    try {
      logAuthEvent(AuthEvent.PROFILE_LOAD_ATTEMPT, { userId });
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        logAuthError(AuthEvent.PROFILE_LOAD_ERROR, error, { userId });
        return null;
      }

      logAuthEvent(AuthEvent.PROFILE_LOAD_SUCCESS, { userId, profile: data });
      return data;
    } catch (error) {
      logAuthError(AuthEvent.PROFILE_LOAD_ERROR, error, { userId });
      return null;
    }
  };

  // Update auth state with new user and session
  const updateAuthState = async (user: User | null, session: Session | null) => {
    logAuthEvent(AuthEvent.AUTH_STATE_CHANGE, { 
      hasUser: !!user, 
      hasSession: !!session,
      sessionValid: session ? isSessionValid(session) : false
    });

    if (user && session && isSessionValid(session)) {
      // Load user profile
      const profile = await loadUserProfile(user.id);
      
      setAuthState({
        user,
        profile,
        session,
        loading: false
      });
    } else {
      // Clear auth state
      setAuthState({
        user: null,
        profile: null,
        session: null,
        loading: false
      });
    }
  };

  // Initialize auth state and set up listener
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        logAuthEvent(AuthEvent.SESSION_LOAD_ATTEMPT);
        
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          logAuthError(AuthEvent.SESSION_LOAD_ERROR, error);
          if (mounted) {
            setAuthState(prev => ({ ...prev, loading: false }));
          }
          return;
        }

        logAuthEvent(AuthEvent.SESSION_LOAD_SUCCESS, { 
          hasSession: !!session,
          sessionValid: session ? isSessionValid(session) : false
        });
        
        if (mounted) {
          await updateAuthState(session?.user || null, session);
        }
      } catch (error) {
        logAuthError(AuthEvent.SESSION_LOAD_ERROR, error);
        if (mounted) {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logAuthEvent(AuthEvent.AUTH_STATE_CHANGE, { event, hasSession: !!session });
        
        if (mounted) {
          await updateAuthState(session?.user || null, session);
        }
      }
    );

    // Initialize auth state
    initializeAuth();

    // Cleanup function
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Refresh user profile
  const refreshProfile = async (): Promise<void> => {
    if (!authState.user) {
      return;
    }

    const profile = await loadUserProfile(authState.user.id);
    setAuthState(prev => ({
      ...prev,
      profile
    }));
  };

  // Update profile in state (optimistic update)
  const updateProfileInState = (updates: Partial<Profile>): void => {
    setAuthState(prev => ({
      ...prev,
      profile: prev.profile ? { ...prev.profile, ...updates } : null
    }));
  };

  // Set loading state
  const setLoading = (loading: boolean): void => {
    setAuthState(prev => ({ ...prev, loading }));
  };

  // Clear auth state (for logout)
  const clearAuthState = (): void => {
    setAuthState({
      user: null,
      profile: null,
      session: null,
      loading: false
    });
  };

  return {
    ...authState,
    refreshProfile,
    updateProfileInState,
    setLoading,
    clearAuthState
  };
};