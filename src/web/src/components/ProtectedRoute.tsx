import { ReactNode } from "react";
import {
  useUsageLimits,
  type UseUsageLimitsProps,
} from "../hooks/useUsageLimits";
import { UpgradeBanner } from "./UpgradeBanner";
import type { UsageCheck } from "../../../shared/usage-tracking";

export interface ProtectedRouteProps extends UseUsageLimitsProps {
  children: ReactNode;

  // Controlli specifici da verificare
  requireFeatures?: {
    webAgent?: boolean;
    knowledgeBase?: boolean;
    inviteUsers?: boolean;
    multipleWorkspaces?: boolean;
    workflows?: boolean;
  };

  // Controlli personalizzati
  customChecks?: UsageCheck[];

  // Comportamento quando bloccato
  fallback?: ReactNode;
  showBanner?: boolean;
  bannerVariant?: "warning" | "error" | "info";

  // Callback
  onBlocked?: (reason: string) => void;
  onUpgrade?: () => void;
}

export function ProtectedRoute({
  children,
  requireFeatures = {},
  customChecks = [],
  fallback,
  showBanner = true,
  bannerVariant = "warning",
  onBlocked,
  onUpgrade,
  ...usageLimitsProps
}: ProtectedRouteProps) {
  const limits = useUsageLimits(usageLimitsProps);

  // Verifica i requisiti delle funzionalità
  const featureChecks: UsageCheck[] = [];

  if (requireFeatures.webAgent) {
    featureChecks.push(limits.canUseWebAgent);
  }

  if (requireFeatures.knowledgeBase) {
    featureChecks.push(limits.canAddToKnowledgeBase(0));
  }

  if (requireFeatures.inviteUsers) {
    featureChecks.push(limits.canInviteUsers);
  }

  if (requireFeatures.multipleWorkspaces) {
    featureChecks.push(limits.canCreateWorkspace);
  }

  if (requireFeatures.workflows) {
    featureChecks.push(limits.canCreateWorkflow);
  }

  // Combina tutti i controlli
  const allChecks = [...featureChecks, ...customChecks];

  // Trova il primo controllo fallito
  const failedCheck = allChecks.find((check) => !check.allowed);

  // Se c'è un controllo fallito, gestisci il blocco
  if (failedCheck) {
    const reason = failedCheck.reason || "Accesso negato";

    // Chiama callback se fornito
    if (onBlocked) {
      onBlocked(reason);
    }

    // Se c'è un fallback personalizzato, usalo
    if (fallback) {
      return (
        <>
          {showBanner && (
            <UpgradeBanner
              message={reason}
              currentPlan={limits.planType}
              variant={bannerVariant}
              onUpgrade={onUpgrade}
            />
          )}
          {fallback}
        </>
      );
    }

    // Altrimenti mostra solo il banner di upgrade
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <UpgradeBanner
            message={reason}
            currentPlan={limits.planType}
            variant={bannerVariant}
            onUpgrade={onUpgrade}
            className="mb-6"
          />

          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Accesso Limitato
            </h2>
            <p className="text-gray-600">
              Questa funzionalità non è disponibile nel tuo piano attuale.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Se tutti i controlli passano, mostra il contenuto
  return (
    <>
      {/* Mostra banner informativo se il piano è limitato ma l'accesso è consentito */}
      {showBanner && limits.planType === 'free' && (
        <UpgradeBanner
          message="Stai usando un piano limitato. Aggiorna per sbloccare tutte le funzionalità."
          currentPlan={limits.planType}
          variant="info"
          onUpgrade={onUpgrade}
          className="mb-4"
        />
      )}
      {children}
    </>
  );
}

// Componenti specializzati per casi d'uso comuni

export function WebAgentProtectedRoute(
  props: Omit<ProtectedRouteProps, "requireFeatures">,
) {
  return (
    <ProtectedRoute
      {...props}
      requireFeatures={{ webAgent: true }}
      bannerVariant="error"
    />
  );
}

export function KnowledgeBaseProtectedRoute(
  props: Omit<ProtectedRouteProps, "requireFeatures">,
) {
  return (
    <ProtectedRoute
      {...props}
      requireFeatures={{ knowledgeBase: true }}
      bannerVariant="warning"
    />
  );
}

export function WorkflowProtectedRoute(
  props: Omit<ProtectedRouteProps, "requireFeatures">,
) {
  return (
    <ProtectedRoute
      {...props}
      requireFeatures={{ workflows: true }}
      bannerVariant="warning"
    />
  );
}

export function MultiWorkspaceProtectedRoute(
  props: Omit<ProtectedRouteProps, "requireFeatures">,
) {
  return (
    <ProtectedRoute
      {...props}
      requireFeatures={{ multipleWorkspaces: true }}
      bannerVariant="info"
    />
  );
}

export function InviteProtectedRoute(
  props: Omit<ProtectedRouteProps, "requireFeatures">,
) {
  return (
    <ProtectedRoute
      {...props}
      requireFeatures={{ inviteUsers: true }}
      bannerVariant="warning"
    />
  );
}
