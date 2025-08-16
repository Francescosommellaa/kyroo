/**
 * Plan Card Component
 * Displays plan information with features and pricing
 */

import { motion } from "framer-motion";
import { Check, Star, Shield } from "lucide-react";
import type { PlanConfig, PlanType } from '@kyroo/shared/plans';
import { formatLimit } from '@kyroo/shared/plans';

interface PlanCardProps {
  plan: PlanConfig;
  planType: PlanType;
  isCurrentPlan?: boolean;
  isTrialPro?: boolean;
  onSelectPlan?: (planType: PlanType) => void;
  className?: string;
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

export default function PlanCard({
  plan,
  planType,
  isCurrentPlan = false,
  isTrialPro = false,
  onSelectPlan,
  className = "",
}: PlanCardProps) {
  const Icon = planIcons[planType];
  const gradientColor = planColors[planType];

  const isEnterprise = planType === "enterprise";
  const isPro = planType === "pro";
  const isFree = planType === "free";

  const handleSelectPlan = () => {
    if (onSelectPlan && !isCurrentPlan) {
      onSelectPlan(planType);
    }
  };

  return (
    <motion.div
      className={`
        relative bg-card border border-border rounded-xl p-6
        ${isPro ? "ring-2 ring-accent-violet ring-opacity-50" : ""}
        ${isCurrentPlan ? "ring-2 ring-green-500 ring-opacity-50" : ""}
        ${className}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4 }}
    >
      {/* Popular badge for Pro */}
      {isPro && !isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-accent-violet to-accent-cyan text-white px-4 py-1 rounded-full text-sm font-medium">
            Più popolare
          </div>
        </div>
      )}

      {/* Current plan badge */}
      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            {isTrialPro ? "Trial attivo" : "Piano attuale"}
          </div>
        </div>
      )}

      {/* Plan header */}
      <div className="text-center mb-6">
        <div
          className={`w-16 h-16 bg-gradient-to-br ${gradientColor} rounded-full flex items-center justify-center mx-auto mb-4`}
        >
          <Icon className="text-white" size={24} />
        </div>

        <h3 className="text-2xl font-bold text-foreground mb-2">
          {plan.displayName}
        </h3>

        <p className="text-foreground-secondary text-sm mb-4">{plan.tagline}</p>

        {/* Pricing */}
        <div className="mb-6">
          {isEnterprise ? (
            <div className="text-foreground">
              <div className="text-2xl font-bold">Prezzo personalizzato</div>
              <div className="text-sm text-foreground-secondary">
                Contattaci per un preventivo
              </div>
            </div>
          ) : (
            <div className="text-foreground">
              <div className="text-3xl font-bold">
                €{plan.price.monthly}
                {!isFree && <span className="text-lg font-normal">/mese</span>}
              </div>
              {!isFree && (
                <div className="text-sm text-foreground-secondary">
                  o €{plan.price.yearly}/anno (risparmia €
                  {plan.price.monthly * 12 - plan.price.yearly})
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Features list */}
      <div className="space-y-3 mb-8">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-start space-x-3">
            <Check className="text-green-500 mt-0.5 flex-shrink-0" size={16} />
            <span className="text-foreground-secondary text-sm">{feature}</span>
          </div>
        ))}
      </div>

      {/* Key limits display */}
      <div className="bg-background rounded-lg p-4 mb-6 space-y-2">
        <div className="text-xs font-medium text-foreground-secondary uppercase tracking-wide mb-2">
          Limiti principali
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-foreground-secondary">Workspace:</span>
            <span className="text-foreground font-medium ml-1">
              {formatLimit(plan.limits.maxWorkspaces, planType)}
            </span>
          </div>

          <div>
            <span className="text-foreground-secondary">Utenti:</span>
            <span className="text-foreground font-medium ml-1">
              {formatLimit(plan.limits.maxOwnersPerWorkspace + plan.limits.maxUserCollaboratorsPerWorkspace, planType)}
            </span>
          </div>

          <div>
            <span className="text-foreground-secondary">Ricerche/giorno:</span>
            <span className="text-foreground font-medium ml-1">
              {formatLimit(plan.limits.maxWebSearchesPerDay, planType)}
            </span>
          </div>

          <div>
            <span className="text-foreground-secondary">File/mese:</span>
            <span className="text-foreground font-medium ml-1">
              {formatLimit(plan.limits.maxFilesPerMonth, planType)}
            </span>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={handleSelectPlan}
        disabled={isCurrentPlan}
        className={`
          w-full py-3 px-4 rounded-lg font-medium transition-all duration-200
          ${
            isCurrentPlan
              ? "bg-green-100 text-green-700 cursor-not-allowed"
              : isPro
                ? "bg-gradient-to-r from-accent-violet to-accent-cyan text-white hover:shadow-lg hover:scale-105"
                : isEnterprise
                  ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-lg hover:scale-105"
                  : "bg-foreground text-background hover:bg-foreground-secondary"
          }
        `}
      >
        {isCurrentPlan
          ? isTrialPro
            ? "Trial in corso"
            : "Piano attuale"
          : plan.cta}
      </button>

      {/* Trial info for Pro */}
      {isPro && !isCurrentPlan && (
        <div className="text-center mt-3">
          <p className="text-xs text-foreground-secondary">
            Prova gratuita di 7 giorni • Nessuna carta richiesta
          </p>
        </div>
      )}
    </motion.div>
  );
}
