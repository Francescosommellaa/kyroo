import React, { useState, useEffect } from 'react';
import { AlertCircle, Wifi, Clock, Lock, Mail, X } from 'lucide-react';

export interface ErrorMessageProps {
  message?: string;
  type?: 'error' | 'warning' | 'info';
  icon?: 'default' | 'connection' | 'timeout' | 'auth' | 'email' | 'none';
  className?: string;
  onDismiss?: () => void;
  showDismiss?: boolean;
  animate?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  type = 'error',
  icon = 'default',
  className = '',
  onDismiss,
  showDismiss = false,
  animate = true,
  autoHide = false,
  autoHideDelay = 5000
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (autoHide && autoHideDelay > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoHideDelay);
      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 200); // Durata dell'animazione di uscita
  };

  if (!message || !isVisible) return null;

  const getIcon = () => {
    switch (icon) {
      case 'connection':
        return <Wifi className="w-4 h-4" />;
      case 'timeout':
        return <Clock className="w-4 h-4" />;
      case 'auth':
        return <Lock className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'none':
        return null;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'warning':
        return 'text-amber-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-red-500';
    }
  };

  return (
    <div
      className={`
        relative flex items-start gap-3 p-4 rounded-lg border transition-all duration-300 ease-in-out
        ${getTypeStyles()}
        ${animate && !isExiting ? 'animate-in slide-in-from-top-2 fade-in duration-300' : ''}
        ${isExiting ? 'animate-out slide-out-to-top-2 fade-out duration-200' : ''}
        ${animate ? 'transform-gpu' : ''}
        shadow-sm hover:shadow-md transition-shadow
        ${className}
      `}
      role="alert"
      aria-live="polite"
      style={{
        animationFillMode: 'forwards'
      }}
    >
      {icon !== 'none' && (
        <div className={`flex-shrink-0 ${getIconColor()}`}>
          {getIcon()}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-relaxed">
          {message}
        </p>
      </div>

      {(showDismiss || autoHide) && (
        <button
          onClick={handleDismiss}
          className={`
            flex-shrink-0 p-1 rounded-md transition-all duration-200 ease-in-out
            hover:bg-black/10 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2
            ${type === 'error' ? 'focus:ring-red-500' : 
              type === 'warning' ? 'focus:ring-amber-500' : 'focus:ring-blue-500'}
            opacity-70 hover:opacity-100
          `}
          aria-label="Chiudi messaggio"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;

// Hook per gestire gli errori con auto-dismiss
export const useErrorMessage = (autoHideDelay: number = 5000) => {
  const [error, setError] = React.useState<string | null>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const showError = React.useCallback((message: string) => {
    setError(message);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (autoHideDelay > 0) {
      timeoutRef.current = setTimeout(() => {
        setError(null);
      }, autoHideDelay);
    }
  }, [autoHideDelay]);

  const hideError = React.useCallback(() => {
    setError(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { error, showError, hideError };
};

// Componente per errori di validazione inline
export const InlineError: React.FC<{ 
  message?: string; 
  className?: string;
  animate?: boolean;
}> = ({ 
  message, 
  className = '',
  animate = true
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [message]);

  if (!message) return null;

  return (
    <div 
      className={`
        flex items-center gap-2 mt-1 transition-all duration-200 ease-in-out
        ${animate && isVisible ? 'animate-in slide-in-from-left-1 fade-in duration-200' : ''}
        ${animate ? 'transform-gpu' : ''}
        ${className}
      `}
    >
      <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0 animate-pulse" />
      <span className="text-xs text-red-600 font-medium leading-tight">
        {message}
      </span>
    </div>
  );
};

// Componente per messaggi di successo
export const SuccessMessage: React.FC<{
  message?: string;
  className?: string;
  onDismiss?: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
  animate?: boolean;
}> = ({ 
  message, 
  className = '', 
  onDismiss,
  autoHide = true,
  autoHideDelay = 4000,
  animate = true
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (autoHide && autoHideDelay > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoHideDelay);
      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 200);
  };

  if (!message || !isVisible) return null;

  return (
    <div
      className={`
        relative flex items-start gap-3 p-4 rounded-lg border transition-all duration-300 ease-in-out
        bg-green-50 border-green-200 text-green-800
        ${animate && !isExiting ? 'animate-in slide-in-from-top-2 fade-in duration-300' : ''}
        ${isExiting ? 'animate-out slide-out-to-top-2 fade-out duration-200' : ''}
        ${animate ? 'transform-gpu' : ''}
        shadow-sm hover:shadow-md transition-shadow
        ${className}
      `}
      role="alert"
      aria-live="polite"
      style={{
        animationFillMode: 'forwards'
      }}
    >
      <div className="flex-shrink-0 text-green-500">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-relaxed">
          {message}
        </p>
      </div>

      {(onDismiss || autoHide) && (
        <button
          onClick={handleDismiss}
          className="
            flex-shrink-0 p-1 rounded-md transition-all duration-200 ease-in-out
            hover:bg-black/10 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
            opacity-70 hover:opacity-100
          "
          aria-label="Chiudi messaggio"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};