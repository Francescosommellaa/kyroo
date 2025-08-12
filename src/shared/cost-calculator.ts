/**
 * Cost Calculator for Enterprise Users
 * Calculates estimated costs and revenue based on usage limits
 */

import type { PlanLimits } from './plans';

// Unit costs in EUR (these would be configurable in a real system)
export interface UnitCosts {
  // Per token costs
  chatTokenCost: number; // EUR per 1000 tokens
  
  // Per search costs
  webSearchCost: number; // EUR per search
  
  // Storage costs
  knowledgeBaseStorageCost: number; // EUR per GB per month
  
  // File processing costs
  fileProcessingCost: number; // EUR per file
  fileSizeCost: number; // EUR per MB
  
  // Web Agent costs
  webAgentRunCost: number; // EUR per run
  webAgentPageCost: number; // EUR per page visited
  webAgentTimeCost: number; // EUR per minute
  
  // Workflow costs
  workflowExecutionCost: number; // EUR per execution
  workflowConcurrencyCost: number; // EUR per concurrent slot per month
  workflowTimeCost: number; // EUR per minute
  
  // Infrastructure costs
  workspaceCost: number; // EUR per workspace per month
  userCost: number; // EUR per user per month
  collaboratorCost: number; // EUR per collaborator per month
  
  // Data retention costs
  dataRetentionCost: number; // EUR per GB per day
}

// Default unit costs based on real service pricing (January 2025)
export const DEFAULT_UNIT_COSTS: UnitCosts = {
  // AI Processing costs (based on OpenAI GPT-4o and Claude pricing)
  chatTokenCost: 0.005, // €0.005 per 1000 tokens (average of GPT-4o $5/1M input + Claude Sonnet $3/1M input)
  
  // Web search costs (based on Tavily API pricing)
  webSearchCost: 0.008, // €0.008 per search (Tavily: $0.008 per credit/search)
  
  // Vector database and storage costs (based on Milvus/Zilliz Cloud pricing)
  knowledgeBaseStorageCost: 0.25, // €0.25 per GB per month (Zilliz Cloud vector storage)
  
  // File processing costs (based on embedding costs - Cohere Embed)
  fileProcessingCost: 0.001, // €0.001 per file (small embedding cost)
  fileSizeCost: 0.0001, // €0.0001 per MB (processing cost)
  
  // Web Agent costs (combination of browser automation + AI processing)
  webAgentRunCost: 0.10, // €0.10 per run (infrastructure + coordination)
  webAgentPageCost: 0.005, // €0.005 per page (processing + extraction)
  webAgentTimeCost: 0.02, // €0.02 per minute (compute time)
  
  // Workflow costs (compute + orchestration)
  workflowExecutionCost: 0.05, // €0.05 per execution
  workflowConcurrencyCost: 5.00, // €5.00 per slot per month (compute reservation)
  workflowTimeCost: 0.01, // €0.01 per minute
  
  // Infrastructure costs (based on Supabase pricing)
  workspaceCost: 2.00, // €2.00 per workspace per month (database + storage allocation)
  userCost: 0.50, // €0.50 per user per month (auth + profile storage)
  collaboratorCost: 0.30, // €0.30 per collaborator per month (reduced cost)
  
  // Data retention costs (based on Supabase storage pricing)
  dataRetentionCost: 0.0002, // €0.0002 per GB per day (storage cost)
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

  // Web search costs
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

  // File processing costs
  if (limits.maxFilesPerMonth && limits.maxFilesPerMonth > 0) {
    const filesPerMonth = limits.maxFilesPerMonth === -1 ? 1000 : limits.maxFilesPerMonth;
    const usage = filesPerMonth * utilizationRate;
    
    estimates.push({
      category: 'Processing',
      description: 'File processing',
      unitCost: unitCosts.fileProcessingCost,
      estimatedUsage: usage,
      monthlyCost: usage * unitCosts.fileProcessingCost,
      unit: 'files',
    });

    // File size costs
    if (limits.maxFileSizeMB && limits.maxFileSizeMB > 0) {
      const avgFileSizeMB = limits.maxFileSizeMB === -1 ? 10 : Math.min(limits.maxFileSizeMB, 10); // Assume average 10MB
      const totalSizeMB = usage * avgFileSizeMB;
      
      estimates.push({
        category: 'Processing',
        description: 'File size processing',
        unitCost: unitCosts.fileSizeCost,
        estimatedUsage: totalSizeMB,
        monthlyCost: totalSizeMB * unitCosts.fileSizeCost,
        unit: 'MB',
      });
    }
  }

  // Web Agent costs
  if (limits.maxWebAgentRunsPerMonth && limits.maxWebAgentRunsPerMonth > 0) {
    const runsPerMonth = limits.maxWebAgentRunsPerMonth === -1 ? 500 : limits.maxWebAgentRunsPerMonth;
    const usage = runsPerMonth * utilizationRate;
    
    estimates.push({
      category: 'Automation',
      description: 'Web Agent runs',
      unitCost: unitCosts.webAgentRunCost,
      estimatedUsage: usage,
      monthlyCost: usage * unitCosts.webAgentRunCost,
      unit: 'runs',
    });

    // Web Agent page costs
    if (limits.maxWebAgentPagesPerRun && limits.maxWebAgentPagesPerRun > 0) {
      const pagesPerRun = limits.maxWebAgentPagesPerRun === -1 ? 50 : limits.maxWebAgentPagesPerRun;
      const totalPages = usage * pagesPerRun;
      
      estimates.push({
        category: 'Automation',
        description: 'Web Agent pages',
        unitCost: unitCosts.webAgentPageCost,
        estimatedUsage: totalPages,
        monthlyCost: totalPages * unitCosts.webAgentPageCost,
        unit: 'pages',
      });
    }

    // Web Agent time costs
    if (limits.maxWebAgentRunDurationMinutes && limits.maxWebAgentRunDurationMinutes > 0) {
      const minutesPerRun = limits.maxWebAgentRunDurationMinutes === -1 ? 30 : limits.maxWebAgentRunDurationMinutes;
      const totalMinutes = usage * minutesPerRun;
      
      estimates.push({
        category: 'Automation',
        description: 'Web Agent runtime',
        unitCost: unitCosts.webAgentTimeCost,
        estimatedUsage: totalMinutes,
        monthlyCost: totalMinutes * unitCosts.webAgentTimeCost,
        unit: 'minutes',
      });
    }
  }

  // Workflow costs
  if (limits.maxWorkflowExecutionsPerDay && limits.maxWorkflowExecutionsPerDay > 0) {
    const executionsPerMonth = limits.maxWorkflowExecutionsPerDay === -1 ? 3000 : limits.maxWorkflowExecutionsPerDay * 30;
    const usage = executionsPerMonth * utilizationRate;
    
    estimates.push({
      category: 'Automation',
      description: 'Workflow executions',
      unitCost: unitCosts.workflowExecutionCost,
      estimatedUsage: usage,
      monthlyCost: usage * unitCosts.workflowExecutionCost,
      unit: 'executions',
    });
  }

  // Workflow concurrency costs
  if (limits.maxWorkflowConcurrency && limits.maxWorkflowConcurrency > 0) {
    const concurrencySlots = limits.maxWorkflowConcurrency === -1 ? 20 : limits.maxWorkflowConcurrency;
    const usage = concurrencySlots * utilizationRate;
    
    estimates.push({
      category: 'Infrastructure',
      description: 'Workflow concurrency slots',
      unitCost: unitCosts.workflowConcurrencyCost,
      estimatedUsage: usage,
      monthlyCost: usage * unitCosts.workflowConcurrencyCost,
      unit: 'slots',
    });
  }

  // Data retention costs
  if (limits.dataRetentionDays && limits.dataRetentionDays > 0) {
    const retentionDays = limits.dataRetentionDays === -1 ? 365 : limits.dataRetentionDays;
    const estimatedDataGB = 100; // Assume 100GB of data per user
    const totalDataGB = estimatedDataGB * utilizationRate;
    const monthlyCost = (totalDataGB * unitCosts.dataRetentionCost * retentionDays) / 30;
    
    estimates.push({
      category: 'Storage',
      description: 'Data retention',
      unitCost: unitCosts.dataRetentionCost,
      estimatedUsage: totalDataGB,
      monthlyCost: monthlyCost,
      unit: 'GB-days',
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

