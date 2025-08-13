/**
 * Plan Service
 * Backend service for managing user plans, limits, and usage tracking
 */

import { supabaseServer } from './supabaseServer';
import type { PlanType, PlanLimits } from '../../shared/plans';
import { getPlanLimits, isUnlimited, getUpgradeMessage, TRIAL_PRO_DURATION_DAYS } from '../../shared/plans';
import type {
  UsageMetrics,
  UsageCheck,
  WorkspaceUsage,
  UserUsage
} from '../../shared/usage-tracking';
import {
  createDefaultUsageMetrics,
  needsDailyReset,
  needsMonthlyReset,
  resetDailyCounters,
  resetMonthlyCounters,
  formatUsageMessage,
  isInTrialPeriod,
  isPlanExpired,
  USAGE_MESSAGES,
} from '../../shared/usage-tracking';

export class PlanService {
  /**
   * Get user's current plan and trial status
   */
  async getUserPlan(userId: string): Promise<{
    planType: PlanType;
    isTrialPro: boolean;
    trialStartDate?: string;
    planExpiresAt?: string;
    isExpired: boolean;
  }> {
    const { data: profile, error } = await supabaseServer
      .from('user')
      .select('plan, plan_expires_at, created_at')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      throw new Error('User profile not found');
    }

    const planType = profile.plan as PlanType;
    const planExpiresAt = profile.plan_expires_at;
    const isExpired = isPlanExpired(planExpiresAt);

    // Check if user is in Pro trial
    const isTrialPro = planType === 'pro' &&
      planExpiresAt &&
      isInTrialPeriod(profile.created_at, TRIAL_PRO_DURATION_DAYS);

    return {
      planType: isExpired ? 'free' : planType,
      isTrialPro: isTrialPro && !isExpired,
      trialStartDate: isTrialPro ? profile.created_at : undefined,
      planExpiresAt,
      isExpired,
    };
  }

  /**
   * Get user's current usage metrics
   */
  async getUserUsage(userId: string): Promise<UserUsage> {
    // Get user plan info
    const planInfo = await this.getUserPlan(userId);

    // Get or create usage record
    let { data: usage, error } = await supabaseServer
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !usage) {
      // Create default usage record
      const defaultUsage = this.createDefaultUserUsage(userId, planInfo.planType, planInfo.isTrialPro);
      await this.saveUserUsage(defaultUsage);
      return defaultUsage;
    }

    // Check if resets are needed
    const needsDaily = needsDailyReset(usage.last_daily_reset);
    const needsMonthly = needsMonthlyReset(usage.monthly_reset_date);

    if (needsDaily || needsMonthly) {
      usage = await this.resetUsageCounters(userId, needsDaily, needsMonthly);
    }

    return this.mapDatabaseUsageToUserUsage(usage, planInfo);
  }

  /**
   * Check if user can perform a specific action
   */
  async checkUsageLimit(
    userId: string,
    action: UsageAction,
    workspaceId?: string,
    actionCount: number = 1
  ): Promise<UsageCheck> {
    const userUsage = await this.getUserUsage(userId);
    const limits = getPlanLimits(userUsage.planType, userUsage.isTrialPro);

    switch (action) {
      case 'create_workspace':
        return this.checkWorkspaceLimit(userUsage, limits);

      case 'invite_collaborator':
        return this.checkCollaboratorLimit(userUsage, limits, workspaceId);

      case 'create_chat':
        return this.checkActiveChatLimit(userUsage, limits, workspaceId);

      case 'web_search':
        return this.checkWebSearchLimit(userUsage, limits, actionCount);

      case 'web_agent_run':
        return this.checkWebAgentLimit(userUsage, limits);

      case 'create_workflow':
        return this.checkWorkflowLimit(userUsage, limits, workspaceId);

      case 'execute_workflow':
        return this.checkWorkflowExecutionLimit(userUsage, limits);

      case 'upload_file':
        return this.checkFileUploadLimit(userUsage, limits);

      case 'use_knowledge_base':
        return this.checkKnowledgeBaseLimit(userUsage, limits);

      case 'chat_input':
        return this.checkChatTokenLimit(userUsage, limits, actionCount);

      default:
        return { allowed: true };
    }
  }

  /**
   * Record usage for an action
   */
  async recordUsage(
    userId: string,
    action: UsageAction,
    workspaceId?: string,
    amount: number = 1
  ): Promise<void> {
    const usage = await this.getUserUsage(userId);

    switch (action) {
      case 'web_search':
        usage.globalMetrics.webSearchesToday += amount;
        break;

      case 'web_agent_run':
        if (workspaceId) {
          const workspace = usage.workspaces.find(w => w.workspaceId === workspaceId);
          if (workspace) {
            workspace.webAgentRunsThisMonth += amount;
          }
        }
        break;

      case 'upload_file':
        if (workspaceId) {
          const workspace = usage.workspaces.find(w => w.workspaceId === workspaceId);
          if (workspace) {
            workspace.filesThisMonth += amount;
          }
        }
        break;

      case 'execute_workflow':
        if (workspaceId) {
          const workspace = usage.workspaces.find(w => w.workspaceId === workspaceId);
          if (workspace) {
            workspace.workflowExecutionsToday += amount;
          }
        }
        break;
    }

    await this.saveUserUsage(usage);
  }

  /**
   * Update workspace usage metrics
   */
  async updateWorkspaceUsage(
    userId: string,
    workspaceId: string,
    updates: Partial<UsageMetrics>
  ): Promise<void> {
    const usage = await this.getUserUsage(userId);
    const workspace = usage.workspaces.find(w => w.workspaceId === workspaceId);

    if (workspace) {
      Object.assign(workspace, updates);
      await this.saveUserUsage(usage);
    }
  }

  /**
   * Upgrade user plan
   */
  async upgradePlan(
    userId: string,
    newPlan: PlanType,
    expiresAt?: string
  ): Promise<void> {
    const { error } = await supabaseServer
      .from('user')
      .update({
        plan: newPlan,
        plan_expires_at: expiresAt,
      })
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to upgrade plan: ${error.message}`);
    }
  }

  /**
   * Start Pro trial
   */
  async startProTrial(userId: string): Promise<void> {
    const trialExpiryDate = new Date();
    trialExpiryDate.setDate(trialExpiryDate.getDate() + TRIAL_PRO_DURATION_DAYS);

    await this.upgradePlan(userId, 'pro', trialExpiryDate.toISOString());
  }

  /**
   * Handle trial expiry - downgrade to free
   */
  async handleTrialExpiry(userId: string): Promise<void> {
    await this.upgradePlan(userId, 'free');

    // TODO: Clean up data that exceeds free plan limits
    // - Archive excess workspaces
    // - Disable excess workflows
    // - Clean up knowledge base if needed
  }

  // Private helper methods

  private createDefaultUserUsage(
    userId: string,
    planType: PlanType,
    isTrialPro: boolean
  ): UserUsage {
    const defaultMetrics = createDefaultUsageMetrics();

    return {
      userId,
      planType,
      isTrialPro,
      workspaces: [],
      globalMetrics: {
        totalWorkspaces: 0,
        webSearchesToday: 0,
        lastDailyReset: defaultMetrics.lastResetDate,
      },
      updatedAt: new Date().toISOString(),
    };
  }

  private async resetUsageCounters(
    userId: string,
    resetDaily: boolean,
    resetMonthly: boolean
  ): Promise<any> {
    const updates: any = {};

    if (resetDaily) {
      updates.web_searches_today = 0;
      updates.workflow_executions_today = 0;
      updates.last_daily_reset = new Date().toISOString().split('T')[0];
    }

    if (resetMonthly) {
      updates.files_this_month = 0;
      updates.web_agent_runs_this_month = 0;
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      updates.monthly_reset_date = nextMonth.toISOString();
    }

    const { data, error } = await supabaseServer
      .from('user_usage')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to reset usage counters: ${error.message}`);
    }

    return data;
  }

  private mapDatabaseUsageToUserUsage(dbUsage: any, planInfo: any): UserUsage {
    // Map database usage record to UserUsage interface
    // This would depend on your actual database schema
    return {
      userId: dbUsage.user_id,
      planType: planInfo.planType,
      isTrialPro: planInfo.isTrialPro,
      trialStartDate: planInfo.trialStartDate,
      planExpiresAt: planInfo.planExpiresAt,
      workspaces: [], // TODO: Load workspace usage
      globalMetrics: {
        totalWorkspaces: dbUsage.total_workspaces || 0,
        webSearchesToday: dbUsage.web_searches_today || 0,
        lastDailyReset: dbUsage.last_daily_reset,
      },
      updatedAt: dbUsage.updated_at,
    };
  }

  private async saveUserUsage(usage: UserUsage): Promise<void> {
    // Save usage to database
    // This would depend on your actual database schema
    const { error } = await supabaseServer
      .from('user_usage')
      .upsert({
        user_id: usage.userId,
        total_workspaces: usage.globalMetrics.totalWorkspaces,
        web_searches_today: usage.globalMetrics.webSearchesToday,
        last_daily_reset: usage.globalMetrics.lastDailyReset,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      throw new Error(`Failed to save usage: ${error.message}`);
    }
  }

  // Usage check methods

  private checkWorkspaceLimit(usage: UserUsage, limits: PlanLimits): UsageCheck {
    if (isUnlimited(limits.maxWorkspaces)) {
      return { allowed: true };
    }

    if (usage.globalMetrics.totalWorkspaces >= limits.maxWorkspaces) {
      return {
        allowed: false,
        reason: formatUsageMessage('WORKSPACE_LIMIT', limits.maxWorkspaces),
        upgradeMessage: getUpgradeMessage(usage.planType, 'workspace'),
        currentUsage: usage.globalMetrics.totalWorkspaces,
        limit: limits.maxWorkspaces,
      };
    }

    return { allowed: true };
  }

  private checkCollaboratorLimit(usage: UserUsage, limits: PlanLimits, workspaceId?: string): UsageCheck {
    if (!limits.canInviteUsers) {
      return {
        allowed: false,
        reason: USAGE_MESSAGES.INVITE_DISABLED,
        upgradeMessage: getUpgradeMessage(usage.planType, 'inviti'),
      };
    }

    if (isUnlimited(limits.maxCollaboratorsPerWorkspace)) {
      return { allowed: true };
    }

    const workspace = usage.workspaces.find(w => w.workspaceId === workspaceId);
    const currentCollaborators = workspace?.collaboratorsCount || 0;

    if (currentCollaborators >= limits.maxCollaboratorsPerWorkspace) {
      return {
        allowed: false,
        reason: formatUsageMessage('COLLABORATOR_LIMIT', limits.maxCollaboratorsPerWorkspace),
        upgradeMessage: getUpgradeMessage(usage.planType, 'collaboratori'),
        currentUsage: currentCollaborators,
        limit: limits.maxCollaboratorsPerWorkspace,
      };
    }

    return { allowed: true };
  }

  private checkActiveChatLimit(usage: UserUsage, limits: PlanLimits, workspaceId?: string): UsageCheck {
    if (isUnlimited(limits.maxActiveChatPerWorkspace)) {
      return { allowed: true };
    }

    const workspace = usage.workspaces.find(w => w.workspaceId === workspaceId);
    const currentChats = workspace?.activeChatsCount || 0;

    if (currentChats >= limits.maxActiveChatPerWorkspace) {
      return {
        allowed: false,
        reason: formatUsageMessage('ACTIVE_CHAT_LIMIT', limits.maxActiveChatPerWorkspace),
        upgradeMessage: getUpgradeMessage(usage.planType, 'chat attive'),
        currentUsage: currentChats,
        limit: limits.maxActiveChatPerWorkspace,
      };
    }

    return { allowed: true };
  }

  private checkWebSearchLimit(usage: UserUsage, limits: PlanLimits, actionCount: number): UsageCheck {
    if (isUnlimited(limits.maxWebSearchesPerDay)) {
      return { allowed: true };
    }

    const currentSearches = usage.globalMetrics.webSearchesToday;
    if (currentSearches + actionCount > limits.maxWebSearchesPerDay) {
      return {
        allowed: false,
        reason: formatUsageMessage('WEB_SEARCH_LIMIT', limits.maxWebSearchesPerDay),
        upgradeMessage: getUpgradeMessage(usage.planType, 'ricerche web'),
        currentUsage: currentSearches,
        limit: limits.maxWebSearchesPerDay,
      };
    }

    return { allowed: true };
  }

  private checkWebAgentLimit(usage: UserUsage, limits: PlanLimits): UsageCheck {
    if (!limits.webAgentEnabled) {
      return {
        allowed: false,
        reason: USAGE_MESSAGES.WEB_AGENT_DISABLED,
        upgradeMessage: getUpgradeMessage(usage.planType, 'Web-Agent'),
      };
    }

    if (isUnlimited(limits.maxWebAgentRunsPerMonth)) {
      return { allowed: true };
    }

    // Check across all workspaces for monthly limit
    const totalRuns = usage.workspaces.reduce((sum, w) => sum + w.webAgentRunsThisMonth, 0);

    if (totalRuns >= limits.maxWebAgentRunsPerMonth) {
      return {
        allowed: false,
        reason: formatUsageMessage('WEB_AGENT_LIMIT', limits.maxWebAgentRunsPerMonth),
        upgradeMessage: getUpgradeMessage(usage.planType, 'Web-Agent'),
        currentUsage: totalRuns,
        limit: limits.maxWebAgentRunsPerMonth,
      };
    }

    return { allowed: true };
  }

  private checkWorkflowLimit(usage: UserUsage, limits: PlanLimits, workspaceId?: string): UsageCheck {
    if (isUnlimited(limits.maxActiveWorkflowsPerWorkspace)) {
      return { allowed: true };
    }

    const workspace = usage.workspaces.find(w => w.workspaceId === workspaceId);
    const currentWorkflows = workspace?.activeWorkflowsCount || 0;

    if (currentWorkflows >= limits.maxActiveWorkflowsPerWorkspace) {
      return {
        allowed: false,
        reason: formatUsageMessage('WORKFLOW_LIMIT', limits.maxActiveWorkflowsPerWorkspace),
        upgradeMessage: getUpgradeMessage(usage.planType, 'workflow'),
        currentUsage: currentWorkflows,
        limit: limits.maxActiveWorkflowsPerWorkspace,
      };
    }

    return { allowed: true };
  }

  private checkWorkflowExecutionLimit(usage: UserUsage, limits: PlanLimits): UsageCheck {
    if (isUnlimited(limits.maxWorkflowExecutionsPerDay)) {
      return { allowed: true };
    }

    const totalExecutions = usage.workspaces.reduce((sum, w) => sum + w.workflowExecutionsToday, 0);

    if (totalExecutions >= limits.maxWorkflowExecutionsPerDay) {
      return {
        allowed: false,
        reason: formatUsageMessage('WORKFLOW_EXECUTION_LIMIT', limits.maxWorkflowExecutionsPerDay),
        upgradeMessage: getUpgradeMessage(usage.planType, 'esecuzioni workflow'),
        currentUsage: totalExecutions,
        limit: limits.maxWorkflowExecutionsPerDay,
      };
    }

    return { allowed: true };
  }

  private checkFileUploadLimit(usage: UserUsage, limits: PlanLimits): UsageCheck {
    if (isUnlimited(limits.maxFilesPerMonth)) {
      return { allowed: true };
    }

    const totalFiles = usage.workspaces.reduce((sum, w) => sum + w.filesThisMonth, 0);

    if (totalFiles >= limits.maxFilesPerMonth) {
      return {
        allowed: false,
        reason: formatUsageMessage('FILE_LIMIT', limits.maxFilesPerMonth),
        upgradeMessage: getUpgradeMessage(usage.planType, 'file'),
        currentUsage: totalFiles,
        limit: limits.maxFilesPerMonth,
      };
    }

    return { allowed: true };
  }

  private checkKnowledgeBaseLimit(usage: UserUsage, limits: PlanLimits): UsageCheck {
    if (!limits.knowledgeBaseEnabled) {
      return {
        allowed: false,
        reason: USAGE_MESSAGES.KNOWLEDGE_BASE_DISABLED,
        upgradeMessage: getUpgradeMessage(usage.planType, 'Knowledge Base'),
      };
    }

    if (isUnlimited(limits.maxKnowledgeBaseSizeGB)) {
      return { allowed: true };
    }

    const totalKBSize = usage.workspaces.reduce((sum, w) => sum + w.knowledgeBaseSizeGB, 0);

    if (totalKBSize >= limits.maxKnowledgeBaseSizeGB) {
      return {
        allowed: false,
        reason: formatUsageMessage('KNOWLEDGE_BASE_FULL', limits.maxKnowledgeBaseSizeGB),
        upgradeMessage: getUpgradeMessage(usage.planType, 'Knowledge Base'),
        currentUsage: totalKBSize,
        limit: limits.maxKnowledgeBaseSizeGB,
      };
    }

    return { allowed: true };
  }

  private checkChatTokenLimit(usage: UserUsage, limits: PlanLimits, tokenCount: number): UsageCheck {
    if (tokenCount > limits.maxChatInputTokens) {
      return {
        allowed: false,
        reason: formatUsageMessage('CHAT_TOKEN_LIMIT', limits.maxChatInputTokens),
        upgradeMessage: getUpgradeMessage(usage.planType, 'token chat'),
        currentUsage: tokenCount,
        limit: limits.maxChatInputTokens,
      };
    }

    return { allowed: true };
  }
}

export type UsageAction =
  | 'create_workspace'
  | 'invite_collaborator'
  | 'create_chat'
  | 'web_search'
  | 'web_agent_run'
  | 'create_workflow'
  | 'execute_workflow'
  | 'upload_file'
  | 'use_knowledge_base'
  | 'chat_input';

// Singleton instance
export const planService = new PlanService();

