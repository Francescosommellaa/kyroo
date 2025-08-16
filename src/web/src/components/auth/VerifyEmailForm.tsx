import { Mail } from 'lucide-react';
import { useAuth } from '../../contexts/auth';
import { AuthMode } from './auth-modal-types';

interface VerifyEmailFormProps {
  email: string;
  isLoading: boolean;
  error: string | null;
  message: string | null;
  onModeChange: (mode: AuthMode) => void;
  onResendVerification?: () => Promise<void>;
}

export function VerifyEmailForm({ email, isLoading, error, message, onModeChange, onResendVerification }: VerifyEmailFormProps) {
  const { resendVerificationEmail } = useAuth();

  const handleResendEmail = async () => {
    try {
      if (onResendVerification) {
        await onResendVerification();
      } else {
        await resendVerificationEmail();
      }
    } catch (error) {
      console.error('Resend verification email error:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      
      {message && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <p className="text-green-400 text-sm">{message}</p>
        </div>
      )}

      {/* Email Icon and Instructions */}
      <div className="text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-accent-violet/10 rounded-full flex items-center justify-center">
          <Mail className="w-8 h-8 text-accent-violet" />
        </div>
        
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-2">
            Controlla la tua email
          </h3>
          <p className="text-base text-foreground-secondary">
            Abbiamo inviato un link di verifica a:
          </p>
          <p className="text-base font-medium text-foreground mt-1">
            {email}
          </p>
        </div>

        <div className="text-base text-foreground-secondary">
          <p>
            Clicca sul link nell'email per verificare il tuo account.
          </p>
          <p className="mt-2">
            Non hai ricevuto l'email? Controlla la cartella spam o richiedi un nuovo invio.
          </p>
        </div>
      </div>

      {/* Resend Email Button */}
      <button
        type="button"
        onClick={handleResendEmail}
        disabled={isLoading}
        className="w-full bg-accent-violet text-white py-2 px-4 rounded-lg hover:bg-accent-violet/90 focus:outline-none focus:ring-2 focus:ring-accent-violet focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Invio in corso...' : 'Invia di nuovo l\'email'}
      </button>

      {/* Mode Switch Links */}
      <div className="text-center space-y-3">
        <p className="text-sm text-foreground-secondary">
          Email sbagliata?{' '}
          <button
            type="button"
            onClick={() => onModeChange('signup')}
            className="text-accent-violet hover:text-accent-violet/80 font-medium"
          >
            Cambia email
          </button>
        </p>
        <p className="text-sm text-foreground-secondary">
          <button
            type="button"
            onClick={() => onModeChange('login')}
            className="text-accent-violet hover:text-accent-violet/80 font-medium"
          >
            Torna al login
          </button>
        </p>
      </div>
    </div>
  );
}