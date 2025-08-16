import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
// Removed unused imports

export default function AuthCallbackPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  // Removed unused variables for TypeScript compliance

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Gestisce il callback OAuth/email verification
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          setError('Errore durante il recupero della sessione');
          setLoading(false);
          return;
        }

        // Se abbiamo una sessione attiva, reindirizza all'app
        if (data?.session?.user) {
          console.log("Session found, redirecting to app");
          navigate('/app/chat', { replace: true });
          return;
        }

        // Controlla se ci sono parametri di callback OAuth o email verification
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const searchParams = new URLSearchParams(window.location.search);
        
        const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');
        const type = hashParams.get('type') || searchParams.get('type');
        const errorParam = hashParams.get('error') || searchParams.get('error');
        const errorDescription = hashParams.get('error_description') || searchParams.get('error_description');
        
        // Callback parameters processed

        // Se ci sono errori nei parametri URL
        if (errorParam) {
          console.error('OAuth error:', errorParam, errorDescription);
          setError(errorDescription || 'Errore durante l\'autenticazione');
          setLoading(false);
          return;
        }

        // Se abbiamo token di accesso (OAuth callback)
        if (accessToken && refreshToken) {
          console.log('Processing OAuth callback...');
          
          // Aspetta che Supabase processi automaticamente il callback
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Ricontrolla la sessione con retry logic
          let sessionEstablished = false;
          let attempts = 0;
          const maxAttempts = 5;
          
          while (!sessionEstablished && attempts < maxAttempts) {
            attempts++;
            console.log(`Session check attempt ${attempts}/${maxAttempts}`);
            
            const { data: newSessionData } = await supabase.auth.getSession();
            
            if (newSessionData?.session?.user) {
              console.log("OAuth session established successfully");
              
              // Verifica che il profilo utente esista, altrimenti aspetta di più
              try {
                const { data: userProfile } = await supabase
                  .from('profiles')
                  .select('id')
                  .eq('id', newSessionData.session.user.id)
                  .single();
                  
                if (userProfile) {
                  console.log('User profile found, redirecting...');
                  sessionEstablished = true;
                  navigate('/app/chat', { replace: true });
                  return;
                } else {
                  console.log('User profile not found yet, waiting...');
                  await new Promise(resolve => setTimeout(resolve, 2000));
                }
              } catch (profileError) {
                console.log('Profile check failed, waiting for creation...');
                await new Promise(resolve => setTimeout(resolve, 2000));
              }
            } else {
              console.log(`OAuth session not established yet, attempt ${attempts}`);
              
              if (attempts < maxAttempts) {
                // Prova a fare refresh della sessione
                const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
                
                if (refreshData?.session?.user) {
                  console.log("Session refreshed successfully");
                  // Continua il loop per verificare il profilo
                } else if (refreshError) {
                  console.error('Refresh error:', refreshError);
                }
                
                // Aspetta prima del prossimo tentativo
                await new Promise(resolve => setTimeout(resolve, 2000));
              }
            }
          }
          
          if (!sessionEstablished) {
            console.error('Failed to establish OAuth session after multiple attempts');
            setError('Errore durante l\'autenticazione OAuth. Riprova.');
            setLoading(false);
            return;
          }
        }

        // Se è un callback di verifica email
        if (type === 'signup' || type === 'email_change' || type === 'recovery') {
          console.log('Processing email verification callback...');
          
          // Per la verifica email, aspetta un po' di più
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const { data: verificationData } = await supabase.auth.getSession();
          
          if (verificationData?.session?.user) {
            console.log("Email verification successful");
            navigate('/app/chat', { replace: true });
            return;
          }
        }

        // Se arriviamo qui, qualcosa è andato storto
        console.log("No session found after callback processing");
        setError('Errore nella verifica. Il link potrebbe essere scaduto o non valido.');
        
      } catch (error) {
        console.error('Auth callback error:', error);
        setError('Si è verificato un errore imprevisto durante l\'autenticazione.');
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Loader2
            className="animate-spin mx-auto text-accent-violet"
            size={48}
          />
          <h2 className="text-xl font-semibold text-foreground">
            Autenticazione in corso...
          </h2>
          <p className="text-foreground-secondary">
            Stiamo completando l'accesso
          </p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          className="text-center space-y-6 max-w-md mx-auto p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="text-red-400" size={32} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Errore di verifica
            </h2>
            <p className="text-foreground-secondary">{error}</p>
          </div>
          <motion.button
            onClick={() => navigate("/")}
            className="bg-accent-violet hover:bg-accent-violet/90 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Torna alla home
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div
        className="text-center space-y-6 max-w-md mx-auto p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="text-green-400" size={32} />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Accesso completato con successo!
          </h2>
          <p className="text-foreground-secondary">
            Verrai reindirizzato all'app...
          </p>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="animate-spin text-accent-violet" size={20} />
          <span className="text-foreground-secondary text-sm">
            Reindirizzamento in corso...
          </span>
        </div>
      </motion.div>
    </div>
  );
}
