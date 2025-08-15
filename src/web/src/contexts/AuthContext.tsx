import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase, type Profile } from "../lib/supabase";
import { useEmailFallback } from "../components/EmailConfigFallback";

interface AuthResult {
  success: boolean;
  error?: string;
  needsVerification?: boolean;
  details?: any;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName?: string,
    displayName?: string,
  ) => Promise<AuthResult>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
  updateProfile: (
    updates: Partial<Profile>,
  ) => Promise<AuthResult>;
  uploadAvatar: (file: File) => Promise<AuthResult & { url?: string }>;
  resendVerificationEmail: () => Promise<AuthResult>;
  logout: () => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { showFallback } = useEmailFallback();

  useEffect(() => {
    // Get initial session
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.warn("Session loading error:", error.message);
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          loadProfile(session.user.id).finally(() => {
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      })
      .catch((error) => {
        console.warn("Session loading exception:", error);
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Profile loading timeout")), 2000),
      );

      const queryPromise = supabase
        .from("user")
        .select("*")
        .eq("id", userId)
        .single();

      const { data, error } = (await Promise.race([
        queryPromise,
        timeoutPromise,
      ])) as any;

      if (error) {
        console.warn("Profile loading error:", error.message);
        setProfile(null);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.warn("Profile loading exception:", error);
      setProfile(null);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName?: string,
    displayName?: string,
  ): Promise<AuthResult> => {
    try {
      console.log('🔄 Tentativo di registrazione per:', email);
      
      // Verifica che Supabase sia configurato correttamente
      if (!supabase) {
        console.error('❌ Supabase non configurato');
        return {
          success: false,
          error: "Configurazione Supabase non valida",
          details: { code: 'SUPABASE_NOT_CONFIGURED' }
        };
      }

      // Client-side validation for full name
      if (fullName && (fullName.length < 2 || fullName.length > 100)) {
        console.warn('❌ Nome completo non valido:', fullName?.length);
        return {
          success: false,
          error: "Il nome completo deve essere tra 2 e 100 caratteri",
          details: { code: 'INVALID_FULL_NAME', length: fullName?.length }
        };
      }

      // Client-side validation for display name
      if (displayName && (displayName.length < 2 || displayName.length > 50)) {
        console.warn('❌ Nome visualizzato non valido:', displayName?.length);
        return {
          success: false,
          error: "Il nome visualizzato deve essere tra 2 e 50 caratteri",
          details: { code: 'INVALID_DISPLAY_NAME', length: displayName?.length }
        };
      }

      // Client-side validation for password
      if (password.length < 8) {
        console.warn('❌ Password troppo corta:', password.length);
        return {
          success: false,
          error: "La password deve essere di almeno 8 caratteri",
          details: { code: 'PASSWORD_TOO_SHORT', length: password.length }
        };
      }

      console.log('📧 Invio richiesta di registrazione a Supabase...');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            display_name: displayName || fullName, // Se display_name non è specificato, usa full_name
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('❌ Errore Supabase durante registrazione:', error);
        
        // Gestisci errori specifici
        if (error.message.includes("API key") || error.message.includes("Invalid API key")) {
          showFallback('Errore di configurazione del servizio. Contatta il supporto.', 'API_KEY_ERROR', email);
          return {
            success: false,
            error: "Errore di configurazione del servizio. Contatta il supporto.",
            details: { code: 'API_KEY_ERROR', originalError: error.message }
          };
        }
        
        if (error.message.includes("User already registered")) {
          return {
            success: false,
            error: "Un utente con questa email è già registrato. Prova ad accedere.",
            details: { code: 'USER_ALREADY_EXISTS', originalError: error.message }
          };
        }
        
        if (error.message.includes("Invalid email")) {
          return {
            success: false,
            error: "Formato email non valido. Controlla e riprova.",
            details: { code: 'INVALID_EMAIL', originalError: error.message }
          };
        }
        
        if (error.message.includes("Password should be")) {
          return {
            success: false,
            error: "La password non rispetta i requisiti di sicurezza.",
            details: { code: 'PASSWORD_REQUIREMENTS', originalError: error.message }
          };
        }
        
        if (error.message.includes("Database error") || error.message.includes("saving new user")) {
          showFallback('Errore nel salvataggio dei dati utente. Il nostro team è stato notificato.', 'DATABASE_SAVE_ERROR', email);
          return {
            success: false,
            error: "Errore nel salvataggio dei dati utente. Il trigger del database potrebbe non essere configurato correttamente.",
            details: { code: 'DATABASE_SAVE_ERROR', originalError: error.message }
          };
        }
        
        return {
          success: false,
          error: `Errore durante la registrazione: ${error.message}`,
          details: { code: 'UNKNOWN_SIGNUP_ERROR', originalError: error.message }
        };
      }

      console.log('✅ Registrazione Supabase completata:', data.user?.id);
      
      // Se l'utente è stato creato ma non confermato, restituisci needsVerification
      if (data.user && !data.user.email_confirmed_at) {
        console.log('📧 Email di verifica richiesta per:', email);
        return { 
          success: true, 
          needsVerification: true,
          details: { userId: data.user.id, email: data.user.email }
        };
      }

      console.log('✅ Registrazione completata senza verifica email');
      return { 
        success: true,
        details: { userId: data.user?.id, email: data.user?.email }
      };
    } catch (err: any) {
      console.error('💥 Errore imprevisto durante registrazione:', err);
      return {
        success: false,
        error: "Errore di connessione al servizio. Verifica la tua connessione internet e riprova.",
        details: { code: 'CONNECTION_ERROR', originalError: err.message }
      };
    }
  };

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    try {
      console.log('🔄 Tentativo di accesso per:', email);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Errore durante accesso:', error);
        
        // Gestisci errori specifici
        if (error.message.includes("email not confirmed")) {
          return {
            success: false,
            error: "Email non verificata. Controlla la tua casella di posta e clicca sul link di verifica.",
            details: { code: 'EMAIL_NOT_CONFIRMED', originalError: error.message }
          };
        }
        
        if (error.message.includes("Invalid login credentials")) {
          return {
            success: false,
            error: "Email o password non corretti. Verifica i tuoi dati e riprova.",
            details: { code: 'INVALID_CREDENTIALS', originalError: error.message }
          };
        }
        
        if (error.message.includes("Too many requests")) {
          return {
            success: false,
            error: "Troppi tentativi di accesso. Riprova tra qualche minuto.",
            details: { code: 'TOO_MANY_REQUESTS', originalError: error.message }
          };
        }
        
        return {
          success: false,
          error: `Errore durante l'accesso: ${error.message}`,
          details: { code: 'UNKNOWN_SIGNIN_ERROR', originalError: error.message }
        };
      }

      console.log('✅ Accesso completato con successo');
      return { success: true };
    } catch (err: any) {
      console.error('💥 Errore imprevisto durante accesso:', err);
      showFallback('Errore di connessione. Verifica la tua connessione internet.', 'CONNECTION_ERROR');
      return {
        success: false,
        error: "Errore di connessione. Verifica la tua connessione internet e riprova.",
        details: { code: 'CONNECTION_ERROR', originalError: err.message }
      };
    }
  };

  const signInWithGoogle = async (): Promise<AuthResult> => {
    try {
      console.log('🔄 Tentativo di accesso con Google...');
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        console.error('❌ Errore durante accesso Google:', error);
        return {
          success: false,
          error: `Errore durante l'accesso con Google: ${error.message}`,
          details: { code: 'GOOGLE_OAUTH_ERROR', originalError: error.message }
        };
      }

      console.log('✅ Reindirizzamento Google OAuth avviato');
      return { success: true };
    } catch (err: any) {
      console.error('💥 Errore imprevisto durante accesso Google:', err);
      return {
        success: false,
        error: "Errore di connessione con Google. Verifica la tua connessione e riprova.",
        details: { code: 'CONNECTION_ERROR', originalError: err.message }
      };
    }
  };

  const signOut = async (): Promise<AuthResult> => {
    try {
      console.log('🔄 Tentativo di logout...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Errore durante logout:', error);
        return {
          success: false,
          error: `Errore durante il logout: ${error.message}`,
          details: { code: 'LOGOUT_ERROR', originalError: error.message }
        };
      }
      
      console.log('✅ Logout completato con successo');
      return { success: true };
    } catch (err: any) {
      console.error('💥 Errore imprevisto durante logout:', err);
      return {
        success: false,
        error: "Errore di connessione durante il logout.",
        details: { code: 'CONNECTION_ERROR', originalError: err.message }
      };
    }
  };

  const resetPassword = async (email: string): Promise<AuthResult> => {
    try {
      console.log('🔄 Tentativo di reset password per:', email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) {
        console.error('❌ Errore durante reset password:', error);
        
        if (error.message.includes("Invalid email")) {
          return {
            success: false,
            error: "Formato email non valido. Controlla e riprova.",
            details: { code: 'INVALID_EMAIL', originalError: error.message }
          };
        }
        
        if (error.message.includes("Email rate limit exceeded")) {
          return {
            success: false,
            error: "Hai già richiesto un reset password di recente. Attendi qualche minuto.",
            details: { code: 'EMAIL_RATE_LIMIT', originalError: error.message }
          };
        }
        
        return {
          success: false,
          error: `Errore durante il reset della password: ${error.message}`,
          details: { code: 'PASSWORD_RESET_ERROR', originalError: error.message }
        };
      }
      
      console.log('✅ Email di reset password inviata');
      return { 
        success: true,
        details: { email, redirectTo: `${window.location.origin}/auth/reset-password` }
      };
    } catch (err: any) {
      console.error('💥 Errore imprevisto durante reset password:', err);
      return {
        success: false,
        error: "Errore di connessione durante il reset della password.",
        details: { code: 'CONNECTION_ERROR', originalError: err.message }
      };
    }
  };

  const resendVerificationEmail = async (): Promise<AuthResult> => {
    try {
      if (!user?.email) {
        console.warn('❌ Tentativo di reinvio email senza utente loggato');
        return {
          success: false,
          error: "Nessun utente loggato. Effettua prima l'accesso.",
          details: { code: 'NO_USER_LOGGED_IN' }
        };
      }

      console.log('📧 Reinvio email di verifica per:', user.email);
      
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('❌ Errore durante reinvio email:', error);
        
        if (error.message.includes("Email rate limit exceeded")) {
          return {
            success: false,
            error: "Hai già richiesto un'email di verifica di recente. Attendi qualche minuto prima di riprovare.",
            details: { code: 'EMAIL_RATE_LIMIT', originalError: error.message }
          };
        }
        
        return {
          success: false,
          error: `Errore durante il reinvio dell'email: ${error.message}`,
          details: { code: 'EMAIL_RESEND_ERROR', originalError: error.message }
        };
      }

      console.log('✅ Email di verifica reinviata con successo');
      return { 
        success: true,
        details: { email: user.email, redirectTo: `${window.location.origin}/auth/callback` }
      };
    } catch (err: any) {
      console.error('💥 Errore imprevisto durante reinvio email:', err);
      showFallback('Errore di connessione durante il reinvio dell\'email.', 'CONNECTION_ERROR', user?.email);
      return {
        success: false,
        error: "Errore di connessione durante il reinvio dell'email.",
        details: { code: 'CONNECTION_ERROR', originalError: err.message }
      };
    }
  };

  const logout = signOut;

  const updatePassword = async (password: string): Promise<AuthResult> => {
    try {
      console.log('🔄 Tentativo di aggiornamento password...');
      
      if (password.length < 8) {
        console.warn('❌ Password troppo corta:', password.length);
        return {
          success: false,
          error: "La password deve essere di almeno 8 caratteri",
          details: { code: 'PASSWORD_TOO_SHORT', length: password.length }
        };
      }
      
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        console.error('❌ Errore durante aggiornamento password:', error);
        
        if (error.message.includes("Password should be")) {
          return {
            success: false,
            error: "La password non rispetta i requisiti di sicurezza.",
            details: { code: 'PASSWORD_REQUIREMENTS', originalError: error.message }
          };
        }
        
        return {
          success: false,
          error: `Errore durante l'aggiornamento della password: ${error.message}`,
          details: { code: 'PASSWORD_UPDATE_ERROR', originalError: error.message }
        };
      }
      
      console.log('✅ Password aggiornata con successo');
      return { success: true };
    } catch (err: any) {
      console.error('💥 Errore imprevisto durante aggiornamento password:', err);
      return {
        success: false,
        error: "Errore di connessione durante l'aggiornamento della password.",
        details: { code: 'CONNECTION_ERROR', originalError: err.message }
      };
    }
  };

  const updateProfile = async (updates: Partial<Profile>): Promise<AuthResult> => {
    try {
      console.log('🔄 Tentativo di aggiornamento profilo...');
      
      if (!user) {
        console.warn('❌ Tentativo di aggiornamento profilo senza utente loggato');
        return {
          success: false,
          error: "Utente non autenticato. Effettua prima l'accesso.",
          details: { code: 'USER_NOT_AUTHENTICATED' }
        };
      }

      const { error } = await supabase
        .from("user")
        .update(updates)
        .eq("id", user.id);

      if (error) {
        console.error('❌ Errore durante aggiornamento profilo:', error);
        
        if (error.message.includes("permission denied")) {
          return {
            success: false,
            error: "Non hai i permessi per aggiornare questo profilo.",
            details: { code: 'PERMISSION_DENIED', originalError: error.message }
          };
        }
        
        return {
          success: false,
          error: `Errore durante l'aggiornamento del profilo: ${error.message}`,
          details: { code: 'PROFILE_UPDATE_ERROR', originalError: error.message }
        };
      }

      // Reload profile
      await loadProfile(user.id);
      
      console.log('✅ Profilo aggiornato con successo');
      return { 
        success: true,
        details: { userId: user.id, updates }
      };
    } catch (err: any) {
      console.error('💥 Errore imprevisto durante aggiornamento profilo:', err);
      return {
        success: false,
        error: "Errore di connessione durante l'aggiornamento del profilo.",
        details: { code: 'CONNECTION_ERROR', originalError: err.message }
      };
    }
  };

  const uploadAvatar = async (file: File): Promise<AuthResult & { url?: string }> => {
    try {
      console.log('🔄 Tentativo di caricamento avatar...');
      
      if (!user) {
        console.warn('❌ Tentativo di caricamento avatar senza utente loggato');
        return {
          success: false,
          error: "Utente non autenticato. Effettua prima l'accesso.",
          details: { code: 'USER_NOT_AUTHENTICATED' }
        };
      }

      // Verifica il tipo di file
      if (!file.type.startsWith("image/")) {
        console.warn('❌ Tipo di file non valido:', file.type);
        return {
          success: false,
          error: "Il file deve essere un'immagine (JPG, PNG, GIF, etc.).",
          details: { code: 'INVALID_FILE_TYPE', fileType: file.type }
        };
      }

      // Verifica la dimensione del file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        console.warn('❌ File troppo grande:', file.size);
        return {
          success: false,
          error: "Il file deve essere inferiore a 5MB.",
          details: { code: 'FILE_TOO_LARGE', fileSize: file.size }
        };
      }

      console.log("Starting avatar upload for user:", user.id);
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      console.log("Uploading file:", fileName);

      // First, try to remove existing file (ignore errors)
      await supabase.storage
        .from("avatars")
        .remove([fileName])
        .catch(() => {}); // Ignore removal errors

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error("Upload error:", uploadError);

        // If bucket doesn't exist, show helpful error
        if (uploadError.message.includes("Bucket not found")) {
          return {
            success: false,
            error: "Il bucket per gli avatar non è configurato. Contatta il supporto.",
            details: { code: 'STORAGE_NOT_CONFIGURED', originalError: uploadError.message }
          };
        }
        
        if (uploadError.message.includes("permission denied")) {
          return {
            success: false,
            error: "Non hai i permessi per caricare file.",
            details: { code: 'PERMISSION_DENIED', originalError: uploadError.message }
          };
        }

        return {
          success: false,
          error: `Errore durante il caricamento dell'avatar: ${uploadError.message}`,
          details: { code: 'UPLOAD_ERROR', originalError: uploadError.message }
        };
      }

      console.log("File uploaded successfully");

      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);

      console.log("Generated public URL:", data.publicUrl);

      // Update profile with new avatar URL
      const updateResult = await updateProfile({ avatar_url: data.publicUrl });

      if (!updateResult.success) {
        console.error("Profile update error:", updateResult.error);
        return {
          success: false,
          error: updateResult.error || "Errore durante l'aggiornamento del profilo",
          details: { code: 'PROFILE_UPDATE_FAILED', ...updateResult.details }
        };
      }

      // Force refresh profile data
      if (user) {
        await loadProfile(user.id);
      }

      console.log("Avatar updated successfully");
      return { 
        success: true, 
        url: data.publicUrl,
        details: { userId: user.id, fileName, publicUrl: data.publicUrl }
      };
    } catch (err: any) {
      console.error("Avatar upload failed:", err);
      return {
        success: false,
        error: "Errore di connessione durante il caricamento dell'avatar.",
        details: { code: 'CONNECTION_ERROR', originalError: err.message }
      };
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    uploadAvatar,
    resendVerificationEmail,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
