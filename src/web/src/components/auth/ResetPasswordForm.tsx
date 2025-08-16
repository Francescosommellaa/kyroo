import React, { useState } from 'react';
import { AuthFormData, AuthFormProps } from './auth-modal-types';

export function ResetPasswordForm({ onSubmit, isLoading, error, message, onModeChange }: AuthFormProps) {
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email?.trim()) {
      errors.email = 'L\'email è obbligatoria';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Inserisci un\'email valida';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await onSubmit(formData);
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

      {/* Instructions */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Inserisci la tua email e ti invieremo un link per reimpostare la password.
        </p>
      </div>

      {/* Reset Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              validationErrors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Inserisci la tua email"
            required
          />
          {validationErrors.email && (
            <p className="text-sm text-red-600 mt-1">{validationErrors.email}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Invio in corso...' : 'Invia link di reset'}
        </button>
      </form>

      {/* Mode Switch Links */}
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">
          Ricordi la password?{' '}
          <button
            type="button"
            onClick={() => onModeChange('login')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Accedi
          </button>
        </p>
        <p className="text-sm text-gray-600">
          Non hai un account?{' '}
          <button
            type="button"
            onClick={() => onModeChange('signup')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Registrati
          </button>
        </p>
      </div>
    </div>
  );
}