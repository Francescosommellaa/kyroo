import React from 'react';

// Tipi di errori di rete
export enum NetworkErrorType {
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  OFFLINE_ERROR = 'OFFLINE_ERROR',
  DNS_ERROR = 'DNS_ERROR',
  SSL_ERROR = 'SSL_ERROR'
}

// Interfaccia per gli errori di rete
export interface NetworkError {
  type: NetworkErrorType;
  message: string;
  suggestion: string;
  context?: string;
  statusCode?: number;
  retryAfter?: number;
  timestamp?: string;
  originalError?: any;
}

// Messaggi di errore di rete in italiano
const NETWORK_ERROR_MESSAGES: Record<NetworkErrorType, { message: string; suggestion: string }> = {
  [NetworkErrorType.CONNECTION_ERROR]: {
    message: '🌐 Impossibile connettersi al server',
    suggestion: 'Verifica la tua connessione internet e riprova'
  },
  [NetworkErrorType.TIMEOUT_ERROR]: {
    message: '⏱️ La richiesta ha impiegato troppo tempo',
    suggestion: 'Il server sta impiegando più tempo del solito. Riprova tra qualche momento'
  },
  [NetworkErrorType.SERVER_ERROR]: {
    message: '🔧 Il server ha riscontrato un problema',
    suggestion: 'Si è verificato un errore interno. Il nostro team è stato notificato'
  },
  [NetworkErrorType.RATE_LIMIT_ERROR]: {
    message: '🚦 Troppe richieste inviate',
    suggestion: 'Hai effettuato troppe richieste. Attendi qualche minuto prima di riprovare'
  },
  [NetworkErrorType.OFFLINE_ERROR]: {
    message: '📡 Nessuna connessione internet',
    suggestion: 'Controlla la tua connessione internet e riprova quando sei online'
  },
  [NetworkErrorType.DNS_ERROR]: {
    message: '🔍 Impossibile trovare il server',
    suggestion: 'Problema di risoluzione DNS. Verifica la tua connessione o riprova più tardi'
  },
  [NetworkErrorType.SSL_ERROR]: {
    message: '🔒 Errore di sicurezza della connessione',
    suggestion: 'Problema con il certificato di sicurezza. Riprova o contatta il supporto'
  }
};

// Funzione per identificare il tipo di errore di rete
export function identifyNetworkError(error: any): NetworkErrorType {
  // Controllo se siamo offline
  if (!navigator.onLine) {
    return NetworkErrorType.OFFLINE_ERROR;
  }

  // Controllo del codice di stato HTTP
  if (error.status || error.statusCode) {
    const status = error.status || error.statusCode;
    
    if (status === 429) {
      return NetworkErrorType.RATE_LIMIT_ERROR;
    }
    
    if (status >= 500) {
      return NetworkErrorType.SERVER_ERROR;
    }
  }

  // Controllo del messaggio di errore
  const errorMessage = error.message?.toLowerCase() || '';
  
  if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    return NetworkErrorType.TIMEOUT_ERROR;
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return NetworkErrorType.CONNECTION_ERROR;
  }
  
  if (errorMessage.includes('dns') || errorMessage.includes('resolve')) {
    return NetworkErrorType.DNS_ERROR;
  }
  
  if (errorMessage.includes('ssl') || errorMessage.includes('certificate')) {
    return NetworkErrorType.SSL_ERROR;
  }

  // Controllo del nome dell'errore
  if (error.name === 'AbortError' || error.name === 'TimeoutError') {
    return NetworkErrorType.TIMEOUT_ERROR;
  }
  
  if (error.name === 'TypeError' && errorMessage.includes('failed to fetch')) {
    return NetworkErrorType.CONNECTION_ERROR;
  }

  // Default: errore di connessione
  return NetworkErrorType.CONNECTION_ERROR;
}

// Funzione per creare un errore di rete strutturato
export function createNetworkError(
  error: any,
  context: string = 'Operazione di rete'
): NetworkError {
  const errorType = identifyNetworkError(error);
  const errorInfo = NETWORK_ERROR_MESSAGES[errorType];
  
  // Estrai informazioni aggiuntive
  const statusCode = error.status || error.statusCode;
  const retryAfter = error.headers?.['retry-after'] ? 
    parseInt(error.headers['retry-after']) * 1000 : undefined;

  return {
    type: errorType,
    message: errorInfo.message,
    suggestion: errorInfo.suggestion,
    context,
    statusCode,
    retryAfter,
    timestamp: new Date().toISOString(),
    originalError: error
  };
}

// Funzione per gestire errori di rete con retry automatico
export async function handleNetworkOperation<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    context?: string;
    onRetry?: (attempt: number, error: NetworkError) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    context = 'Operazione di rete',
    onRetry
  } = options;

  let lastError: NetworkError;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = createNetworkError(error, context);
      
      // Non ritentare per alcuni tipi di errore
      if (
        lastError.type === NetworkErrorType.RATE_LIMIT_ERROR ||
        lastError.type === NetworkErrorType.SSL_ERROR ||
        (lastError.statusCode && lastError.statusCode >= 400 && lastError.statusCode < 500)
      ) {
        throw lastError;
      }

      // Se è l'ultimo tentativo, lancia l'errore
      if (attempt > maxRetries) {
        throw lastError;
      }

      // Calcola il delay per il prossimo tentativo
      const delay = lastError.retryAfter || (retryDelay * Math.pow(2, attempt - 1));
      
      // Notifica del retry
      if (onRetry) {
        onRetry(attempt, lastError);
      }

      // Attendi prima del prossimo tentativo
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// Hook per monitorare lo stato della connessione
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [wasOffline, setWasOffline] = React.useState(false);

  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // Mostra messaggio di riconnessione
        console.log('🌐 Connessione ripristinata');
        setWasOffline(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
}

// Funzione per formattare messaggi di errore di rete user-friendly
export function formatNetworkErrorMessage(error: NetworkError): string {
  let message = error.message;
  
  if (error.suggestion) {
    message += `\n💡 ${error.suggestion}`;
  }
  
  if (error.retryAfter) {
    const seconds = Math.ceil(error.retryAfter / 1000);
    message += `\n⏰ Riprova tra ${seconds} secondi`;
  }
  
  return message;
}

// Il componente NetworkStatusIndicator è ora disponibile in src/components/NetworkStatusIndicator.tsx