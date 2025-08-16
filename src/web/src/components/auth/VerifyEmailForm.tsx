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
    <div className="space-y-6">
      {/* Error/Success Messages */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      {message && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">{message}</p>
        </div>
      )}

      {/* Email Icon and Instructions */}
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <Mail className="text-blue-600" size={32} />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Controlla la tua email
          </h3>
          <p className="text-sm text-gray-600">
            Abbiamo inviato un link di verifica a:
          </p>
          <p className="text-sm font-medium text-gray-900 mt-1">
            {email}
          </p>
        </div>

        <div className="text-sm text-gray-600">
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
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Invio in corso...' : 'Invia di nuovo l\'email'}
      </button>

      {/* Mode Switch Links */}
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">
          Email sbagliata?{' '}
          <button
            type="button"
            onClick={() => onModeChange('signup')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Cambia email
          </button>
        </p>
        <p className="text-sm text-gray-600">
          <button
            type="button"
            onClick={() => onModeChange('login')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Torna al login
          </button>
        </p>
      </div>
    </div>
  );
}