import { ReactNode, ReactElement, cloneElement, isValidElement } from "react";
import {
  useUsageLimits,
  type UseUsageLimitsProps,
} from "../hooks/useUsageLimits";
import { CompactUpgradeBanner } from "./UpgradeBanner";
import type { UsageCheck } from "../../../shared/usage-tracking";
import { Lock, Crown } from "lucide-react";

export interface FeatureGuardProps extends UseUsageLimitsProps {
  children: ReactNode;

  // Tipo di controllo da effettuare
  feature:
    | "webAgent"
    | "knowledgeBase"
    | "inviteUsers"
    | "createWorkspace"
    | "createChat"
    | "createWorkflow"
    | "uploadFile"
    | "webSearch"
    | "addOwner"
    | "addCollaborator"
    | "sendEmail"
    | "sendSms"
    | "custom";

  // Per controlli personalizzati
  customCheck?: UsageCheck;

  // Parametri per controlli specifici
  workflowId?: string;
  fileSizeBytes?: number;
  emailCount?: number;
  smsCount?: number;

  // Comportamento quando bloccato
  mode?: "disable" | "hide" | "replace" | "overlay";
  fallback?: ReactNode;

  // Stili per elementi disabilitati
  disabledClassName?: string;

  // Callback
  onBlocked?: (reason: string) => void;
  onUpgrade?: () => void;

  // Tooltip/messaggio
  showTooltip?: boolean;
  tooltipMessage?: string;
}

export function FeatureGuard({
  children,
  feature,
  customCheck,
  workflowId,
  fileSizeBytes = 0,
  emailCount = 1,
  smsCount = 1,
  mode = "disable",
  fallback,
  disabledClassName = "opacity-50 cursor-not-allowed",
  onBlocked,
  onUpgrade,
  showTooltip = true,
  tooltipMessage,
  ...usageLimitsProps
}: FeatureGuardProps) {
  const limits = useUsageLimits(usageLimitsProps);

  // Determina quale controllo effettuare
  let check: UsageCheck;

  switch (feature) {
    case "webAgent":
      check = limits.canUseWebAgent;
      break;
    case "knowledgeBase":
      check = limits.canAddToKnowledgeBase(fileSizeBytes);
      break;
    case "inviteUsers":
      check = limits.canInviteUsers;
      break;
    case "createWorkspace":
      check = limits.canCreateWorkspace;
      break;
    case "createChat":
      check = limits.canCreateChat;
      break;
    case "createWorkflow":
      check = limits.canCreateWorkflow;
      break;
    case "uploadFile":
      check = limits.canUploadFile;
      break;
    case "webSearch":
      check = limits.canUseWebSearch;
      break;
    case "addOwner":
      check = limits.canAddOwner;
      break;
    case "addCollaborator":
      check = limits.canAddCollaborator;
      break;
    case "sendEmail":
      check = limits.canSendEmail(emailCount);
      break;
    case "sendSms":
      check = limits.canSendSms(smsCount);
      break;
    case "custom":
      check = customCheck || { allowed: true };
      break;
    default:
      check = { allowed: true };
  }

  // Se il controllo passa, mostra il contenuto normale
  if (check.allowed) {
    return <>{children}</>;
  }

  // Gestisci il caso bloccato
  const reason = check.reason || "Funzionalità non disponibile";

  if (onBlocked) {
    onBlocked(reason);
  }

  // Mode: hide - nasconde completamente l'elemento
  if (mode === "hide") {
    return null;
  }

  // Mode: replace - sostituisce con fallback o messaggio
  if (mode === "replace") {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Lock className="h-4 w-4" />
          <span>{reason}</span>
        </div>
        <CompactUpgradeBanner
          message="Aggiorna il tuo piano per accedere a questa funzionalità"
          currentPlan={limits.planType}
          onUpgrade={onUpgrade}
          variant="info"
        />
      </div>
    );
  }

  // Mode: overlay - mostra contenuto con overlay
  if (mode === "overlay") {
    return (
      <div className="relative">
        <div className={disabledClassName}>{children}</div>
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded">
          <div className="text-center p-2">
            <Crown className="h-6 w-6 mx-auto mb-1 text-amber-500" />
            <p className="text-xs font-medium text-gray-700">
              {tooltipMessage || "Premium"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Mode: disable (default) - disabilita l'elemento
  if (isValidElement(children)) {
    const element = children as ReactElement<any>;

    // Se è un elemento con props, aggiungi disabled e className
    const enhancedProps: any = {
      disabled: true,
      className: `${element.props.className || ""} ${disabledClassName}`.trim(),
      title: showTooltip ? tooltipMessage || reason : undefined,
      onClick: (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        if (onUpgrade) onUpgrade();
      },
    };

    return cloneElement(element, enhancedProps);
  }

  // Fallback per contenuto non-elemento
  return (
    <div className={disabledClassName} title={showTooltip ? reason : undefined}>
      {children}
    </div>
  );
}

// Componenti specializzati per casi comuni

export function WebAgentGuard(props: Omit<FeatureGuardProps, "feature">) {
  return <FeatureGuard {...props} feature="webAgent" />;
}

export function KnowledgeBaseGuard(props: Omit<FeatureGuardProps, "feature">) {
  return <FeatureGuard {...props} feature="knowledgeBase" />;
}

export function WorkflowGuard(props: Omit<FeatureGuardProps, "feature">) {
  return <FeatureGuard {...props} feature="createWorkflow" />;
}

export function InviteGuard(props: Omit<FeatureGuardProps, "feature">) {
  return <FeatureGuard {...props} feature="inviteUsers" />;
}

export function FileUploadGuard(props: Omit<FeatureGuardProps, "feature">) {
  return <FeatureGuard {...props} feature="uploadFile" />;
}

export function WebSearchGuard(props: Omit<FeatureGuardProps, "feature">) {
  return <FeatureGuard {...props} feature="webSearch" />;
}

// Hook per controlli condizionali
export function useFeatureCheck(
  feature: FeatureGuardProps["feature"],
  usageLimitsProps: UseUsageLimitsProps,
  options?: {
    workflowId?: string;
    fileSizeBytes?: number;
    emailCount?: number;
    smsCount?: number;
    customCheck?: UsageCheck;
  },
): UsageCheck {
  const limits = useUsageLimits(usageLimitsProps);

  switch (feature) {
    case "webAgent":
      return limits.canUseWebAgent;
    case "knowledgeBase":
      return limits.canAddToKnowledgeBase(options?.fileSizeBytes || 0);
    case "inviteUsers":
      return limits.canInviteUsers;
    case "createWorkspace":
      return limits.canCreateWorkspace;
    case "createChat":
      return limits.canCreateChat;
    case "createWorkflow":
      return limits.canCreateWorkflow;
    case "uploadFile":
      return limits.canUploadFile;
    case "webSearch":
      return limits.canUseWebSearch;
    case "addOwner":
      return limits.canAddOwner;
    case "addCollaborator":
      return limits.canAddCollaborator;
    case "sendEmail":
      return limits.canSendEmail(options?.emailCount);
    case "sendSms":
      return limits.canSendSms(options?.smsCount);
    case "custom":
      return options?.customCheck || { allowed: true };
    default:
      return { allowed: true };
  }
}
