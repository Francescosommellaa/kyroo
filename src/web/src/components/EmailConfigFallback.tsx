import { useState, useEffect } from 'react';
import { AlertTriangle, Mail, X, CheckCircle, Info } from 'lucide-react';

interface EmailConfigFallbackProps {
  error?: string;
  errorCode?: string;
  email?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

interface FallbackMessage {
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  actions?: Array<{
    label: string;
    action: () => void;
    variant: 'primary' | 'secondary';
  }>;
}

export function EmailConfigFallback({
  error,
  errorCode,
  email,
  onRetry,
  onDismiss,
  className = ''
}: EmailConfigFallbackProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [fallbackMessage, setFallbackMessage] = useState<FallbackMessage | null>(null);

  useEffect(() => {
    if (!error && !errorCode) {
      setFallbackMessage(null);
      return;
    }

    // Determina il messaggio di fallback basato sul codice di errore
    let message: FallbackMessage;

    switch (errorCode) {
      case 'EMAIL_RATE_LIMIT':
        message = {
          title: 'Limite email raggiunto',
          message: 'Hai richiesto troppe email di verifica. Attendi 5-10 minuti prima di riprovare. Nel frattempo, controlla la cartella spam.',
          type: 'warning',
          actions: [
            {
              label: 'Controlla Spam',
              action: () => {
                window.open('https://mail.google.com/mail/u/0/#spam', '_blank');
              },
              variant: 'secondary'
            }
          ]
        };
        break;

      case 'EMAIL_NOT_CONFIRMED':
        message = {
          title: 'Email non verificata',
          message: `Controlla la tua casella di posta (${email || 'la tua email'}) e clicca sul link di verifica. Se non trovi l'email, controlla la cartella spam.`,
          type: 'warning',
          actions: [
            {
              label: 'Reinvia Email',
              action: onRetry || (() => {}),
              variant: 'primary'
            },
            {
              label: 'Controlla Spam',
              action: () => {
                window.open('https://mail.google.com/mail/u/0/#spam', '_blank');
              },
              variant: 'secondary'
            }
          ]
        };
        break;

      case 'API_KEY_ERROR':
      case 'SUPABASE_NOT_CONFIGURED':
        message = {
          title: 'Problema di configurazione',
          message: 'Il servizio email non è configurato correttamente. Contatta il supporto tecnico per risolvere il problema.',
          type: 'error',
          actions: [
            {
              label: 'Contatta Supporto',
              action: () => {
                window.open('mailto:support@kyroo.com?subject=Problema configurazione email', '_blank');
              },
              variant: 'primary'
            }
          ]
        };
        break;

      case 'DATABASE_SAVE_ERROR':
        message = {
          title: 'Errore nel salvataggio',
          message: 'Si è verificato un problema nel salvataggio dei tuoi dati. Il nostro team è stato notificato. Riprova tra qualche minuto.',
          type: 'error',
          actions: [
            {
              label: 'Riprova',
              action: onRetry || (() => {}),
              variant: 'primary'
            }
          ]
        };
        break;

      case 'CONNECTION_ERROR':
        message = {
          title: 'Problema di connessione',
          message: 'Verifica la tua connessione internet e riprova. Se il problema persiste, potrebbe essere un problema temporaneo del servizio.',
          type: 'warning',
          actions: [
            {
              label: 'Riprova',
              action: onRetry || (() => {}),
              variant: 'primary'
            }
          ]
        };
        break;

      default:
        message = {
          title: 'Problema con l\'email',
          message: error || 'Si è verificato un problema con l\'invio dell\'email di verifica. Prova questi passaggi per risolvere.',
          type: 'warning',
          actions: [
            {
              label: 'Riprova',
              action: onRetry || (() => {}),
              variant: 'primary'
            }
          ]
        };
    }

    setFallbackMessage(message);
  }, [error, errorCode, email, onRetry]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible || !fallbackMessage) {
    return null;
  }

  const getIcon = () => {
    switch (fallbackMessage.type) {
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <Mail className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getBgColor = () => {
    switch (fallbackMessage.type) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-green-50 border-green-200';
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getBgColor()} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-gray-900">
            {fallbackMessage.title}
          </h3>
          <div className="mt-2 text-sm text-gray-700">
            <p>{fallbackMessage.message}</p>
          </div>
          {fallbackMessage.actions && fallbackMessage.actions.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {fallbackMessage.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    action.variant === 'primary'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={handleDismiss}
              className="inline-flex rounded-md p-1.5 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="sr-only">Chiudi</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook per gestire i fallback email in modo semplice
export function useEmailFallback() {
  const [fallbackState, setFallbackState] = useState<{
    show: boolean;
    error?: string;
    errorCode?: string;
    email?: string;
  }>({ show: false });

  const showFallback = (error: string, errorCode?: string, email?: string) => {
    setFallbackState({
      show: true,
      error,
      errorCode,
      email
    });
  };

  const hideFallback = () => {
    setFallbackState({ show: false });
  };

  return {
    fallbackState,
    showFallback,
    hideFallback
  };
}

// Componente per suggerimenti generali sulla configurazione email
export function EmailConfigTips() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <Info className="h-5 w-5 text-blue-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">
            Problemi con l'email di verifica?
          </h3>
          <div className="mt-2 text-sm text-blue-700">
            <ul className="list-disc list-inside space-y-1">
              <li>Controlla la cartella spam/posta indesiderata</li>
              <li>Assicurati che l'email sia scritta correttamente</li>
              <li>Attendi qualche minuto, a volte le email arrivano in ritardo</li>
              <li>Se usi Gmail, controlla anche la scheda "Promozioni"</li>
              <li>Aggiungi noreply@kyroo.com ai tuoi contatti</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}