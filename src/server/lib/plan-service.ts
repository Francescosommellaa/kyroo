/**
 * plan-service.ts
 * Backend service per piani, limiti ed enforcement consumi (allineato a usage-tracking v2).
 */

import { supabaseServer } from './supabaseServer';

import type { PlanType, PlanLimits } from '../../shared/plans';
import {
  getPlanLimits,
  isUnlimited,
  getUpgradeMessage,
  TRIAL_PRO_DURATION_DAYS
} from '../../shared/plans';

import type {
  WorkspaceUsage,
  UserUsage,
  UsageCheck
} from '../../shared/usage-tracking';

import {
  // date & reset
  getTodayRomeDate,
  ensureUserDailyReset,
  ensureWorkspaceDailyReset,
  ensureWorkspaceMonthlyReset,
  // messages & utils
  USAGE_MESSAGES,
  formatUsageMessage,
  isInTrialPeriod,
  isPlanExpired,
  // checkers & incrementers
  checkWorkspaceCap,
  checkOwnersCap,
  checkCollaboratorsCap,
  checkActiveChatsCap,
  checkWebSearchToday,
  incWebSearch,
  checkWebAgentRun,
  incWebAgentRun,
  canRunWorkflowToday,
  incWorkflowRun,
  checkActiveWorkflowsCap,
  checkFilesThisMonth,
  incFilesThisMonth,
  checkKBIncreaseBytes,
  checkEmailsThisMonth,
  incEmails,
  checkSmsThisMonth,
  incSms,
  bytesToGB
} from '../../shared/usage-tracking';

/* ============================================================
   TYPES
============================================================ */

export type UsageActionInput =
  | { type: 'create_workspace' }
  | { type: 'invite_owner'; workspaceId: string } // opzionale se prevedi multipli owner su Enterprise
  | { type: 'invite_collaborator'; workspaceId: string }
  | { type: 'create_chat'; workspaceId: string }
  | { type: 'web_search' }
  | { type: 'web_agent_run'; workspaceId: string }
  | { type: 'create_workflow'; workspaceId: string }
  | { type: 'execute_workflow'; workspaceId: string; workflowId: string }
  | { type: 'upload_file'; workspaceId: string }
  | { type: 'use_knowledge_base'; workspaceId: string; addBytes: number } // incremento storage
  | { type: 'chat_input'; tokenCount: number }
  | { type: 'send_email'; workspaceId: string; count?: number }
  | { type: 'send_sms'; workspaceId: string; count?: number };

/* ============================================================
   SERVICE
============================================================ */

export class PlanService {
  /**
   * Piano e stato trial dell’utente
   */
  async getUserPlan(userId: string): Promise<{
    planType: PlanType;
    isTrialPro: boolean;
    trialStartDate?: string;
    planExpiresAt?: string;
    isExpired: boolean;
  }> {
    const { data: profile, error } = await supabaseServer
      .from('profiles')
      .select('plan, plan_expires_at, created_at')
      .eq('id', userId)
      .single();

    if (error || !profile) throw new Error('User profile not found');

    const planType = (profile.plan || 'free') as PlanType;
    const planExpiresAt = profile.plan_expires_at as string | null;
    const expired = isPlanExpired(planExpiresAt || undefined);

    // Trial Pro: semplice — usiamo created_at come start se il piano è Pro con scadenza impostata
    const trialActive =
      planType === 'pro' &&
      !!planExpiresAt &&
      isInTrialPeriod(profile.created_at, TRIAL_PRO_DURATION_DAYS) &&
      !expired;

    return {
      planType: expired ? 'free' : planType,
      isTrialPro: trialActive,
      trialStartDate: trialActive ? profile.created_at : undefined,
      planExpiresAt: planExpiresAt || undefined,
      isExpired: expired
    };
  }

  /**
   * Carica l’uso attuale dell’utente + workspaces (con reset giornaliero/mensile se necessario)
   * NOTA: Assumiamo due tabelle:
   *  - user_usage (una riga per utente)
   *  - workspace_usage (una riga per workspace dell’utente)
   */
  async getUserUsage(userId: string): Promise<UserUsage> {
    const planInfo = await this.getUserPlan(userId);

    // --- user_usage (global) ---
    let { data: uu, error: e1 } = await supabaseServer
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (e1 && e1.code !== 'PGRST116') throw new Error(`user_usage load failed: ${e1.message}`);

    // --- workspace_usage (dettagli) ---
    const { data: wsRows, error: e2 } = await supabaseServer
      .from('workspace_usage')
      .select('*')
      .eq('user_id', userId);

    if (e2) throw new Error(`workspace_usage load failed: ${e2.message}`);

    // Se non esiste, crea user_usage di default
    if (!uu) {
      const created = await this.createDefaultUserUsage(userId, planInfo.planType, planInfo.isTrialPro);
      await this.saveUserUsage(created);
      return created;
    }

    // Mappa DB -> UserUsage
    const usage = this.mapDatabaseUsageToUserUsage(uu, wsRows || [], planInfo);

    // Reset giornaliero per-utente (web search)
    ensureUserDailyReset(usage);

    // Reset per workspace (giornaliero/mensile)
    let mutated = false;
    for (const w of usage.workspaces) {
      const beforeDaily = w.lastDailyRomeDate;
      const beforeMonthly = w.nextMonthlyRomeDate;
      ensureWorkspaceDailyReset(w);
      ensureWorkspaceMonthlyReset(w);
      if (w.lastDailyRomeDate !== beforeDaily || w.nextMonthlyRomeDate !== beforeMonthly) mutated = true;
    }

    if (mutated) await this.saveUserUsage(usage);

    return usage;
  }

  /**
   * Verifica limiti per un’azione (object API)
   */
  async checkUsageLimit(userId: string, action: UsageActionInput): Promise<UsageCheck> {
    const usage = await this.getUserUsage(userId);
    const limits = getPlanLimits(usage.planType, usage.isTrialPro);

    switch (action.type) {
      case 'create_workspace':
        return checkWorkspaceCap(usage.globalMetrics.totalWorkspaces, limits.maxWorkspaces);

      case 'invite_owner': {
        const ws = requireWorkspace(usage, action.workspaceId);
        return checkOwnersCap(ws.ownersCount, limits.maxOwnersPerWorkspace);
      }

      case 'invite_collaborator': {
        if (!limits.canInviteUsers) {
          return { allowed: false, reason: USAGE_MESSAGES.INVITE_DISABLED, upgradeMessage: getUpgradeMessage(usage.planType, 'inviti') };
        }
        const ws = requireWorkspace(usage, action.workspaceId);
        return checkCollaboratorsCap(ws.collaboratorsCount, limits.maxUserCollaboratorsPerWorkspace);
      }

      case 'create_chat': {
        const ws = requireWorkspace(usage, action.workspaceId);
        return checkActiveChatsCap(ws.activeChatsCount, limits.maxActiveChatsPerWorkspace);
      }

      case 'web_search': {
        return checkWebSearchToday(usage, limits.maxWebSearchesPerDay);
      }

      case 'web_agent_run': {
        if (!limits.webAgentEnabled) return { allowed: false, reason: USAGE_MESSAGES.WEB_AGENT_DISABLED, upgradeMessage: getUpgradeMessage(usage.planType, 'Web-Agent') };
        const ws = requireWorkspace(usage, action.workspaceId);
        return checkWebAgentRun(ws, limits.maxWebAgentRunsPerMonth);
      }

      case 'create_workflow': {
        const ws = requireWorkspace(usage, action.workspaceId);
        return checkActiveWorkflowsCap(ws.activeWorkflowsCount, limits.maxActiveWorkflowsPerWorkspace);
      }

      case 'execute_workflow': {
        const ws = requireWorkspace(usage, action.workspaceId);
        return canRunWorkflowToday(ws, action.workflowId, limits.maxWorkflowExecutionsPerDayPerWorkflow);
      }

      case 'upload_file': {
        const ws = requireWorkspace(usage, action.workspaceId);
        return checkFilesThisMonth(ws, limits.maxFilesPerMonth);
      }

      case 'use_knowledge_base': {
        if (!limits.knowledgeBaseEnabled) {
          return { allowed: false, reason: USAGE_MESSAGES.KNOWLEDGE_BASE_DISABLED, upgradeMessage: getUpgradeMessage(usage.planType, 'Knowledge Base') };
        }
        const ws = requireWorkspace(usage, action.workspaceId);
        const maxGB = limits.maxKnowledgeBaseSizeGB;
        return checkKBIncreaseBytes(ws.knowledgeBaseSizeBytes, action.addBytes, maxGB);
      }

      case 'chat_input': {
        const tokenCap = limits.maxChatInputTokens;
        if (action.tokenCount > tokenCap) {
          return {
            allowed: false,
            reason: formatUsageMessage('CHAT_TOKEN_LIMIT', tokenCap),
            upgradeMessage: getUpgradeMessage(usage.planType, 'token chat'),
            currentUsage: action.tokenCount,
            limit: tokenCap
          };
        }
        return { allowed: true };
      }

      case 'send_email': {
        const ws = requireWorkspace(usage, action.workspaceId);
        return checkEmailsThisMonth(ws, limits.maxEmailsPerMonth, action.count ?? 1);
      }

      case 'send_sms': {
        const ws = requireWorkspace(usage, action.workspaceId);
        return checkSmsThisMonth(ws, limits.maxSmsPerMonth, action.count ?? 1);
      }

      default:
        return { allowed: true };
    }
  }

  /**
   * Registra il consumo post-azione (solo se checkUsageLimit ha dato ok)
   */
  async recordUsage(userId: string, action: UsageActionInput): Promise<void> {
    const usage = await this.getUserUsage(userId);

    switch (action.type) {
      case 'web_search':
        incWebSearch(usage);
        break;

      case 'web_agent_run': {
        const ws = requireWorkspace(usage, action.workspaceId);
        incWebAgentRun(ws);
        break;
      }

      case 'upload_file': {
        const ws = requireWorkspace(usage, action.workspaceId);
        incFilesThisMonth(ws);
        break;
      }

      case 'execute_workflow': {
        const ws = requireWorkspace(usage, action.workspaceId);
        incWorkflowRun(ws, action.workflowId);
        break;
      }

      case 'use_knowledge_base': {
        const ws = requireWorkspace(usage, action.workspaceId);
        ws.knowledgeBaseSizeBytes += Math.max(0, action.addBytes);
        break;
      }

      case 'send_email': {
        const ws = requireWorkspace(usage, action.workspaceId);
        incEmails(ws, action.count ?? 1);
        break;
      }

      case 'send_sms': {
        const ws = requireWorkspace(usage, action.workspaceId);
        incSms(ws, action.count ?? 1);
        break;
      }

      // create_workspace / invite_* / create_chat / create_workflow / chat_input
      // non aggiornano contatori mensili/giornalieri qui.
    }

    await this.saveUserUsage(usage);
  }

  /**
   * Aggiorna metriche del workspace (merge parziale)
   */
  async updateWorkspaceUsage(userId: string, workspaceId: string, updates: Partial<WorkspaceUsage>): Promise<void> {
    const usage = await this.getUserUsage(userId);
    const ws = usage.workspaces.find(w => w.workspaceId === workspaceId);
    if (!ws) throw new Error('Workspace usage not found');

    Object.assign(ws, updates);
    await this.saveUserUsage(usage);
  }

  /**
   * Upgrade/downgrade piano
   */
  async upgradePlan(userId: string, newPlan: PlanType, expiresAt?: string): Promise<void> {
    const { error } = await supabaseServer
      .from('profiles')
      .update({ plan: newPlan, plan_expires_at: expiresAt ?? null })
      .eq('id', userId);

    if (error) throw new Error(`Failed to upgrade plan: ${error.message}`);
  }

  async startProTrial(userId: string): Promise<void> {
    const expire = new Date(Date.now() + TRIAL_PRO_DURATION_DAYS * 86_400_000).toISOString();
    await this.upgradePlan(userId, 'pro', expire);
  }

  async handleTrialExpiry(userId: string): Promise<void> {
    await this.upgradePlan(userId, 'free');
    // TODO: enforcement post-downgrade (archiviare chat eccedenti, disabilitare workflow oltre il cap, ecc.)
  }

  /* =======================
     PRIVATE
  ======================= */

  private async createDefaultUserUsage(userId: string, planType: PlanType, isTrialPro: boolean): Promise<UserUsage> {
    const today = getTodayRomeDate();
    return {
      userId,
      planType,
      isTrialPro,
      workspaces: [],
      globalMetrics: {
        totalWorkspaces: 0,
        webSearchesToday: 0,
        lastDailyRomeDate: today
      },
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * DB -> UserUsage mapping
   * Nota: adatta i nomi colonne alla tua schema reale.
   */
  private mapDatabaseUsageToUserUsage(uu: any, wsRows: any[], planInfo: any): UserUsage {
    const workspaces: WorkspaceUsage[] = (wsRows || []).map((r) => ({
      workspaceId: r.workspace_id,
      userId: r.user_id,
      planType: planInfo.planType,
      isTrialPro: planInfo.isTrialPro,
      updatedAt: r.updated_at,
      workspaceCount: r.workspace_count ?? 0,
      ownersCount: r.owners_count ?? 0,
      collaboratorsCount: r.collaborators_count ?? 0,
      activeChatsCount: r.active_chats_count ?? 0,
      activeWorkflowsCount: r.active_workflows_count ?? 0,
      knowledgeBaseSizeBytes: r.kb_size_bytes ?? 0,
      workflowExecutionsTodayByWorkflow: r.workflow_exec_today_map ?? {},
      filesThisMonth: r.files_this_month ?? 0,
      webAgentRunsThisMonth: r.web_agent_runs_this_month ?? 0,
      emailsThisMonth: r.emails_this_month ?? 0,
      smsThisMonth: r.sms_this_month ?? 0,
      lastDailyRomeDate: r.last_daily_rome_date ?? getTodayRomeDate(),
      nextMonthlyRomeDate: r.next_monthly_rome_date ?? getTodayRomeDate()
    }));

    return {
      userId: uu.user_id,
      planType: planInfo.planType,
      isTrialPro: planInfo.isTrialPro,
      trialStartDate: planInfo.trialStartDate,
      planExpiresAt: planInfo.planExpiresAt,
      workspaces,
      globalMetrics: {
        totalWorkspaces: uu.total_workspaces ?? workspaces.length,
        webSearchesToday: uu.web_searches_today ?? 0,
        lastDailyRomeDate: uu.last_daily_rome_date ?? getTodayRomeDate()
      },
      updatedAt: uu.updated_at ?? new Date().toISOString()
    };
  }

  /**
   * Salva sia user_usage che workspace_usage (upsert)
   * Nota: adatta i nomi colonne alla tua schema reale (JSONB per mappe).
   */
  private async saveUserUsage(usage: UserUsage): Promise<void> {
    // user_usage
    const { error: e1 } = await supabaseServer
      .from('user_usage')
      .upsert({
        user_id: usage.userId,
        total_workspaces: usage.globalMetrics.totalWorkspaces,
        web_searches_today: usage.globalMetrics.webSearchesToday,
        last_daily_rome_date: usage.globalMetrics.lastDailyRomeDate,
        updated_at: new Date().toISOString()
      });

    if (e1) throw new Error(`Failed to save user_usage: ${e1.message}`);

    // workspace_usage (bulk upsert)
    const rows = usage.workspaces.map((w) => ({
      user_id: w.userId,
      workspace_id: w.workspaceId,
      workspace_count: w.workspaceCount,
      owners_count: w.ownersCount,
      collaborators_count: w.collaboratorsCount,
      active_chats_count: w.activeChatsCount,
      active_workflows_count: w.activeWorkflowsCount,
      kb_size_bytes: w.knowledgeBaseSizeBytes,
      workflow_exec_today_map: w.workflowExecutionsTodayByWorkflow, // JSONB
      files_this_month: w.filesThisMonth,
      web_agent_runs_this_month: w.webAgentRunsThisMonth,
      emails_this_month: w.emailsThisMonth,
      sms_this_month: w.smsThisMonth,
      last_daily_rome_date: w.lastDailyRomeDate,
      next_monthly_rome_date: w.nextMonthlyRomeDate,
      updated_at: new Date().toISOString()
    }));

    if (rows.length) {
      const { error: e2 } = await supabaseServer.from('workspace_usage').upsert(rows);
      if (e2) throw new Error(`Failed to save workspace_usage: ${e2.message}`);
    }
  }
}

/* ============================================================
   HELPERS
============================================================ */

function requireWorkspace(usage: UserUsage, workspaceId: string | undefined): WorkspaceUsage {
  if (!workspaceId) throw new Error('workspaceId is required for this action');
  const ws = usage.workspaces.find((w) => w.workspaceId === workspaceId);
  if (!ws) throw new Error('Workspace usage not found');
  return ws;
}

// Singleton
export const planService = new PlanService();
