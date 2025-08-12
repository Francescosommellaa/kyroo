/**
 * Cost Calculator for Enterprise Users
 * Calculates estimated costs and revenue based on usage limits
 */

import type { PlanLimits } from './plans';

// Unit costs in EUR (these would be configurable in a real system)
export interface UnitCosts {
  // Per token costs
  chatTokenCost: number; // EUR per 1000 tokens
  embeddingTokenCost: number; // EUR per 1000 tokens
  
  // Per search costs
  webSearchCost: number; // EUR per search
  
  // Browser headless costs
  browserlessUnitCost: number; // EUR per Browserless unit

  // Parsing/OCR documents costs
  unstructuredPageCost: number; // EUR per page processed by Unstructured

  // Storage costs
  knowledgeBaseStorageCost: number; // EUR per GB per month
  databaseStorageCost: number; // EUR per GB per month
  
  // Workflow costs
  qstashMessageCost: number; // EUR per QStash message
  
  // Email costs
  resendEmailCost: number; // EUR per email

  // SMS costs
  twilioSmsOutboundCost: number; // EUR per outbound SMS
  twilioSmsInboundCost: number; // EUR per inbound SMS

  // Generic infrastructure costs (existing, not specified by user, keeping for now)
  workspaceCost: number; // EUR per workspace per month
  userCost: number; // EUR per user per month
  collaboratorCost: number; // EUR per collaborator per month
  dataRetentionCost: number; // EUR per GB per day
}

// Default unit costs based on real service pricing (January 2025)
export const DEFAULT_UNIT_COSTS: UnitCosts = {
  // LLM & NLP
  chatTokenCost: 0.004, // €0.004 per 1000 tokens (average of GPT-4o and Claude Sonnet input tokens)
  embeddingTokenCost: 0.0001, // €0.0001 per 1000 tokens (Cohere Embeddings, estimated)

  // Ricerca sul web (Tavily)
  webSearchCost: 0.008, // €0.008 per credit (Tavily: $0.008/credit)

  // Browser headless (Browserless)
  browserlessUnitCost: 0.00083, // €0.00083 per unit (Browserless: $50/month for 60k units)

  // Parsing/OCR documenti (Unstructured Serverless API)
  unstructuredPageCost: 0.01, // €0.01 per page (Unstructured: $10 per 1000 pages)

  // Storage file (Supabase Storage)
  knowledgeBaseStorageCost: 0.021, // €0.021 per GB per month (Supabase Pro overage)
  databaseStorageCost: 0.125, // €0.125 per GB per month (Supabase Pro overage)

  // Scheduler/queue (Upstash QStash)
  qstashMessageCost: 0.00001, // €0.00001 per message (QStash: $1 per 100k messages)

  // Email transazionali (Resend)
  resendEmailCost: 0.0004, // €0.0004 per email (Resend: $20/month for 50k emails)

  // SMS (Twilio SMS Italia)
  twilioSmsOutboundCost: 0.0927, // €0.0927 per SMS outbound
  twilioSmsInboundCost: 0.0200, // €0.0200 per SMS inbound

  // Generic infrastructure costs (existing, not specified by user, keeping for now)
  workspaceCost: 2.00,
  userCost: 0.50,
  collaboratorCost: 0.30,
  dataRetentionCost: 0.0002,
};

export interface CostEstimate {
  category: string;
  description: string;
  unitCost: number;
  estimatedUsage: number;
  monthlyCost: number;
  unit: string;
}

export interface CostBreakdown {
  estimates: CostEstimate[];
  totalMonthlyCost: number;
  totalYearlyCost: number;
  profitMargin: number; // percentage
  suggestedPrice: number; // monthly
  suggestedYearlyPrice: number;
}

/**
 * Calculate estimated costs based on Enterprise limits
 */
export function calculateEnterpriseCosts(
  limits: Partial<PlanLimits>,
  unitCosts: UnitCosts = DEFAULT_UNIT_COSTS,
  utilizationRate: number = 0.7 // Assume 70% utilization of limits
): CostBreakdown {
  const estimates: CostEstimate[] = [];

  // Workspace costs
  if (limits.maxWorkspaces && limits.maxWorkspaces > 0) {
    const usage = limits.maxWorkspaces === -1 ? 10 : limits.maxWorkspaces; // Assume 10 for unlimited
    estimates.push({
      category: 'Infrastructure',
      description: 'Workspace hosting',
      unitCost: unitCosts.workspaceCost,
      estimatedUsage: usage * utilizationRate,
      monthlyCost: usage * utilizationRate * unitCosts.workspaceCost,
      unit: 'workspaces',
    });
  }

  // User costs
  if (limits.maxUsersPerWorkspace && limits.maxUsersPerWorkspace > 0) {
    const workspaces = limits.maxWorkspaces === -1 ? 10 : (limits.maxWorkspaces || 1);
    const usersPerWorkspace = limits.maxUsersPerWorkspace === -1 ? 20 : limits.maxUsersPerWorkspace;
    const totalUsers = workspaces * usersPerWorkspace * utilizationRate;
    
    estimates.push({
      category: 'Infrastructure',
      description: 'User accounts',
      unitCost: unitCosts.userCost,
      estimatedUsage: totalUsers,
      monthlyCost: totalUsers * unitCosts.userCost,
      unit: 'users',
    });
  }

  // Collaborator costs
  if (limits.maxCollaboratorsPerWorkspace && limits.maxCollaboratorsPerWorkspace > 0) {
    const workspaces = limits.maxWorkspaces === -1 ? 10 : (limits.maxWorkspaces || 1);
    const collaboratorsPerWorkspace = limits.maxCollaboratorsPerWorkspace === -1 ? 50 : limits.maxCollaboratorsPerWorkspace;
    const totalCollaborators = workspaces * collaboratorsPerWorkspace * utilizationRate;
    
    estimates.push({
      category: 'Infrastructure',
      description: 'Collaborator accounts',
      unitCost: unitCosts.collaboratorCost,
      estimatedUsage: totalCollaborators,
      monthlyCost: totalCollaborators * unitCosts.collaboratorCost,
      unit: 'collaborators',
    });
  }

  // Chat token costs
  if (limits.maxChatInputTokens && limits.maxChatInputTokens > 0) {
    const tokensPerMonth = limits.maxChatInputTokens === -1 ? 1000000 : limits.maxChatInputTokens * 30 * 10; // Assume 10 chats per day
    const usage = tokensPerMonth * utilizationRate;
    
    estimates.push({
      category: 'AI Processing',
      description: 'Chat token processing',
      unitCost: unitCosts.chatTokenCost,
      estimatedUsage: usage / 1000, // Convert to thousands
      monthlyCost: (usage / 1000) * unitCosts.chatTokenCost,
      unit: 'k tokens',
    });
  }





  // Embedding token costs
  if (limits.maxEmbeddingTokens && limits.maxEmbeddingTokens > 0) {
    const tokensPerMonth = limits.maxEmbeddingTokens === -1 ? 5000000 : limits.maxEmbeddingTokens * 30 * 10; // Assume 10 embeddings per day
    const usage = tokensPerMonth * utilizationRate;
    
    estimates.push({
      category: 'AI Processing',
      description: 'Embedding token processing',
      unitCost: unitCosts.embeddingTokenCost,
      estimatedUsage: usage / 1000, // Convert to thousands
      monthlyCost: (usage / 1000) * unitCosts.embeddingTokenCost,
      unit: 'k tokens',
    });
  }
  if (limits.maxWebSearchesPerDay && limits.maxWebSearchesPerDay > 0) {
    const searchesPerMonth = limits.maxWebSearchesPerDay === -1 ? 10000 : limits.maxWebSearchesPerDay * 30;
    const usage = searchesPerMonth * utilizationRate;
    
    estimates.push({
      category: 'External Services',
      description: 'Web searches',
      unitCost: unitCosts.webSearchCost,
      estimatedUsage: usage,
      monthlyCost: usage * unitCosts.webSearchCost,
      unit: 'searches',
    });
  }

  // Knowledge Base storage costs
  if (limits.maxKnowledgeBaseSizeGB && limits.maxKnowledgeBaseSizeGB > 0) {
    const storageGB = limits.maxKnowledgeBaseSizeGB === -1 ? 1000 : limits.maxKnowledgeBaseSizeGB;
    const usage = storageGB * utilizationRate;
    
    estimates.push({
      category: 'Storage',
      description: 'Knowledge Base storage',
      unitCost: unitCosts.knowledgeBaseStorageCost,
      estimatedUsage: usage,
      monthlyCost: usage * unitCosts.knowledgeBaseStorageCost,
      unit: 'GB',
    });
  }

  // File processing costs (Unstructured)
  if (limits.maxFilesPerMonth && limits.maxFilesPerMonth > 0) {
    const pagesPerMonth = limits.maxFilesPerMonth === -1 ? 10000 : limits.maxFilesPerMonth * 10; // Assume 10 pages per file
    const usage = pagesPerMonth * utilizationRate;
    
    estimates.push({
      category: 'Processing',
      description: 'Document parsing (Unstructured)',
      unitCost: unitCosts.unstructuredPageCost,
      estimatedUsage: usage,
      monthlyCost: usage * unitCosts.unstructuredPageCost,
      unit: 'pages',
    });
  }

  // Web Agent costs (Browserless)
  if (limits.maxWebAgentRunsPerMonth && limits.maxWebAgentRunsPerMonth > 0) {
    const runsPerMonth = limits.maxWebAgentRunsPerMonth === -1 ? 500 : limits.maxWebAgentRunsPerMonth;
    const unitsPerRun = 1; // Assume 1 unit per run for simplicity (up to 30s)
    const totalUnits = runsPerMonth * unitsPerRun * utilizationRate;
    
    estimates.push({
      category: 'Automation',
      description: 'Web Agent browser sessions (Browserless)',
      unitCost: unitCosts.browserlessUnitCost,
      estimatedUsage: totalUnits,
      monthlyCost: totalUnits * unitCosts.browserlessUnitCost,
      unit: 'units',
    });
  }

  // Workflow execution costs (Upstash QStash)
  if (limits.maxWorkflowExecutionsPerDay && limits.maxWorkflowExecutionsPerDay > 0) {
    const messagesPerMonth = limits.maxWorkflowExecutionsPerDay === -1 ? 30000 : limits.maxWorkflowExecutionsPerDay * 30 * 10; // Assume 10 messages per execution
    const usage = messagesPerMonth * utilizationRate;
    
    estimates.push({
      category: 'Automation',
      description: 'Workflow messages (QStash)',
      unitCost: unitCosts.qstashMessageCost,
      estimatedUsage: usage,
      monthlyCost: usage * unitCosts.qstashMessageCost,
      unit: 'messages',
    });
  }

  // Database storage costs (Supabase Postgres)
  if (limits.maxKnowledgeBaseSizeGB && limits.maxKnowledgeBaseSizeGB > 0) { // Reusing KB size for DB storage
    const storageGB = limits.maxKnowledgeBaseSizeGB === -1 ? 1000 : limits.maxKnowledgeBaseSizeGB;
    const usage = storageGB * utilizationRate;
    
    estimates.push({
      category: 'Storage',
      description: 'Database storage (Supabase Postgres)',
      unitCost: unitCosts.databaseStorageCost,
      estimatedUsage: usage,
      monthlyCost: usage * unitCosts.databaseStorageCost,
      unit: 'GB',
    });
  }

  // Email costs (Resend)
  if (limits.maxEmailsPerMonth !== undefined && limits.maxEmailsPerMonth > 0) {
    const emailsPerMonth = limits.maxEmailsPerMonth === -1 ? 50000 : limits.maxEmailsPerMonth;
    const usage = emailsPerMonth * utilizationRate;
    
    estimates.push({
      category: 'External Services',
      description: 'Transactional emails (Resend)',
      unitCost: unitCosts.resendEmailCost,
      estimatedUsage: usage,
      monthlyCost: usage * unitCosts.resendEmailCost,
      unit: 'emails',
    });
  }

  // SMS costs (Twilio)
  if (limits.maxSmsPerMonth !== undefined && limits.maxSmsPerMonth > 0) {
    const smsPerMonth = limits.maxSmsPerMonth === -1 ? 1000 : limits.maxSmsPerMonth;
    const usage = smsPerMonth * utilizationRate;
    
    estimates.push({
      category: 'External Services',
      description: 'Outbound SMS (Twilio)',
      unitCost: unitCosts.twilioSmsOutboundCost,
      estimatedUsage: usage,
      monthlyCost: usage * unitCosts.twilioSmsOutboundCost,
      unit: 'SMS',
    });

    estimates.push({
      category: 'External Services',
      description: 'Inbound SMS (Twilio)',
      unitCost: unitCosts.twilioSmsInboundCost,
      estimatedUsage: usage * 0.1, // Assume 10% inbound SMS
      monthlyCost: usage * 0.1 * unitCosts.twilioSmsInboundCost,
      unit: 'SMS',
    });
  }

  // Calculate totals
  const totalMonthlyCost = estimates.reduce((sum, estimate) => sum + estimate.monthlyCost, 0);
  const totalYearlyCost = totalMonthlyCost * 12;

  // Calculate suggested pricing with profit margin
  const profitMargin = 40; // 40% profit margin
  const suggestedPrice = totalMonthlyCost * (1 + profitMargin / 100);
  const suggestedYearlyPrice = suggestedPrice * 12 * 0.9; // 10% discount for yearly

  return {
    estimates,
    totalMonthlyCost,
    totalYearlyCost,
    profitMargin,
    suggestedPrice,
    suggestedYearlyPrice,
  };
}

/**
 * Format currency value
 */
export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format large numbers
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toFixed(0);
}

/**
 * Get cost category color
 */
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Infrastructure': 'text-blue-600 bg-blue-100',
    'AI Processing': 'text-purple-600 bg-purple-100',
    'External Services': 'text-green-600 bg-green-100',
    'Storage': 'text-orange-600 bg-orange-100',
    'Processing': 'text-red-600 bg-red-100',
    'Automation': 'text-cyan-600 bg-cyan-100',
  };
  
  return colors[category] || 'text-gray-600 bg-gray-100';
}

