import { motion } from 'framer-motion';
import { Crown, CreditCard, Calendar, User, Hash } from 'lucide-react';
import { ProfileSettingsProps } from './profile-types';

/**
 * Profile Settings Component
 * Displays user plan information and account details
 */
export default function ProfileSettings({
  userPlan,
  planInfo,
  profile,
  userId
}: ProfileSettingsProps) {
  const currentPlan = planInfo[userPlan] || {
    name: 'Free',
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    icon: Crown
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Piano Attuale
          </h2>
          <p className="text-foreground-secondary text-sm">
            Gestisci il tuo piano di abbonamento
          </p>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface/50">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${currentPlan.bgColor}`}>
              <currentPlan.icon className={`${currentPlan.color}`} size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                Piano {currentPlan.name}
              </h3>
              <p className="text-sm text-foreground-secondary">
                {userPlan === 'free' 
                  ? 'Piano gratuito con funzionalità di base'
                  : userPlan === 'pro'
                  ? 'Piano professionale con funzionalità avanzate'
                  : 'Piano enterprise con tutte le funzionalità'
                }
              </p>
            </div>
          </div>
          {userPlan !== 'enterprise' && (
            <motion.button
              className="px-4 py-2 bg-accent-violet hover:bg-accent-violet/90 text-white font-medium rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Aggiorna
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Azioni Rapide
          </h2>
          <p className="text-foreground-secondary text-sm">
            Accesso rapido alle funzioni principali
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.button
            className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-accent-violet/50 hover:bg-accent-violet/5 transition-all group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="p-2 rounded-lg bg-accent-violet/10 group-hover:bg-accent-violet/20 transition-colors">
              <CreditCard className="text-accent-violet" size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-foreground">Fatturazione</h3>
              <p className="text-sm text-foreground-secondary">Gestisci pagamenti</p>
            </div>
          </motion.button>

          <motion.button
            className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-accent-cyan/50 hover:bg-accent-cyan/5 transition-all group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="p-2 rounded-lg bg-accent-cyan/10 group-hover:bg-accent-cyan/20 transition-colors">
              <Crown className="text-accent-cyan" size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-foreground">Upgrade</h3>
              <p className="text-sm text-foreground-secondary">Migliora il piano</p>
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* Account Information */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Informazioni Account
          </h2>
          <p className="text-foreground-secondary text-sm">
            Dettagli del tuo account
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
            <div className="flex items-center gap-3">
              <Calendar className="text-foreground-secondary" size={18} />
              <span className="text-foreground">Data Creazione</span>
            </div>
            <span className="text-foreground-secondary">
              {formatDate(profile?.created_at)}
            </span>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
            <div className="flex items-center gap-3">
              <User className="text-foreground-secondary" size={18} />
              <span className="text-foreground">Ruolo</span>
            </div>
            <span className="text-foreground-secondary capitalize">
              {profile?.role || 'User'}
            </span>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Hash className="text-foreground-secondary" size={18} />
              <span className="text-foreground">ID Utente</span>
            </div>
            <span className="text-foreground-secondary font-mono text-sm">
              {userId ? `${userId.slice(0, 8)}...` : 'N/A'}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}