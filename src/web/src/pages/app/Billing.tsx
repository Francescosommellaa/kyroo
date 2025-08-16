import { useState } from "react";
import { motion } from "framer-motion";
import {
  Crown,
  Users,
  FileText,
  Database,
  Mail,
  Search,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Zap,
  ArrowRight,
} from "lucide-react";
import AppShell from "../../components/AppShell";
import { useUsageLimits } from "../../hooks/useUsageLimits";
import type { PlanType } from "../../../../shared/plans";
import { PLAN_CONFIGS } from "../../../../shared/plans";

// Plan comparison data
const PLAN_COMPARISON = {
  free: {
    features: [
      "1 workspace",
      "1 utente",
      "10 file al mese",
      "100MB Knowledge Base",
      "5 email al mese",
      "10 ricerche web al giorno",
    ],
  },
  pro: {
    features: [
      "1 workspace",
      "1 proprietario + 5 collaboratori",
      "100 file al mese",
      "1GB Knowledge Base",
      "50 email al mese",
      "50 ricerche web al giorno",
    ],
  },
  enterprise: {
    features: [
      "Workspace persnalizzati",
      "Utenti persnalizzati",
      "File persnalizzati",
      "Knowledge Base persnalizzata",
      "Email persnalizzate",
      "Ricerche web persnalizzate",
    ],
  },
};

// Mock data rimosso - non utilizzato

interface UsageCardProps {
  title: string;
  current: number;
  limit: number | "unlimited";
  icon: React.ElementType;
  variant?: "default" | "warning" | "danger";
  unit?: string;
}

function UsageCard({
  title,
  current,
  limit,
  icon: Icon,
  variant = "default",
  unit = "",
}: UsageCardProps) {
  const percentage =
    limit === "unlimited" ? 0 : Math.min((current / limit) * 100, 100);

  const getVariantStyles = () => {
    switch (variant) {
      case "warning":
        return "border-amber-200 bg-amber-50";
      case "danger":
        return "border-red-200 bg-red-50";
      default:
        return "border-gray-200 bg-white";
    }
  };

  const getProgressColor = () => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-amber-500";
    return "bg-green-500";
  };

  return (
    <div className={`p-4 rounded-lg border ${getVariantStyles()}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-gray-600" />
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        <span className="text-sm text-gray-500">
          {current}
          {unit} / {limit === "unlimited" ? "∞" : `${limit}${unit}`}
        </span>
      </div>

      {limit !== "unlimited" && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}

interface PlanCardProps {
  planType: PlanType;
  isCurrentPlan: boolean;
  onSelect: () => void;
}

function PlanCard({ planType, isCurrentPlan, onSelect }: PlanCardProps) {
  const config = PLAN_CONFIGS[planType];
  const comparison = PLAN_COMPARISON[planType];

  return (
    <div
      className={`
      relative p-6 rounded-lg border-2 transition-all duration-200
      ${
        isCurrentPlan
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 bg-white hover:border-gray-300"
      }
    `}
    >
      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Piano Attuale
          </span>
        </div>
      )}

      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{config.name}</h3>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {config.price.monthly === 0 ? "Gratuito" : `€${config.price.monthly}`}
        </div>
        {config.price.monthly > 0 && (
          <span className="text-gray-500 text-sm">al mese</span>
        )}
      </div>

      <ul className="space-y-3 mb-8">
        {comparison.features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        disabled={isCurrentPlan}
        className={`
          w-full py-3 px-4 rounded-lg font-medium transition-colors mt-4
          ${
            isCurrentPlan
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }
        `}
      >
        {isCurrentPlan ? "Piano Attuale" : "Seleziona Piano"}
      </button>
    </div>
  );
}

export default function Billing() {
  const [currentPlan, setCurrentPlan] = useState<PlanType>("free");
  const limits = useUsageLimits({ planType: currentPlan });

  const handlePlanChange = (newPlan: PlanType) => {
    // In produzione, qui ci sarebbe l'integrazione con il sistema di pagamento
    console.log(`Cambio piano a: ${newPlan}`);
    setCurrentPlan(newPlan);
  };

  // Mock workspace data
  const workspace = {
    workspaceId: "1",
    userId: "user1",
    planType: currentPlan,
    isTrialPro: false,
    ownersCount: 1,
    collaboratorsCount: 2,
    filesThisMonth: 15,
    knowledgeBaseSizeBytes: 1024 * 1024 * 500,
    emailsThisMonth: 25,
    smsThisMonth: 0,
    webSearchesToday: 8,
    webAgentRunsThisMonth: 0,
    workflowRunsToday: 0,
    activeWorkflowsCount: 2,
    workspaceCount: 1,
    activeChatsCount: 5,
    workflowExecutionsTodayByWorkflow: {},
    lastDailyRomeDate: new Date().toISOString(),
    nextMonthlyRomeDate: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const planConfig = PLAN_CONFIGS[currentPlan];

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Gestione Piano e Fatturazione
            </h1>
            <p className="text-foreground-secondary">
              Monitora il tuo utilizzo, gestisci il piano e visualizza la
              fatturazione
            </p>
          </div>

          {/* Piano Attuale */}
          <motion.div
            className="bg-white rounded-lg border border-gray-200 p-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
              <div className="flex items-center gap-3">
                <Crown className="h-6 w-6 text-amber-500" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Piano {planConfig.name}
                  </h2>
                  <p className="text-gray-600">
                    {planConfig.price.monthly === 0
                      ? "Gratuito"
                      : `€${planConfig.price.monthly}/mese`}
                  </p>
                </div>
              </div>

              {currentPlan === "free" && (
                <div className="flex items-center gap-2 text-amber-600 mt-4">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    Aggiorna per sbloccare più funzionalità
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {planConfig.limits.maxWorkspaces === -1
                    ? "∞"
                    : planConfig.limits.maxWorkspaces}
                </div>
                <div className="text-sm text-gray-600">Workspace</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {planConfig.limits.maxUserCollaboratorsPerWorkspace === -1
                    ? "∞"
                    : planConfig.limits.maxUserCollaboratorsPerWorkspace}
                </div>
                <div className="text-sm text-gray-600">Collaboratori</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {planConfig.limits.maxFilesPerMonth === -1
                    ? "∞"
                    : planConfig.limits.maxFilesPerMonth}
                </div>
                <div className="text-sm text-gray-600">File/mese</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {planConfig.limits.maxKnowledgeBaseSizeGB === -1
                    ? "∞"
                    : `${planConfig.limits.maxKnowledgeBaseSizeGB * 1024}MB`}
                </div>
                <div className="text-sm text-gray-600">Knowledge Base</div>
              </div>
            </div>
          </motion.div>

          {/* Utilizzo Attuale */}
          <motion.div
            className="bg-white rounded-lg border border-gray-200 p-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                Utilizzo Attuale
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <UsageCard
                title="Workspace"
                current={1}
                limit={
                  planConfig.limits.maxWorkspaces === -1
                    ? "unlimited"
                    : planConfig.limits.maxWorkspaces
                }
                icon={Database}
                variant={
                  !limits.canCreateWorkspace.allowed ? "danger" : "default"
                }
              />

              <UsageCard
                title="Collaboratori"
                current={workspace.collaboratorsCount}
                limit={
                  planConfig.limits.maxUserCollaboratorsPerWorkspace === -1
                    ? "unlimited"
                    : planConfig.limits.maxUserCollaboratorsPerWorkspace
                }
                icon={Users}
                variant={
                  !limits.canAddCollaborator.allowed ? "danger" : "default"
                }
              />

              <UsageCard
                title="File questo mese"
                current={workspace.filesThisMonth}
                limit={
                  planConfig.limits.maxFilesPerMonth === -1
                    ? "unlimited"
                    : planConfig.limits.maxFilesPerMonth
                }
                icon={FileText}
                variant={!limits.canUploadFile.allowed ? "danger" : "default"}
              />

              <UsageCard
                title="Knowledge Base"
                current={Math.round(
                  workspace.knowledgeBaseSizeBytes / (1024 * 1024),
                )}
                limit={
                  planConfig.limits.maxKnowledgeBaseSizeGB === -1
                    ? "unlimited"
                    : planConfig.limits.maxKnowledgeBaseSizeGB * 1024
                }
                icon={Database}
                unit="MB"
                variant={
                  !limits.canAddToKnowledgeBase(1024 * 1024).allowed
                    ? "danger"
                    : "default"
                }
              />

              <UsageCard
                title="Email questo mese"
                current={workspace.emailsThisMonth}
                limit={
                  planConfig.limits.maxEmailsPerMonth === -1
                    ? "unlimited"
                    : planConfig.limits.maxEmailsPerMonth
                }
                icon={Mail}
                variant={!limits.canSendEmail().allowed ? "danger" : "default"}
              />

              <UsageCard
                title="Ricerche web oggi"
                current={workspace.webSearchesToday}
                limit={
                  planConfig.limits.maxWebSearchesPerDay === -1
                    ? "unlimited"
                    : planConfig.limits.maxWebSearchesPerDay
                }
                icon={Search}
                variant={!limits.canUseWebSearch.allowed ? "danger" : "default"}
              />
            </div>
          </motion.div>

          {/* Confronto Piani */}
          <motion.div
            className="bg-white rounded-lg border border-gray-200 p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Zap className="h-6 w-6 text-purple-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                Piani Disponibili
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {(["free", "pro", "enterprise"] as PlanType[]).map((planType) => (
                <PlanCard
                  key={planType}
                  planType={planType}
                  isCurrentPlan={currentPlan === planType}
                  onSelect={() => handlePlanChange(planType)}
                />
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <ArrowRight className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-900 mb-1">
                    Integrazione Pagamenti
                  </h3>
                  <p className="text-blue-700 text-sm">
                    Il sistema di pagamento verrà integrato in questa sezione
                    per gestire automaticamente upgrade, downgrade e
                    fatturazione.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </AppShell>
  );
}
