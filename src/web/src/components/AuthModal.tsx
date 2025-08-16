import { useState, useEffect } from 'react';
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

  const handleLoginSubmit = async (data: AuthFormData) => {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      await signIn(data.email, data.password);
      onClose();
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Si è verificato un errore durante l\'accesso.');
    } finally {
       setIsLoading(false);
     }
   };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await signInWithGoogle();
      onClose();
    } catch (error: any) {
      console.error('Google sign in error:', error);
      setError(error.message || 'Errore durante l\'accesso con Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (data: AuthFormData) => {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      await signUp(
        data.email,
        data.password,
        data.fullName || '',
        data.displayName || ''
      );
      setUserEmail(data.email);
      setMode('verify');
      setMessage('Account creato! Controlla la tua email per verificare l\'account.');
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'Si è verificato un errore durante la registrazione.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (data: AuthFormData) => {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      await resetPassword(data.email);
      setMessage('Email di reset inviata! Controlla la tua casella di posta.');
    } catch (error: any) {
      console.error('Reset password error:', error);
      setError(error.message || 'Si è verificato un errore durante il reset della password.');
    } finally {
      setIsLoading(false);
    }
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
