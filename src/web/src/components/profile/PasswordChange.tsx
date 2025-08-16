import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { PasswordChangeProps } from './profile-types';

/**
 * Password Change Component
 * Handles password update functionality
 */
export default function PasswordChange({
  passwordData,
  showPasswords,
  loading,
  message,
  onInputChange,
  onSubmit,
  onToggleVisibility
}: PasswordChangeProps) {
  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Sicurezza
        </h2>
        <p className="text-foreground-secondary text-sm">
          Aggiorna la tua password per mantenere il tuo account sicuro
        </p>
      </div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          {message.text}
        </motion.div>
      )}

      <form onSubmit={(e) => {
        e.preventDefault();
        onSubmit(passwordData);
      }} className="space-y-6">
        {/* Current Password */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Password Attuale
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary"
              size={18}
            />
            <input
              type={showPasswords.current ? 'text' : 'password'}
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={onInputChange}
              placeholder="Inserisci la password attuale"
              className="w-full pl-10 pr-12 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-foreground-secondary focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => onToggleVisibility('current')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary hover:text-foreground transition-colors"
            >
              {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Nuova Password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary"
              size={18}
            />
            <input
              type={showPasswords.new ? 'text' : 'password'}
              name="newPassword"
              value={passwordData.newPassword}
              onChange={onInputChange}
              placeholder="Inserisci la nuova password"
              className="w-full pl-10 pr-12 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-foreground-secondary focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => onToggleVisibility('new')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary hover:text-foreground transition-colors"
            >
              {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="text-xs text-foreground-secondary mt-1">
            Almeno 8 caratteri con lettere, numeri e simboli
          </p>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Conferma Nuova Password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary"
              size={18}
            />
            <input
              type={showPasswords.confirm ? 'text' : 'password'}
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={onInputChange}
              placeholder="Conferma la nuova password"
              className="w-full pl-10 pr-12 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-foreground-secondary focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => onToggleVisibility('confirm')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary hover:text-foreground transition-colors"
            >
              {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-accent-violet hover:bg-accent-violet/90 disabled:bg-accent-violet/50 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-accent-violet focus:ring-offset-2 focus:ring-offset-background"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save size={20} />
          )}
          {loading ? 'Aggiornando...' : 'Aggiorna Password'}
        </motion.button>
      </form>
    </motion.div>
  );
}