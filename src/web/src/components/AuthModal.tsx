import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: AuthMode;
}

type AuthMode = "login" | "register" | "reset" | "verify-email";

export default function AuthModal({
  isOpen,
  onClose,
  defaultMode = "login",
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");

  const { signIn, signUp, resetPassword, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode]);

  useEffect(() => {
    if (isOpen) {
      setError("");
      setMessage("");
    }
  }, [isOpen, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (mode === "register") {
        if (password !== confirmPassword) {
          setError("Le password non coincidono");
          return;
        }

        if (password.length < 8) {
          setError("La password deve essere di almeno 8 caratteri");
          return;
        }

        if (displayName.length < 2 || displayName.length > 50) {
          setError("Il nome visualizzato deve essere tra 2 e 50 caratteri");
          return;
        }

        const { error, needsVerification } = await signUp(
          email,
          password,
          displayName,
        );

        if (error) {
          if (error.message.includes("already registered")) {
            setError(
              "Questo indirizzo email è già registrato. Prova ad accedere.",
            );
          } else {
            setError(error.message);
          }
        } else if (needsVerification) {
          setRegisteredEmail(email);
          setMode("verify-email");
          setMessage(
            "Registrazione completata! Controlla la tua email per verificare l'account.",
          );
        } else {
          // Login automatico se la verifica non è richiesta
          onClose();
          navigate("/app");
        }
      } else if (mode === "login") {
        const { error } = await signIn(email, password);

        if (error) {
          setError(error.message);
        } else {
          onClose();
          navigate("/app");
        }
      } else if (mode === "reset") {
        const { error } = await resetPassword(email);

        if (error) {
          setError(error.message);
        } else {
          setMessage(
            "Email di reset inviata! Controlla la tua casella di posta.",
          );
        }
      }
    } catch (err) {
      setError("Si è verificato un errore. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { error } = await resendVerificationEmail();

      if (error) {
        setError(error.message);
      } else {
        setMessage("Email di verifica inviata nuovamente!");
      }
    } catch (err) {
      setError("Errore nell'invio dell'email di verifica");
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    setError("");
    setMessage("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setDisplayName("");
  };

  const getTitle = () => {
    switch (mode) {
      case "login":
        return "Accedi";
      case "register":
        return "Registrati";
      case "reset":
        return "Recupera Password";
      case "verify-email":
        return "Verifica Email";
      default:
        return "Autenticazione";
    }
  };

  const getButtonText = () => {
    if (loading) return "";
    switch (mode) {
      case "login":
        return "Accedi";
      case "register":
        return "Registrati";
      case "reset":
        return "Invia Email";
      case "verify-email":
        return "Invia di nuovo";
      default:
        return "Continua";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-surface border border-border rounded-2xl p-8 w-full max-w-md"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-foreground">
                {getTitle()}
              </h2>
              <button
                onClick={onClose}
                className="text-foreground-secondary hover:text-foreground transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Error/Success Message */}
            {(error || message) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                  error
                    ? "bg-red-500/10 border border-red-500/20 text-red-400"
                    : "bg-green-500/10 border border-green-500/20 text-green-400"
                }`}
              >
                {error ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                {error || message}
              </motion.div>
            )}

            {/* Verify Email Mode */}
            {mode === "verify-email" ? (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-accent-violet/20 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="text-accent-violet" size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Verifica la tua email
                  </h3>
                  <p className="text-foreground-secondary text-sm">
                    Abbiamo inviato un link di verifica a{" "}
                    <strong>{registeredEmail}</strong>. Clicca sul link
                    nell'email per attivare il tuo account.
                  </p>
                </div>

                <div className="space-y-4">
                  <motion.button
                    onClick={handleResendVerification}
                    disabled={loading}
                    className="w-full bg-accent-violet/20 hover:bg-accent-violet/30 text-accent-violet px-6 py-3 rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent-violet focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-50"
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                  >
                    {loading && (
                      <Loader2 className="animate-spin mr-2" size={18} />
                    )}
                    Invia di nuovo email di verifica
                  </motion.button>

                  <button
                    onClick={() => handleModeChange("login")}
                    className="w-full text-foreground-secondary hover:text-foreground text-sm transition-colors"
                  >
                    Torna al login
                  </button>
                </div>
              </div>
            ) : (
              /* Form normale */
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Display Name (solo per registrazione) */}
                {mode === "register" && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Nome visualizzato
                    </label>
                    <div className="relative">
                      <User
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary"
                        size={18}
                      />
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Il tuo nome"
                        required
                        minLength={2}
                        maxLength={50}
                        className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-foreground-secondary focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary"
                      size={18}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="la-tua-email@esempio.com"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-foreground-secondary focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Password (non per reset) */}
                {mode !== "reset" && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary"
                        size={18}
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="La tua password"
                        required
                        minLength={8}
                        className="w-full pl-10 pr-12 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-foreground-secondary focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary hover:text-foreground transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Confirm Password (solo per registrazione) */}
                {mode === "register" && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Conferma Password
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary"
                        size={18}
                      />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Conferma la password"
                        required
                        minLength={8}
                        className="w-full pl-10 pr-12 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-foreground-secondary focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-accent-violet to-accent-cyan hover:from-accent-violet/90 hover:to-accent-cyan/90 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent-violet focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-50 flex items-center justify-center gap-2"
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  {loading && <Loader2 className="animate-spin" size={18} />}
                  {getButtonText()}
                </motion.button>
              </form>
            )}

            {/* Mode switching */}
            {mode !== "verify-email" && (
              <div className="mt-8 text-center space-y-3">
                {mode === "login" && (
                  <>
                    <button
                      onClick={() => handleModeChange("register")}
                      className="text-accent-cyan hover:underline text-sm"
                    >
                      Non hai un account? Registrati
                    </button>
                    <br />
                    <button
                      onClick={() => handleModeChange("reset")}
                      className="text-foreground-secondary hover:text-foreground text-sm"
                    >
                      Password dimenticata?
                    </button>
                  </>
                )}

                {mode === "register" && (
                  <button
                    onClick={() => handleModeChange("login")}
                    className="text-accent-cyan hover:underline text-sm"
                  >
                    Hai già un account? Accedi
                  </button>
                )}

                {mode === "reset" && (
                  <button
                    onClick={() => handleModeChange("login")}
                    className="text-accent-cyan hover:underline text-sm"
                  >
                    Torna al login
                  </button>
                )}
              </div>
            )}

            <p className="text-xs text-foreground-secondary mt-6 text-center">
              Continuando accetti i nostri{" "}
              <a href="/terms" className="text-accent-cyan hover:underline">
                Termini di Servizio
              </a>{" "}
              e{" "}
              <a href="/privacy" className="text-accent-cyan hover:underline">
                Privacy Policy
              </a>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
