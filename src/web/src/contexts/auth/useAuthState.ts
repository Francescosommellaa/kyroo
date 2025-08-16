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

  // Cache for profile loading attempts to avoid unnecessary retries
  const [profileLoadAttempts, setProfileLoadAttempts] = useState<Map<string, number>>(new Map());
  const [lastSuccessfulProfileLoad, setLastSuccessfulProfileLoad] = useState<Map<string, number>>(new Map());
  const [activeProfileLoads, setActiveProfileLoads] = useState<Map<string, Promise<Profile | null>>>(new Map());
  const [lastLogTime, setLastLogTime] = useState<Map<string, number>>(new Map());

  // Create user profile with default values
  const createUserProfile = async (user: User): Promise<Profile | null> => {
    try {
      logAuthEvent(AuthEvent.PROFILE_CREATE_ATTEMPT, { userId: user.id });
      
      const profileData = {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        display_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        role: 'user' as const,
        plan: 'free' as const,
        email_verified: !!user.email_confirmed_at
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        logAuthError(AuthEvent.PROFILE_CREATE_ERROR, error, { userId: user.id });
        return null;
      }

      logAuthEvent(AuthEvent.PROFILE_CREATE_SUCCESS, { userId: user.id, profile: data });
      return data;
    } catch (error) {
      logAuthError(AuthEvent.PROFILE_CREATE_ERROR, error, { userId: user.id });
      return null;
    }
  };

  // Load user profile from database with intelligent retry logic
  const loadUserProfile = async (userId: string, user?: User, skipCache: boolean = false): Promise<Profile | null> => {
    try {
      // Check if there's already an active load for this user (debounce)
      const activeLoad = activeProfileLoads.get(userId);
      if (activeLoad) {
        // Throttle debug logs to avoid spam
        const lastLog = lastLogTime.get(`reuse_${userId}`) || 0;
        const now = Date.now();
        if (now - lastLog > 5000) { // Log at most once every 5 seconds
          console.log('[AUTH DEBUG] Reusing active profile load for user:', userId);
          setLastLogTime(prev => new Map(prev.set(`reuse_${userId}`, now)));
        }
        return await activeLoad;
      }

      // Create the load promise
      const loadPromise = (async (): Promise<Profile | null> => {
        try {
          // Check if we recently loaded this profile successfully (within last 30 seconds)
          const lastLoad = lastSuccessfulProfileLoad.get(userId);
          const now = Date.now();
          if (!skipCache && lastLoad && (now - lastLoad) < 30000) {
            // Throttle cache usage logs
            const lastCacheLog = lastLogTime.get(`cache_${userId}`) || 0;
            if (now - lastCacheLog > 10000) { // Log at most once every 10 seconds
              console.log('[AUTH DEBUG] Using recent profile load cache for user:', userId);
              setLastLogTime(prev => new Map(prev.set(`cache_${userId}`, now)));
            }
            // If we have a cached successful load, try a quick load without timeout
            const quickResult = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single();
            
            if (!quickResult.error) {
              // Throttle success logs
              const lastSuccessLog = lastLogTime.get(`success_${userId}`) || 0;
              if (now - lastSuccessLog > 15000) { // Log at most once every 15 seconds
                console.log('[AUTH DEBUG] Quick profile load successful for user:', userId);
                setLastLogTime(prev => new Map(prev.set(`success_${userId}`, now)));
              }
              return quickResult.data;
            }
          }

          // Check retry attempts to avoid infinite loops
          const attempts = profileLoadAttempts.get(userId) || 0;
          if (attempts >= 3) {
            console.log('[AUTH DEBUG] Max retry attempts reached for user:', userId);
            return null;
          }

          // Increment attempt counter
          setProfileLoadAttempts(prev => new Map(prev.set(userId, attempts + 1)));
          
          logAuthEvent(AuthEvent.PROFILE_LOAD_ATTEMPT, { userId, attempt: attempts + 1 });
          // Only log attempt details for first attempt or every 3rd attempt to reduce noise
          if (attempts === 0 || attempts % 3 === 0) {
            console.log('[AUTH DEBUG] Starting profile load for user:', userId, 'attempt:', attempts + 1);
          }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.log('[AUTH DEBUG] Profile load error:', error.code, error.message);
        
        // Categorize errors to reduce unnecessary logging
        const isTemporaryError = error.code === 'PGRST301' || // Row not found
                                error.code === 'PGRST204' || // No rows returned
                                error.message?.includes('network') ||
                                error.message?.includes('timeout') ||
                                error.message?.includes('connection');
        
        const isProfileNotFound = error.code === 'PGRST116' || 
                                 error.message?.includes('not found') ||
                                 error.code === 'PGRST301';
        
        // Only log as error if it's not temporary and not a simple "profile not found"
        if (!isTemporaryError && !isProfileNotFound) {
          logAuthError(AuthEvent.PROFILE_LOAD_ERROR, error, { userId });
        } else if (isTemporaryError && attempts >= 2) {
          // Only log temporary errors after multiple attempts
          console.warn('[AUTH WARN] Persistent temporary error after multiple attempts:', error.message);
        }
        
        // If profile doesn't exist and we have user data, create it automatically
        if (isProfileNotFound && user) {
          logAuthEvent(AuthEvent.PROFILE_NOT_FOUND, { userId });
          console.log('[AUTH DEBUG] Profile not found, creating new profile for user:', userId);
          const newProfile = await createUserProfile(user);
          
          // Only log error if profile creation fails AND it's critical
          if (!newProfile) {
            console.log('[AUTH DEBUG] Profile creation failed for user:', userId);
            // Don't log as error since this might resolve on retry
            console.warn('[AUTH WARN] Failed to create user profile, will retry on next auth attempt');
          } else {
            console.log('[AUTH DEBUG] Profile created successfully for user:', userId);
          }
          
          return newProfile;
        }
        
        return null;
      }

      console.log('[AUTH DEBUG] Profile loaded successfully for user:', userId);
      logAuthEvent(AuthEvent.PROFILE_LOAD_SUCCESS, { userId, profile: data });
      
      // Reset attempt counter and update successful load cache
      setProfileLoadAttempts(prev => {
        const newMap = new Map(prev);
        newMap.delete(userId);
        return newMap;
      });
      setLastSuccessfulProfileLoad(prev => new Map(prev.set(userId, Date.now())));
      
      return data;
        } catch (error) {
          console.log('[AUTH DEBUG] Unexpected error in loadUserProfile:', error);
          
          // Reset attempt counter on unexpected errors
          setProfileLoadAttempts(prev => {
            const newMap = new Map(prev);
            newMap.delete(userId);
            return newMap;
          });
          
          // Categorize and handle different types of errors appropriately
          if (error instanceof Error) {
            const isNetworkError = error.message.includes('network') || 
                                  error.message.includes('connection') ||
                                  error.message.includes('timeout');
            
            const isTemporaryError = isNetworkError || 
                                    error.message.includes('temporary') ||
                                    error.message.includes('retry');
            
            if (isNetworkError) {
              // Only log network errors as warnings after first attempt
              if (attempts > 0) {
                console.warn('[AUTH WARN] Network error during profile load, will retry');
              }
            } else if (!isTemporaryError) {
              // Only log non-temporary errors as actual errors
              logAuthError(AuthEvent.PROFILE_LOAD_ERROR, error, { userId });
            }
          } else {
            // Log unknown error types only if they persist
            if (attempts > 1) {
              logAuthError(AuthEvent.PROFILE_LOAD_ERROR, error, { userId });
            }
          }
          return null;
        } finally {
          // Clean up active load
          setActiveProfileLoads(prev => {
            const newMap = new Map(prev);
            newMap.delete(userId);
            return newMap;
          });
        }
      })();

      // Store the active load promise
      setActiveProfileLoads(prev => new Map(prev.set(userId, loadPromise)));
      
      return await loadPromise;
    } catch (error) {
      console.log('[AUTH DEBUG] Error in loadUserProfile wrapper:', error);
      // Clean up active load on error
      setActiveProfileLoads(prev => {
        const newMap = new Map(prev);
        newMap.delete(userId);
        return newMap;
      });
      return null;
    }
  };

  // Update auth state with new user and session
  const updateAuthState = async (user: User | null, session: Session | null) => {
    console.log('[AUTH DEBUG] updateAuthState called with:', { hasUser: !!user, hasSession: !!session });
    
    logAuthEvent(AuthEvent.AUTH_STATE_CHANGE, { 
      hasUser: !!user, 
      hasSession: !!session,
      sessionValid: session ? isSessionValid(session) : false
    });

    if (user && session && isSessionValid(session)) {
      console.log('[AUTH DEBUG] Valid user and session, loading profile for user:', user.id);
      
      // First, set the user and session immediately to improve perceived performance
      setAuthState(prev => ({
        ...prev,
        user,
        session,
        loading: true // Keep loading true while we fetch profile
      }));
      
      try {
        // Check if we already have this user's profile in state and it's recent
        if (authState.profile && authState.profile.id === user.id) {
          console.log('[AUTH DEBUG] Using existing profile from state');
          setAuthState({
            user,
            profile: authState.profile,
            session,
            loading: false
          });
          return;
        }
        
        // Use adaptive timeout based on previous attempts
        const attempts = profileLoadAttempts.get(user.id) || 0;
        const timeoutMs = attempts === 0 ? 3000 : 5000; // First attempt: 3s, subsequent: 5s
        
        const timeoutPromise = new Promise<Profile | null>((_, reject) => {
          setTimeout(() => {
            // Only log timeout as warning if it's not the first attempt or if we're in debug mode
            if (attempts > 0 || process.env.NODE_ENV === 'development') {
              console.warn(`[AUTH WARN] Profile loading timeout after ${timeoutMs}ms for user:`, user.id, 'attempt:', attempts + 1);
            }
            reject(new Error('Profile loading timeout'));
          }, timeoutMs);
        });
        
        // Load user profile (create if doesn't exist) with adaptive timeout
        const profile = await Promise.race([
          loadUserProfile(user.id, user),
          timeoutPromise
        ]);
        
        console.log('[AUTH DEBUG] Profile loading completed, setting auth state with profile:', !!profile);
        setAuthState({
          user,
          profile,
          session,
          loading: false
        });
        console.log('[AUTH DEBUG] Auth state updated successfully');
      } catch (error) {
        console.log('[AUTH DEBUG] Error during profile loading:', error);
        // Only log timeout errors as warnings since they might resolve on retry
        if (error instanceof Error && error.message.includes('timeout')) {
          // Only log timeout warnings for repeated failures
          const attempts = profileLoadAttempts.get(user.id) || 0;
          if (attempts >= 1) {
            console.warn('[AUTH WARN] Profile loading timeout, continuing without profile');
          }
        } else {
          logAuthError(AuthEvent.PROFILE_LOAD_ERROR, error, { userId: user.id });
        }
        // Even if profile loading fails, set user and session but with null profile
        console.log('[AUTH DEBUG] Setting auth state without profile due to error');
        setAuthState({
          user,
          profile: null,
          session,
          loading: false
        });
      }
    } else {
      console.log('[AUTH DEBUG] No valid user/session, clearing auth state');
      // Clear auth state and reset caches
      setProfileLoadAttempts(new Map());
      setLastSuccessfulProfileLoad(new Map());
      setAuthState({
        user: null,
        profile: null,
        session: null,
        loading: false
      });
    }
  };

  // Clear profile load attempts and cache when no valid user/session
  useEffect(() => {
    if (!authState.user || !authState.session) {
       setProfileLoadAttempts(new Map());
       setLastSuccessfulProfileLoad(new Map());
       setActiveProfileLoads(new Map());
       setLastLogTime(new Map());
     }
  }, [authState.user, authState.session]);

  // Cleanup old cache entries every 5 minutes to prevent memory leaks
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      const maxAge = 5 * 60 * 1000; // 5 minutes
      
      setLastSuccessfulProfileLoad(prev => {
        const newMap = new Map();
        for (const [userId, timestamp] of prev.entries()) {
          if (now - timestamp < maxAge) {
            newMap.set(userId, timestamp);
          }
        }
        return newMap;
      });
      
      // Reset attempt counters older than 5 minutes
       setProfileLoadAttempts(prev => {
         const newMap = new Map();
         // Only keep recent attempts to allow retries after some time
         return newMap;
       });
       
       // Cleanup old log timestamps to prevent memory leaks
       setLastLogTime(prev => {
         const newMap = new Map();
         for (const [key, timestamp] of prev.entries()) {
           if (now - timestamp < maxAge) {
             newMap.set(key, timestamp);
           }
         }
         return newMap;
       });
    }, 5 * 60 * 1000); // Run every 5 minutes
    
    return () => clearInterval(cleanupInterval);
  }, []);

  // Initialize auth state and set up listener
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        logAuthEvent(AuthEvent.SESSION_LOAD_ATTEMPT);
        
        // Set a more reasonable timeout for session loading
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Session loading timeout')), 8000); // 8 second timeout
        });
        
        // Get initial session with timeout
        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          timeoutPromise
        ]);
        
        const { data: { session }, error } = sessionResult;
        
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

    const profile = await loadUserProfile(authState.user.id, authState.user);
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