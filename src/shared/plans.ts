/**
 * Kyroo Plans Configuration
 * Single source of truth for all plan limits and features
 */

export type PlanType = 'free' | 'pro' | 'enterprise';

export interface PlanLimits {
  // Workspace & team limits
  maxWorkspaces: number;
  /** Deprecated: use maxOwnersPerWorkspace + maxUserCollaboratorsPerWorkspace */
  maxUsersPerWorkspace: number;
  maxOwnersPerWorkspace: number;                // # di "User" (proprietari)
  maxUserCollaboratorsPerWorkspace: number;     // # di "User_collaborator"

  // Chat limits
  maxActiveChatsPerWorkspace: number;
  maxChatInputTokens: number;
  maxEmbeddingTokens: number;

  // Search limits (per user per day)
  maxWebSearchesPerDay: number;

  // Web Agent limits
  webAgentEnabled: boolean;
  maxWebAgentRunsPerMonth: number;
  maxWebAgentPagesPerRun: number;
  maxWebAgentRunDurationMinutes: number;

  // Workflow limits
  maxActiveWorkflowsPerWorkspace: number;
  maxWorkflowExecutionsPerDayPerWorkflow: number; // <-- chiarito
  maxWorkflowConcurrency: number;
  maxWorkflowRunDurationMinutes: number;

  // File analysis limits
  maxFilesPerMonth: number;
  maxFileSizeMB: number;
  maxFilePagesPerFile: number;
  filesPersistInKB: boolean;

  // Knowledge Base limits
  knowledgeBaseEnabled: boolean;
  maxKnowledgeBaseSizeGB: number;

  // System limits
  priority: 'standard' | 'high' | 'maximum';
  dataRetentionDays: number;

  // Team features
  canInviteUsers: boolean;
  maxEmailsPerMonth: number; // includi una soglia realistica per evitare costi illimitati
  maxSmsPerMonth: number;    // 0 su Free/Pro, usage-based su Enterprise
}

export interface PlanConfig {
  name: string;
  displayName: string;
  tagline: string;
  price: {
    monthly: number;
    yearly: number;
  };
  limits: PlanLimits;
  features: string[];
  cta: string;
}

export const PLAN_CONFIGS: Record<PlanType, PlanConfig> = {
  free: {
    name: 'free',
    displayName: 'Free',
    tagline: '1 workspace, 1 utente. Chat illimitate, nessuna Knowledge Base.',
    price: { monthly: 0, yearly: 0 },
    limits: {
      maxWorkspaces: 1,
      maxUsersPerWorkspace: 1,            // deprecated
      maxOwnersPerWorkspace: 1,
      maxUserCollaboratorsPerWorkspace: 0,
      maxActiveChatsPerWorkspace: 10,
      maxChatInputTokens: 8000,
      maxEmbeddingTokens: 1000,
      maxWebSearchesPerDay: 25,
      webAgentEnabled: false,
      maxWebAgentRunsPerMonth: 0,
      maxWebAgentPagesPerRun: 0,
      maxWebAgentRunDurationMinutes: 0,
      maxActiveWorkflowsPerWorkspace: 5,
      maxWorkflowExecutionsPerDayPerWorkflow: 1,
      maxWorkflowConcurrency: 1,
      maxWorkflowRunDurationMinutes: 10,
      maxFilesPerMonth: 5,
      maxFileSizeMB: 20,
      maxFilePagesPerFile: 500,
      filesPersistInKB: false,
      knowledgeBaseEnabled: false,
      maxKnowledgeBaseSizeGB: 0,
      priority: 'standard',
      dataRetentionDays: 30,
      canInviteUsers: false,
      maxEmailsPerMonth: 3000,  // allineato al free tier tipico
      maxSmsPerMonth: 0
    },
    features: [
      'Chat illimitate',
      '10 chat attive per workspace',
      '25 ricerche web al giorno',
      '5 file al mese (analisi temporanea)',
      '5 workflow attivi',
      'Connettori illimitati'
    ],
    cta: 'Inizia gratis'
  },

  pro: {
    name: 'pro',
    displayName: 'Pro',
    tagline: 'Fino a 3 workspace. 1 utente + 5 collaboratori per workspace. Automazioni e Web-Agent.',
    price: { monthly: 19, yearly: 190 },
    limits: {
      maxWorkspaces: 3,
      maxUsersPerWorkspace: 6,              // deprecated: 1 owner + 5 collab = 6 seat
      maxOwnersPerWorkspace: 1,
      maxUserCollaboratorsPerWorkspace: 5,
      maxActiveChatsPerWorkspace: -1,       // unlimited
      maxChatInputTokens: 32000,
      maxEmbeddingTokens: 10000,
      maxWebSearchesPerDay: 150,
      webAgentEnabled: true,
      maxWebAgentRunsPerMonth: 5,
      maxWebAgentPagesPerRun: 100,
      maxWebAgentRunDurationMinutes: 20,
      maxActiveWorkflowsPerWorkspace: 20,
      maxWorkflowExecutionsPerDayPerWorkflow: 1,
      maxWorkflowConcurrency: 2,
      maxWorkflowRunDurationMinutes: 20,    // <-- corretto (non illimitato)
      maxFilesPerMonth: 50,
      maxFileSizeMB: 20,
      maxFilePagesPerFile: 500,
      filesPersistInKB: true,
      knowledgeBaseEnabled: true,
      maxKnowledgeBaseSizeGB: 5,
      priority: 'high',
      dataRetentionDays: 90,
      canInviteUsers: true,
      maxEmailsPerMonth: 50000, // soglia sensata per evitare esplosione costi
      maxSmsPerMonth: 0         // SMS a consumo sui contratti Enterprise
    },
    features: [
      'Fino a 3 workspace',
      '1 utente + 5 collaboratori per workspace',
      'Chat illimitate',
      '150 ricerche web al giorno',
      'Web-Agent: 5 run al mese',
      '50 file al mese (persistenti)',
      'Knowledge Base 5GB',
      '20 workflow attivi',
      'Priorità alta'
    ],
    cta: 'Prova Pro 7 giorni'
  },

  enterprise: {
    name: 'enterprise',
    displayName: 'Enterprise',
    tagline: 'Illimitato e su misura: sicurezza, scalabilità, integrazioni avanzate.',
    price: { monthly: -1, yearly: -1 }, // custom
    limits: {
      maxWorkspaces: -1,
      maxUsersPerWorkspace: -1,
      maxOwnersPerWorkspace: -1,
      maxUserCollaboratorsPerWorkspace: -1,
      maxActiveChatsPerWorkspace: -1,
      maxChatInputTokens: 128000,
      maxEmbeddingTokens: -1,
      maxWebSearchesPerDay: -1,
      webAgentEnabled: true,
      maxWebAgentRunsPerMonth: -1,
      maxWebAgentPagesPerRun: -1,
      maxWebAgentRunDurationMinutes: -1,
      maxActiveWorkflowsPerWorkspace: -1,
      maxWorkflowExecutionsPerDayPerWorkflow: -1,
      maxWorkflowConcurrency: -1,
      maxWorkflowRunDurationMinutes: -1,
      maxFilesPerMonth: -1,
      maxFileSizeMB: -1,
      maxFilePagesPerFile: -1,
      filesPersistInKB: true,
      knowledgeBaseEnabled: true,
      maxKnowledgeBaseSizeGB: -1,
      priority: 'maximum',
      dataRetentionDays: -1,
      canInviteUsers: true,
      maxEmailsPerMonth: -1,
      maxSmsPerMonth: -1
    },
    features: [
      'Workspace illimitati',
      'Utenti e collaboratori illimitati',
      'Chat illimitate (128k token)',
      'Ricerche web illimitate',
      'Web-Agent illimitato',
      'File illimitati',
      'Knowledge Base illimitata',
      'Workflow illimitati',
      'Priorità massima',
      'SSO SAML/SCIM',
      'Audit avanzati',
      'Data residency UE',
      'Rete dedicata'
    ],
    cta: 'Contatta il team'
  }
};

export const TRIAL_PRO_DURATION_DAYS = 7;

export const TRIAL_PRO_LIMITS: PlanLimits = {
  ...PLAN_CONFIGS.pro.limits,
  maxWebSearchesPerDay: 75,
  maxFilesPerMonth: 25,
  maxWebAgentRunsPerMonth: 2
};

/** Helpers */
export function getPlanConfig(planType: PlanType): PlanConfig {
  return PLAN_CONFIGS[planType];
}

export function getPlanLimits(planType: PlanType, isTrialPro = false): PlanLimits {
  if (planType === 'pro' && isTrialPro) return TRIAL_PRO_LIMITS;
  return PLAN_CONFIGS[planType].limits;
}

export function isUnlimited(value: number): boolean {
  return value === -1;
}

export function formatLimit(value: number, planType?: PlanType): string {
  if (isUnlimited(value)) return planType === 'enterprise' ? 'Personalizzato' : 'Illimitato';
  return value.toString();
}

export function canPerformAction(currentUsage: number, limit: number, actionCount = 1): boolean {
  if (isUnlimited(limit)) return true;
  return currentUsage + actionCount <= limit;
}

export function getUpgradeMessage(currentPlan: PlanType, feature: string, limit?: number): string {
  const messages: Record<PlanType, string> = {
    free: `${feature} è disponibile dal piano Pro. Passa a Pro per sbloccare questa funzionalità.`,
    pro: `Hai raggiunto il limite${limit ? ` di ${limit}` : ''} per ${feature}. Passa a Enterprise per limiti più alti.`,
    enterprise: `Hai raggiunto il limite contrattuale per ${feature}. Contatta il team per aumentare i limiti.`
  };
  return messages[currentPlan];
}

/** Plan comparison for UI */
export const PLAN_COMPARISON = [
  { feature: 'Workspace', free: '1', pro: '3', enterprise: 'Personalizzati' },
  { feature: 'Utenti per workspace', free: '1', pro: '1 + 5 collaboratori', enterprise: 'Personalizzati' },
  { feature: 'Chat attive', free: '10', pro: 'Illimitate', enterprise: 'Illimitate' },
  { feature: 'Ricerche web/giorno', free: '25', pro: '150', enterprise: 'Illimitate' },
  { feature: 'Web-Agent', free: 'Non disponibile', pro: '5 run/mese', enterprise: 'Personalizzato' },
  { feature: 'Knowledge Base', free: 'Non disponibile', pro: '5 GB', enterprise: 'Personalizzata' },
  { feature: 'File/mese', free: '5 (temporanei)', pro: '50 (persistenti)', enterprise: 'Personalizzati' },
  { feature: 'Workflow attivi', free: '5', pro: '20', enterprise: 'Personalizzati' },
  { feature: 'Priorità', free: 'Standard', pro: 'Alta', enterprise: 'Massima' },
  { feature: 'Retention dati', free: '30 giorni', pro: '90 giorni', enterprise: 'Personalizzata' }
];
