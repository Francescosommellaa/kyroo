import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { AuthMode } from './auth-modal-types';

interface AuthFormWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  mode: AuthMode;
  children: React.ReactNode;
}

const getTitle = (mode: AuthMode): string => {
  switch (mode) {
    case 'login':
      return 'Accedi al tuo account';
    case 'signup':
      return 'Crea il tuo account';
    case 'reset':
      return 'Reimposta la password';
    case 'verify':
      return 'Verifica la tua email';
    default:
      return 'Autenticazione';
  }
};

export function AuthFormWrapper({ isOpen, onClose, mode, children }: AuthFormWrapperProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            {getTitle(mode)}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </motion.div>
    </div>
  );
}