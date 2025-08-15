/**
 * Plan Management Modal
 * Admin interface for managing user plans
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  Clock,
  AlertTriangle,
  Check,
  Star,
  Shield,
} from "lucide-react";
import type { PlanType } from "../../../shared/plans";
import { PLAN_CONFIGS } from "../../../shared/plans";

interface User {
  id: string;
  full_name: string | null;
  display_name: string | null;
  plan: PlanType;
  plan_expires_at: string | null;
  trial_start_date: string | null;
  trial_used: boolean;
}

interface PlanManagementModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUpdatePlan: (
    userId: string,
    newPlan: PlanType,
    expiresAt?: string,
  ) => Promise<void>;
  onStartTrial: (userId: string) => Promise<void>;
}

const planIcons = {
  free: Check,
  pro: Star,
  enterprise: Shield,
};

const planColors = {
  free: "from-gray-500 to-gray-600",
  pro: "from-accent-violet to-accent-cyan",
  enterprise: "from-yellow-500 to-orange-500",
};

export default function PlanManagementModal({
  user,
  isOpen,
  onClose,
  onUpdatePlan,
  onStartTrial,
}: PlanManagementModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(user.plan);
  const [expiryDate, setExpiryDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentPlan = PLAN_CONFIGS[user.plan];
  const isTrialActive =
    user.trial_start_date && user.plan === "pro" && user.plan_expires_at;
  const canStartTrial = !user.trial_used && user.plan === "free";

  const handlePlanUpdate = async () => {
    if (selectedPlan === user.plan && !expiryDate) {
      onClose();
      return;
    }

    try {
      setLoading(true);
      setError("");

      const expiresAt = expiryDate
        ? new Date(expiryDate).toISOString()
        : undefined;
      await onUpdatePlan(user.id, selectedPlan, expiresAt);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Errore nell'aggiornamento del piano",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTrialStart = async () => {
    try {
      setLoading(true);
      setError("");
      await onStartTrial(user.id);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Errore nell'avvio del trial",
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("it-IT", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isExpired =
    user.plan_expires_at && new Date(user.plan_expires_at) < new Date();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-card border border-border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-violet to-accent-cyan rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {user.display_name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Gestisci Piano
                  </h2>
                  <p className="text-foreground-secondary">
                    {user.display_name || "Utente senza nome"}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-foreground-secondary hover:text-foreground hover:bg-surface rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Current Plan Status */}
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Piano Attuale
              </h3>

              <div className="flex items-center space-x-4 p-4 bg-surface rounded-xl">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${planColors[user.plan]} rounded-full flex items-center justify-center`}
                >
                  {(() => {
                    const Icon = planIcons[user.plan];
                    return <Icon className="text-white" size={20} />;
                  })()}
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-foreground">
                      {currentPlan.displayName}
                    </span>

                    {isTrialActive && (
                      <span className="px-2 py-1 bg-blue-500/10 text-blue-500 text-xs font-medium rounded-full">
                        Trial
                      </span>
                    )}

                    {isExpired && (
                      <span className="px-2 py-1 bg-red-500/10 text-red-500 text-xs font-medium rounded-full">
                        Scaduto
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-foreground-secondary">
                    {currentPlan.tagline}
                  </p>

                  {user.plan_expires_at && (
                    <div className="flex items-center space-x-1 mt-2 text-sm text-foreground-secondary">
                      <Calendar size={14} />
                      <span>Scade il {formatDate(user.plan_expires_at)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Trial Info */}
              {canStartTrial && (
                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <Clock className="text-blue-500 mt-0.5" size={16} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-400">
                        Trial Pro Disponibile
                      </p>
                      <p className="text-sm text-blue-300 mt-1">
                        Questo utente può iniziare un trial Pro gratuito di 7
                        giorni.
                      </p>
                      <button
                        onClick={handleTrialStart}
                        disabled={loading}
                        className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                      >
                        {loading ? "Avvio..." : "Avvia Trial Pro"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Plan Selection */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Cambia Piano
              </h3>

              <div className="space-y-3 mb-6">
                {Object.entries(PLAN_CONFIGS).map(([planType, config]) => {
                  const Icon = planIcons[planType as PlanType];
                  const isSelected = selectedPlan === planType;

                  return (
                    <div
                      key={planType}
                      className={`
                        p-4 border rounded-xl cursor-pointer transition-all
                        ${
                          isSelected
                            ? "border-accent-violet bg-accent-violet/5"
                            : "border-border hover:border-accent-violet/50"
                        }
                      `}
                      onClick={() => setSelectedPlan(planType as PlanType)}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 bg-gradient-to-br ${planColors[planType as PlanType]} rounded-full flex items-center justify-center`}
                        >
                          <Icon className="text-white" size={16} />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-foreground">
                              {config.displayName}
                            </span>
                            {planType === "enterprise" && (
                              <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-medium rounded-full">
                                Custom
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-foreground-secondary">
                            {config.tagline}
                          </p>
                        </div>

                        <div className="text-right">
                          {planType === "enterprise" ? (
                            <span className="text-sm font-medium text-foreground">
                              Personalizzato
                            </span>
                          ) : (
                            <span className="text-sm font-medium text-foreground">
                              €{config.price.monthly}/mese
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Expiry Date */}
              {selectedPlan !== "free" && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Data di Scadenza (opzionale)
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent"
                  />
                  <p className="text-xs text-foreground-secondary mt-1">
                    Lascia vuoto per un piano senza scadenza
                  </p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 flex items-center space-x-2">
                  <AlertTriangle size={16} />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 text-foreground-secondary hover:text-foreground transition-colors disabled:opacity-50"
                >
                  Annulla
                </button>

                <button
                  onClick={handlePlanUpdate}
                  disabled={
                    loading || (selectedPlan === user.plan && !expiryDate)
                  }
                  className="px-6 py-2 bg-gradient-to-r from-accent-violet to-accent-cyan text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Aggiornamento..." : "Aggiorna Piano"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
