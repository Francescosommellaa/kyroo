/**
 * Usage Tracking System
 * Tracks user/workspace usage against plan limits
 */

import type { PlanType, PlanLimits } from './plans';

export interface UsageMetrics {
  // Workspace metrics
  workspaceCount: number;
  
  // Per workspace metrics
  activeChatsCount: number;
  collaboratorsCount: number;
  activeWorkflowsCount: number;
  knowledgeBaseSizeGB: number;
  
  // Daily metrics (reset at 00:00 Europe/Rome)
  webSearchesToday: number;
  workflowExecutionsToday: number;
  
  // Monthly metrics (reset on plan renewal or monthly cycle)
  filesThisMonth: number;
  webAgentRunsThisMonth: number;
  
  // Current period tracking
  lastResetDate: string; // ISO date string
  monthlyResetDate: string; // ISO date string
}

export interface UsageCheck {
  allowed: boolean;
  reason?: string;
  upgradeMessage?: string;
  currentUsage?: number;
  limit?: number;
}

export interface WorkspaceUsage extends UsageMetrics {
  workspaceId: string;
  userId: string;
  planType: PlanType;
  isTrialPro: boolean;
  updatedAt: string;
}

export interface UserUsage {
  userId: string;
  planType: PlanType;
  isTrialPro: boolean;
  trialStartDate?: string;
  planExpiresAt?: string;
  workspaces: WorkspaceUsage[];
  globalMetrics: {
    totalWorkspaces: number;
    webSearchesToday: number;
    lastDailyReset: string;
  };
  updatedAt: string;
}

/**
 * Check if daily reset is needed (00:00 Europe/Rome)
 */
export function needsDailyReset(lastResetDate: string): boolean {
  const now = new Date();
  const lastReset = new Date(lastResetDate);
  
  // Convert to Europe/Rome timezone
  const romeNow = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Rome' }));
  const romeLastReset = new Date(lastReset.toLocaleString('en-US', { timeZone: 'Europe/Rome' }));
  
  // Check if we've crossed midnight
  const nowDate = romeNow.toDateString();
  const lastResetDate_str = romeLastReset.toDateString();
  
  return nowDate !== lastResetDate_str;
}

/**
 * Check if monthly reset is needed
 */
export function needsMonthlyReset(monthlyResetDate: string): boolean {
  const now = new Date();
  const resetDate = new Date(monthlyResetDate);
  
  return now >= resetDate;
}

/**
 * Get next monthly reset date
 */
export function getNextMonthlyResetDate(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
  return nextMonth.toISOString();
}

/**
 * Get today's date in Europe/Rome timezone
 */
export function getTodayInRome(): string {
  const now = new Date();
  const romeDate = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Rome' }));
  return romeDate.toISOString().split('T')[0];
}

/**
 * Initialize default usage metrics
 */
export function createDefaultUsageMetrics(): UsageMetrics {
  const today = getTodayInRome();
  return {
    workspaceCount: 0,
    activeChatsCount: 0,
    collaboratorsCount: 0,
    activeWorkflowsCount: 0,
    knowledgeBaseSizeGB: 0,
    webSearchesToday: 0,
    workflowExecutionsToday: 0,
    filesThisMonth: 0,
    webAgentRunsThisMonth: 0,
    lastResetDate: today,
    monthlyResetDate: getNextMonthlyResetDate(),
  };
}

/**
 * Reset daily counters
 */
export function resetDailyCounters(usage: UsageMetrics): UsageMetrics {
  return {
    ...usage,
    webSearchesToday: 0,
    workflowExecutionsToday: 0,
    lastResetDate: getTodayInRome(),
  };
}

/**
 * Reset monthly counters
 */
export function resetMonthlyCounters(usage: UsageMetrics): UsageMetrics {
  return {
    ...usage,
    filesThisMonth: 0,
    webAgentRunsThisMonth: 0,
    monthlyResetDate: getNextMonthlyResetDate(),
  };
}

/**
 * Usage validation messages in Italian
 */
export const USAGE_MESSAGES = {
  WORKSPACE_LIMIT: 'Il tuo piano consente {limit} workspace. Passa a un piano superiore per crearne altri.',
  COLLABORATOR_LIMIT: 'Hai raggiunto il limite di {limit} collaboratori per questo workspace.',
  ACTIVE_CHAT_LIMIT: 'Hai raggiunto il numero massimo di {limit} chat attive. Archivia una chat esistente o passa a Pro.',
  WEB_SEARCH_LIMIT: 'Hai esaurito le {limit} ricerche web giornaliere. Riprova domani o passa a un piano superiore.',
  WEB_AGENT_DISABLED: 'Il Web-Agent è disponibile dal piano Pro.',
  WEB_AGENT_LIMIT: 'Hai raggiunto il limite di {limit} run Web-Agent mensili.',
  WORKFLOW_LIMIT: 'Hai raggiunto il limite di {limit} workflow attivi per questo workspace.',
  WORKFLOW_EXECUTION_LIMIT: 'Hai raggiunto il limite di {limit} esecuzione workflow giornaliera.',
  FILE_LIMIT: 'Hai raggiunto il limite di {limit} file mensili.',
  KNOWLEDGE_BASE_DISABLED: 'La Knowledge Base è disponibile dal piano Pro.',
  KNOWLEDGE_BASE_FULL: 'Hai esaurito i {limit} GB della Knowledge Base. Elimina alcuni file o passa a Enterprise.',
  CHAT_TOKEN_LIMIT: 'Il messaggio supera il limite di {limit} token per il tuo piano.',
  INVITE_DISABLED: 'Gli inviti sono disponibili dal piano Pro.',
  TRIAL_EXPIRED: 'Il tuo trial Pro è scaduto. Passa a Pro per continuare a usare le funzionalità avanzate.',
} as const;

/**
 * Format usage message with limit value
 */
export function formatUsageMessage(messageKey: keyof typeof USAGE_MESSAGES, limit: number): string {
  const template = USAGE_MESSAGES[messageKey];
  return template.replace('{limit}', limit.toString());
}

/**
 * Get upgrade CTA based on current plan
 */
export function getUpgradeCTA(currentPlan: PlanType): string {
  switch (currentPlan) {
    case 'free':
      return 'Passa a Pro';
    case 'pro':
      return 'Contatta il team';
    case 'enterprise':
      return 'Contatta il team';
    default:
      return 'Aggiorna piano';
  }
}

/**
 * Check if user is in trial period
 */
export function isInTrialPeriod(trialStartDate?: string, trialDurationDays: number = 7): boolean {
  if (!trialStartDate) return false;
  
  const startDate = new Date(trialStartDate);
  const now = new Date();
  const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysSinceStart < trialDurationDays;
}

/**
 * Get trial expiry date
 */
export function getTrialExpiryDate(trialStartDate: string, trialDurationDays: number = 7): string {
  const startDate = new Date(trialStartDate);
  const expiryDate = new Date(startDate.getTime() + (trialDurationDays * 24 * 60 * 60 * 1000));
  return expiryDate.toISOString();
}

/**
 * Check if plan has expired
 */
export function isPlanExpired(planExpiresAt?: string): boolean {
  if (!planExpiresAt) return false;
  
  const expiryDate = new Date(planExpiresAt);
  const now = new Date();
  
  return now > expiryDate;
}

