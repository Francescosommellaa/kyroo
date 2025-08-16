import { X, ArrowRight, Zap, Crown, Users } from "lucide-react";
import type { PlanType } from '../../../shared/plans';

export interface UpgradeBannerProps {
  message: string;
  currentPlan: PlanType;
  onClose?: () => void;
  onUpgrade?: () => void;
  variant?: "warning" | "error" | "info";
  showIcon?: boolean;
  className?: string;
}

const variantStyles = {
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  error: "bg-red-50 border-red-200 text-red-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};

const variantButtonStyles = {
  warning: "bg-amber-600 hover:bg-amber-700 text-white",
  error: "bg-red-600 hover:bg-red-700 text-white",
  info: "bg-blue-600 hover:bg-blue-700 text-white",
};

const variantIcons = {
  warning: Zap,
  error: Crown,
  info: Users,
};

export function UpgradeBanner({
  message,
  currentPlan,
  onClose,
  onUpgrade,
  variant = "warning",
  showIcon = true,
  className = "",
}: UpgradeBannerProps) {
  const Icon = variantIcons[variant];
  const ctaText = currentPlan === 'free' ? 'Aggiorna a Pro' : 'Aggiorna Piano';

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      // Default redirect to app billing page
      window.location.href = "/app/billing";
    }
  };

  return (
    <div
      className={`
      relative rounded-lg border p-4 shadow-sm
      ${variantStyles[variant]}
      ${className}
    `}
    >
      <div className="flex items-start gap-3">
        {showIcon && (
          <div className="flex-shrink-0">
            <Icon className="h-5 w-5" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-5">{message}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleUpgrade}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium
              transition-colors duration-200
              ${variantButtonStyles[variant]}
            `}
          >
            {ctaText}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-black/5 transition-colors"
              aria-label="Chiudi banner"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente wrapper per banner fisso in cima alla pagina
export function FixedUpgradeBanner(props: UpgradeBannerProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4">
      <div className="max-w-7xl mx-auto">
        <UpgradeBanner {...props} />
      </div>
    </div>
  );
}

// Componente per banner inline nelle pagine
export function InlineUpgradeBanner(props: UpgradeBannerProps) {
  return (
    <div className="mb-6">
      <UpgradeBanner {...props} />
    </div>
  );
}

// Componente per banner compatto in modali o sidebar
export function CompactUpgradeBanner(
  props: Omit<UpgradeBannerProps, "showIcon">,
) {
  return <UpgradeBanner {...props} showIcon={false} className="p-3 text-xs" />;
}
