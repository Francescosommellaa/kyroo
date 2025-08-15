import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/auth";

export default function AuthCallbackPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading: authLoading } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Gestisce il callback OAuth (Google, etc.) e verifica email
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          setError(error.message);
          return;
        }

        if (data.session) {
          // Reindirizza all'app dopo 2 secondi
          setTimeout(() => {
            navigate("/app");
          }, 2000);
        } else {
          // Prova a gestire il callback manualmente per verifica email
          const { error: callbackError } = await supabase.auth.getUser();

          if (callbackError) {
            setError(
              "Errore nella verifica dell'email. Il link potrebbe essere scaduto.",
            );
          } else {
            setTimeout(() => {
              navigate("/app");
            }, 2000);
          }
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Si è verificato un errore imprevisto.");
      } finally {
        setLoading(false);
      }
    };

    // Aspetta che il contesto di autenticazione sia caricato
    if (!authLoading) {
      handleAuthCallback();
    }
  }, [navigate, searchParams, authLoading]);

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
