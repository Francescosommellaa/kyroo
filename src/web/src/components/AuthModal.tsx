import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import {
  AuthFormWrapper,
  LoginForm,
  SignupForm,
  ResetPasswordForm,
  VerifyEmailForm,
  AuthMode,
  AuthModalProps,
  AuthFormData,
} from './auth/index';

export function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();

  const {
    signIn,
    signUp,
    resetPassword,
    signInWithGoogle,
    resendVerificationEmail,
  } = useAuth();
  // Reset form when mode changes
  useEffect(() => {
    setError(null);
    setMessage(null);
  }, [mode]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setMode(defaultMode);
      setError(null);
      setMessage(null);
      setUserEmail('');
    }
  }, [isOpen, defaultMode]);

  // Aggiorna la modalità quando defaultMode cambia, anche se il modal è aperto
  useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode]);

  const handleLoginSubmit = async (data: AuthFormData) => {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    const result = await signIn(data.email, data.password);
    
    if (result.success) {
      onClose();
      navigate('/app/chat');
    } else {
      console.error('Login error:', result.error);
      setError(result.error || 'Si è verificato un errore durante l\'accesso.');
    }
    
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    
    const result = await signInWithGoogle();
    
    if (result.success) {
      onClose();
      navigate('/app/chat');
    } else {
      console.error('Google sign in error:', result.error);
      setError(result.error || 'Errore durante l\'accesso con Google');
    }
    
    setIsLoading(false);
  };

  const handleSignupSubmit = async (data: AuthFormData) => {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    const result = await signUp(
      data.email,
      data.password,
      data.fullName || '',
      data.displayName || ''
    );
    
    if (result.success) {
      setUserEmail(data.email);
      setMode('verify');
      setMessage('Account creato! Controlla la tua email per verificare l\'account.');
    } else {
      console.error('Signup error:', result.error);
      setError(result.error || 'Si è verificato un errore durante la registrazione.');
    }
    
    setIsLoading(false);
  };

  const handleResetSubmit = async (data: AuthFormData) => {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    const result = await resetPassword(data.email);
    
    if (result.success) {
      setMessage('Email di reset inviata! Controlla la tua casella di posta.');
    } else {
      console.error('Reset password error:', result.error);
      setError(result.error || 'Si è verificato un errore durante il reset della password.');
    }
    
    setIsLoading(false);
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await resendVerificationEmail();
      if (result.success) {
        setMessage('Email di verifica inviata nuovamente!');
      } else {
        setError(result.error || 'Errore durante il reinvio dell\'email');
      }
    } catch (error: any) {
      console.error('Resend verification error:', error);
      setError(error.message || 'Errore durante il reinvio dell\'email');
    } finally {
      setIsLoading(false);
    }
  };

  const renderForm = () => {
    const commonProps = {
      isLoading,
      error,
      message,
      onModeChange: setMode,
      onGoogleSignIn: handleGoogleSignIn,
    };

    switch (mode) {
      case 'login':
        return (
          <LoginForm
            {...commonProps}
            onSubmit={handleLoginSubmit}
          />
        );
      case 'signup':
      case 'register':
        return (
          <SignupForm
            {...commonProps}
            onSubmit={handleSignupSubmit}
          />
        );
      case 'reset':
        return (
          <ResetPasswordForm
            {...commonProps}
            onSubmit={handleResetSubmit}
          />
        );
      case 'verify':
        return (
          <VerifyEmailForm
            {...commonProps}
            email={userEmail}
            onResendVerification={handleResendVerification}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AuthFormWrapper
      isOpen={isOpen}
      mode={mode}
      onClose={onClose}
    >
      {renderForm()}
    </AuthFormWrapper>
  );
}
