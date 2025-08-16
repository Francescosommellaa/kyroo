import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { AuthFormData, AuthFormProps } from './auth-modal-types';
import { useAuth } from '../../contexts/auth';
import ErrorMessage, { SuccessMessage, InlineError } from '../ErrorMessage';
import { validateSignupForm, ValidationResult } from '../../utils/validation-utils';

export function SignupForm({ onSubmit, isLoading, error, message, onModeChange }: AuthFormProps) {
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    displayName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, ValidationResult>>({});
  const { signInWithGoogle } = useAuth();

  const validateForm = (): boolean => {
    const validation = validateSignupForm({
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      fullName: formData.fullName,
      displayName: formData.displayName
    });

    setValidationErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await onSubmit(formData);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign in error:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error/Success Messages */}
      {error && (
        <ErrorMessage 
          message={error} 
          type="error" 
          icon="auth"
          animate={true}
        />
      )}
      
      {message && (
        <SuccessMessage 
          message={message}
        />
      )}

      {/* Signup Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name Field */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-1">
            Nome Completo
          </label>
          <input
            id="fullName"
            type="text"
            value={formData.fullName || ''}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent ${
              validationErrors.fullName ? 'border-red-500' : 'border-border'
            }`}
            placeholder="Inserisci il tuo nome completo"
            required
          />
          <InlineError message={validationErrors.fullName?.message} />
        </div>

        {/* Display Name Field */}
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-foreground mb-1">
            Nome Visualizzato
          </label>
          <input
            id="displayName"
            type="text"
            value={formData.displayName || ''}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent ${
              validationErrors.displayName ? 'border-red-500' : 'border-border'
            }`}
            placeholder="Come vuoi essere chiamato"
            required
          />
          <InlineError message={validationErrors.displayName?.message} />
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent ${
              validationErrors.email ? 'border-red-500' : 'border-border'
            }`}
            placeholder="Inserisci la tua email"
            required
          />
          <InlineError message={validationErrors.email?.message} />
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`w-full px-3 py-2 pr-10 border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent ${
                validationErrors.password ? 'border-red-500' : 'border-border'
              }`}
              placeholder="Crea una password sicura"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground/60 hover:text-foreground"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <InlineError message={validationErrors.password?.message} />
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">
            Conferma Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword || ''}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className={`w-full px-3 py-2 pr-10 border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent ${
                validationErrors.confirmPassword ? 'border-red-500' : 'border-border'
              }`}
              placeholder="Ripeti la password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground/60 hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <InlineError message={validationErrors.confirmPassword?.message} />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-accent-violet text-white py-2 px-4 rounded-lg hover:bg-accent-violet/90 focus:outline-none focus:ring-2 focus:ring-accent-violet focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Registrazione in corso...' : 'Registrati'}
        </button>
      </form>

      {/* Google Sign In */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-background text-foreground/60">oppure</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full flex items-center justify-center px-4 py-2 border border-border rounded-lg shadow-sm bg-surface text-sm font-medium text-foreground hover:bg-surface/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-violet disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continua con Google
      </button>

      {/* Terms and Privacy */}
      <p className="text-xs text-foreground/60 text-center">
        Registrandoti accetti i nostri{' '}
        <a href="/terms" className="text-accent-violet hover:text-accent-violet/80">
          Termini di Servizio
        </a>{' '}
        e la{' '}
        <a href="/privacy" className="text-accent-violet hover:text-accent-violet/80">
          Privacy Policy
        </a>
      </p>

      {/* Mode Switch Link */}
      <div className="text-center">
        <p className="text-sm text-foreground/70">
          Hai già un account?{' '}
          <button
            type="button"
            onClick={() => onModeChange('login')}
            className="text-accent-violet hover:text-accent-violet/80 font-medium"
          >
            Accedi
          </button>
        </p>
      </div>
    </div>
  );
}