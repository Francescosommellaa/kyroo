/**
 * Kyroo Plans Configuration
 * Single source of truth for all plan limits and features
 */

export type PlanType = 'free' | 'pro' | 'enterprise';

export interface PlanLimits {
  // Workspace limits
  maxWorkspaces: number;
  maxUsersPerWorkspace: number;
  maxCollaboratorsPerWorkspace: number;
  
  // Chat limits
  maxActiveChatPerWorkspace: number;
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
  maxWorkflowExecutionsPerDay: number;
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
    price: {
      monthly: 0,
      yearly: 0,
    },
    limits: {
      maxWorkspaces: 1,
      maxUsersPerWorkspace: 1,
      maxCollaboratorsPerWorkspace: 0,
      maxActiveChatPerWorkspace: 10,
      maxChatInputTokens: 8000,
      maxWebSearchesPerDay: 25,
      webAgentEnabled: false,
      maxWebAgentRunsPerMonth: 0,
      maxWebAgentPagesPerRun: 0,
      maxWebAgentRunDurationMinutes: 0,
      maxActiveWorkflowsPerWorkspace: 5,
      maxWorkflowExecutionsPerDay: 1,
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
    },
    features: [
      'Chat illimitate',
      '10 chat attive per workspace',
      '25 ricerche web al giorno',
      '5 file al mese (analisi temporanea)',
      '5 workflow attivi',
      'Connettori illimitati',
    ],
    cta: 'Inizia gratis',
  },
  pro: {
    name: 'pro',
    displayName: 'Pro',
    tagline: 'Fino a 3 workspace. 1 utente + 5 collaboratori. Automazioni e Web-Agent.',
    price: {
      monthly: 19,
      yearly: 190,
    },
    limits: {
      maxWorkspaces: 3,
      maxUsersPerWorkspace: 1,
      maxCollaboratorsPerWorkspace: 5,
      maxActiveChatPerWorkspace: -1, // unlimited
      maxChatInputTokens: 32000,
      maxWebSearchesPerDay: 150,
      webAgentEnabled: true,
      maxWebAgentRunsPerMonth: 5,
      maxWebAgentPagesPerRun: 100,
      maxWebAgentRunDurationMinutes: 20,
      maxActiveWorkflowsPerWorkspace: 20,
      maxWorkflowExecutionsPerDay: 1,
      maxWorkflowConcurrency: 2,
      maxWorkflowRunDurationMinutes: -1, // unlimited
      maxFilesPerMonth: 50,
      maxFileSizeMB: 20,
      maxFilePagesPerFile: 500,
      filesPersistInKB: true,
      knowledgeBaseEnabled: true,
      maxKnowledgeBaseSizeGB: 5,
      priority: 'high',
      dataRetentionDays: 90,
      canInviteUsers: true,
    },
    features: [
      'Fino a 3 workspace',
      '1 utente + 5 collaboratori',
      'Chat illimitate',
      '150 ricerche web al giorno',
      'Web-Agent: 5 run al mese',
      '50 file al mese (persistenti)',
      'Knowledge Base 5GB',
      '20 workflow attivi',
      'Priorità alta',
    ],
    cta: 'Prova Pro 7 giorni',
  },
  enterprise: {
    name: 'enterprise',
    displayName: 'Enterprise',
    tagline: 'Illimitato e su misura: sicurezza, scalabilità, integrazioni avanzate.',
    price: {
      monthly: -1, // custom pricing
      yearly: -1, // custom pricing
    },
    limits: {
      maxWorkspaces: -1, // unlimited
      maxUsersPerWorkspace: -1, // unlimited
      maxCollaboratorsPerWorkspace: -1, // unlimited
      maxActiveChatPerWorkspace: -1, // unlimited
      maxChatInputTokens: 128000,
      maxWebSearchesPerDay: -1, // fair use
      webAgentEnabled: true,
      maxWebAgentRunsPerMonth: -1, // unlimited
      maxWebAgentPagesPerRun: -1, // contract defined
      maxWebAgentRunDurationMinutes: -1, // contract defined
      maxActiveWorkflowsPerWorkspace: -1, // unlimited
      maxWorkflowExecutionsPerDay: -1, // unlimited
      maxWorkflowConcurrency: -1, // high concurrency
      maxWorkflowRunDurationMinutes: -1, // unlimited
      maxFilesPerMonth: -1, // unlimited
      maxFileSizeMB: -1, // contract defined
      maxFilePagesPerFile: -1, // contract defined
      filesPersistInKB: true,
      knowledgeBaseEnabled: true,
      maxKnowledgeBaseSizeGB: -1, // consumption based
      priority: 'maximum',
      dataRetentionDays: -1, // contract defined
      canInviteUsers: true,
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
      'Rete dedicata',
    ],
    cta: 'Contatta il team',
  },
};

export const TRIAL_PRO_DURATION_DAYS = 7;

export const TRIAL_PRO_LIMITS: PlanLimits = {
  ...PLAN_CONFIGS.pro.limits,
  maxWebSearchesPerDay: 75, // dimezzato
  maxFilesPerMonth: 25, // dimezzato
  maxWebAgentRunsPerMonth: 2, // dimezzato
};

/**
 * Get plan configuration by type
 */
export function getPlanConfig(planType: PlanType): PlanConfig {
  return PLAN_CONFIGS[planType];
}

/**
 * Get plan limits by type, considering trial status
 */
export function getPlanLimits(planType: PlanType, isTrialPro: boolean = false): PlanLimits {
  if (planType === 'pro' && isTrialPro) {
    return TRIAL_PRO_LIMITS;
  }
  return PLAN_CONFIGS[planType].limits;
}

/**
 * Check if a value is unlimited (-1)
 */
export function isUnlimited(value: number): boolean {
  return value === -1;
}

/**
 * Format limit value for display
 */
export function formatLimit(value: number): string {
  if (isUnlimited(value)) {
    return 'Illimitato';
  }
  return value.toString();
}

/**
 * Check if user can perform action based on current usage and limits
 */
export function canPerformAction(
  currentUsage: number,
  limit: number,
  actionCount: number = 1
): boolean {
  if (isUnlimited(limit)) {
    return true;
  }
  return currentUsage + actionCount <= limit;
}

/**
 * Get upgrade suggestion message
 */
export function getUpgradeMessage(
  currentPlan: PlanType,
  feature: string,
  limit?: number
): string {
  const messages: Record<PlanType, string> = {
    free: `${feature} è disponibile dal piano Pro. Passa a Pro per sbloccare questa funzionalità.`,
    pro: `Hai raggiunto il limite${limit ? ` di ${limit}` : ''} per ${feature}. Passa a Enterprise per limiti più alti.`,
    enterprise: `Hai raggiunto il limite contrattuale per ${feature}. Contatta il team per aumentare i limiti.`,
  };
  
  return messages[currentPlan];
}

/**
 * Plan comparison for UI
 */
export const PLAN_COMPARISON = [
  {
    feature: 'Workspace',
    free: '1',
    pro: '3',
    enterprise: 'Illimitati',
  },
  {
    feature: 'Utenti per workspace',
    free: '1',
    pro: '1 + 5 collaboratori',
    enterprise: 'Illimitati',
  },
  {
    feature: 'Chat attive',
    free: '10',
    pro: 'Illimitate',
    enterprise: 'Illimitate',
  },
  {
    feature: 'Ricerche web/giorno',
    free: '25',
    pro: '150',
    enterprise: 'Illimitate',
  },
  {
    feature: 'Web-Agent',
    free: 'Non disponibile',
    pro: '5 run/mese',
    enterprise: 'Illimitato',
  },
  {
    feature: 'Knowledge Base',
    free: 'Non disponibile',
    pro: '5 GB',
    enterprise: 'Illimitata',
  },
  {
    feature: 'File/mese',
    free: '5 (temporanei)',
    pro: '50 (persistenti)',
    enterprise: 'Illimitati',
  },
  {
    feature: 'Workflow attivi',
    free: '5',
    pro: '20',
    enterprise: 'Illimitati',
  },
  {
    feature: 'Priorità',
    free: 'Standard',
    pro: 'Alta',
    enterprise: 'Massima',
  },
  {
    feature: 'Retention dati',
    free: '30 giorni',
    pro: '90 giorni',
    enterprise: 'Personalizzata',
  },
];

