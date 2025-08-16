import { motion } from 'framer-motion';
import { User, Mail, Phone, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { ProfileFormProps } from './profile-types';

/**
 * Profile Form Component
 * Handles user profile information editing
 */
export default function ProfileForm({
  formData,
  loading,
  message,
  onInputChange,
  onSubmit,
  userEmail
}: ProfileFormProps) {
  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Informazioni Profilo
        </h2>
        <p className="text-foreground-secondary text-sm">
          Aggiorna le tue informazioni personali e di contatto
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
        onSubmit(formData);
      }} className="space-y-6">
        {/* Email (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Email
          </label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary"
              size={18}
            />
            <input
              type="email"
              value={userEmail}
              disabled
              className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-foreground-secondary cursor-not-allowed"
            />
          </div>
          <p className="text-xs text-foreground-secondary mt-1">
            L'email non può essere modificata
          </p>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Nome Completo
          </label>
          <div className="relative">
            <User
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary"
              size={18}
            />
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={onInputChange}
              placeholder="Il tuo nome completo"
              className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-foreground-secondary focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent"
            />
          </div>
        </div>

        {/* Display Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Nome Visualizzato
          </label>
          <div className="relative">
            <User
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary"
              size={18}
            />
            <input
              type="text"
              name="display_name"
              value={formData.display_name}
              onChange={onInputChange}
              placeholder="Come vuoi essere chiamato (opzionale)"
              className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-foreground-secondary focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent"
            />
          </div>
          <p className="text-xs text-foreground-secondary mt-1">
            Se vuoto, verrà usato il nome completo
          </p>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Numero di Telefono
          </label>
          <div className="relative">
            <Phone
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary"
              size={18}
            />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={onInputChange}
              placeholder="+39 123 456 7890"
              className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-foreground-secondary focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent"
            />
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-accent-violet hover:bg-accent-violet/90 disabled:bg-accent-violet/50 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-accent-violet focus:ring-offset-2 focus:ring-offset-background"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save size={20} />
          )}
          {loading ? 'Salvando...' : 'Salva Modifiche'}
        </motion.button>
      </form>
    </motion.div>
  );
}