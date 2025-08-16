/**
 * usage-tracking.ts
 * Sistema di tracciamento consumi (per-utente / per-workspace) allineato ai piani Kyroo.
 * - Date di reset in Europe/Rome come stringhe YYYY-MM-DD.
 * - Ricerche web: per-utente/giorno (globalMetrics).
 * - Esecuzioni workflow: per-workflow/giorno (mappa workflowId -> count).
 * - KB in byte (conversione a GB solo per display).
 */

import type { PlanType } from './plans';

/* ============================
   Tipi
============================ */

export interface UsageMetrics {
  // Workspace metrics
  workspaceCount: number;

  // Per workspace metrics
  ownersCount: number;
  collaboratorsCount: number;
  activeChatsCount: number;
  activeWorkflowsCount: number;
  knowledgeBaseSizeBytes: number;

  // Per-workflow (giornaliero, per workspace)
  workflowExecutionsTodayByWorkflow: Record<string, number>;

  // Mensili (reset al ciclo)
  filesThisMonth: number;
  webAgentRunsThisMonth: number;
  emailsThisMonth: number;
  smsThisMonth: number;

  // Ancore data (Europe/Rome) in formato YYYY-MM-DD
  lastDailyRomeDate: string;  // per reset giornaliero workspace (workflow, ecc.)
  nextMonthlyRomeDate: string; // per reset mensile
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
  updatedAt: string; // ISO
}

export interface UserUsage {
  userId: string;
  planType: PlanType;
  isTrialPro: boolean;
  trialStartDate?: string;   // ISO
  planExpiresAt?: string;    // ISO
  workspaces: WorkspaceUsage[];
  globalMetrics: {
    totalWorkspaces: number;
    webSearchesToday: number;      // per-utente/giorno
    lastDailyRomeDate: string;     // YYYY-MM-DD (utente)
  };
  updatedAt: string; // ISO
}

/* ============================
   Timezone helpers (Europe/Rome)
============================ */

function pad(n: number) { return n < 10 ? `0${n}` : `${n}`; }

export function getTodayRomeDate(): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Rome',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(now).reduce<Record<string, string>>((acc, p) => {
    if (p.type !== 'literal') acc[p.type] = p.value;
    return acc;
  }, {});
  return `${parts.year}-${parts.month}-${parts.day}`; // YYYY-MM-DD
}

export function addMonthsRome(dateYYYYMMDD: string, months = 1): string {
  const [y, m, d] = dateYYYYMMDD.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1 + months, d));
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

export function needsDailyReset(lastDailyRomeDate: string): boolean {
  return lastDailyRomeDate !== getTodayRomeDate();
}

export function needsMonthlyReset(nextMonthlyRomeDate: string): boolean {
  // Confronto lessicografico su YYYY-MM-DD
  return getTodayRomeDate() >= nextMonthlyRomeDate;
}

/* ============================
   Defaults & reset
============================ */

export function createDefaultUsageMetrics(): UsageMetrics {
  const today = getTodayRomeDate();
  return {
    workspaceCount: 0,
    ownersCount: 0,
    collaboratorsCount: 0,
    activeChatsCount: 0,
    activeWorkflowsCount: 0,
    knowledgeBaseSizeBytes: 0,
    workflowExecutionsTodayByWorkflow: {},
    filesThisMonth: 0,
    webAgentRunsThisMonth: 0,
    emailsThisMonth: 0,
    smsThisMonth: 0,
    lastDailyRomeDate: today,
    nextMonthlyRomeDate: addMonthsRome(today, 1),
  };
}

export function resetDailyCounters(usage: UsageMetrics): UsageMetrics {
  return {
    ...usage,
    workflowExecutionsTodayByWorkflow: {},
    lastDailyRomeDate: getTodayRomeDate(),
  };
}

export function resetMonthlyCounters(usage: UsageMetrics): UsageMetrics {
  const today = getTodayRomeDate();
  return {
    ...usage,
    filesThisMonth: 0,
    webAgentRunsThisMonth: 0,
    emailsThisMonth: 0,
    smsThisMonth: 0,
    nextMonthlyRomeDate: addMonthsRome(today, 1),
  };
}

/** Allinea i contatori giornalieri per l'UTENTE (webSearch per-utente). */
export function ensureUserDailyReset(userUsage: UserUsage): void {
  const today = getTodayRomeDate();
  if (userUsage.globalMetrics.lastDailyRomeDate !== today) {
    userUsage.globalMetrics.webSearchesToday = 0;
    userUsage.globalMetrics.lastDailyRomeDate = today;
  }
}

/** Allinea i contatori giornalieri per il WORKSPACE (workflow per-workflow). */
export function ensureWorkspaceDailyReset(workspace: WorkspaceUsage): void {
  if (needsDailyReset(workspace.lastDailyRomeDate)) {
    const after = resetDailyCounters(workspace);
    Object.assign(workspace, after);
  }
}

/** Allinea i contatori mensili per il WORKSPACE. */
export function ensureWorkspaceMonthlyReset(workspace: WorkspaceUsage): void {
  if (needsMonthlyReset(workspace.nextMonthlyRomeDate)) {
    const after = resetMonthlyCounters(workspace);
    Object.assign(workspace, after);
  }
}

/* ============================
   Messaggi & utility
============================ */

export const USAGE_MESSAGES = {
  WORKSPACE_LIMIT: 'Il tuo piano consente {limit} workspace. Passa a un piano superiore per crearne altri.',
  OWNER_LIMIT: 'Hai raggiunto il limite di proprietari (User): {limit}.',
  COLLABORATOR_LIMIT: 'Hai raggiunto il limite di {limit} collaboratori per questo workspace.',
  ACTIVE_CHAT_LIMIT: 'Hai raggiunto il numero massimo di {limit} chat attive. Archivia una chat o passa a Pro.',
  WEB_SEARCH_LIMIT: 'Hai esaurito le {limit} ricerche web giornaliere. Riprova domani o passa a un piano superiore.',
  WEB_AGENT_DISABLED: 'Il Web-Agent è disponibile dal piano Pro.',
  WEB_AGENT_LIMIT: 'Hai raggiunto il limite di {limit} run Web-Agent mensili.',
  WORKFLOW_LIMIT: 'Hai raggiunto il limite di {limit} workflow attivi per questo workspace.',
  WORKFLOW_EXECUTION_LIMIT: 'Hai raggiunto il limite giornaliero di esecuzioni per questo workflow: {limit}.',
  FILE_LIMIT: 'Hai raggiunto il limite di {limit} file mensili.',
  KNOWLEDGE_BASE_DISABLED: 'La Knowledge Base è disponibile dal piano Pro.',
  KNOWLEDGE_BASE_FULL: 'Hai esaurito i {limit} GB della Knowledge Base. Elimina alcuni file o passa a Enterprise.',
  CHAT_TOKEN_LIMIT: 'Il messaggio supera il limite di {limit} token per il tuo piano.',
  INVITE_DISABLED: 'Gli inviti sono disponibili dal piano Pro.',
  TRIAL_EXPIRED: 'Il tuo trial Pro è scaduto. Passa a Pro per continuare a usare le funzionalità avanzate.',
} as const;

export function formatUsageMessage(messageKey: keyof typeof USAGE_MESSAGES, limit: number | string): string {
  return USAGE_MESSAGES[messageKey].replace('{limit}', String(limit));
}

export function getUpgradeCTA(currentPlan: PlanType): string {
  return currentPlan === 'free' ? 'Passa a Pro' : 'Contatta il team';
}

export function isInTrialPeriod(trialStartDate?: string, trialDurationDays = 7): boolean {
  if (!trialStartDate) return false;
  const start = new Date(trialStartDate).getTime();
  const now = Date.now();
  const days = Math.floor((now - start) / 86_400_000);
  return days < trialDurationDays;
}

export function getTrialExpiryDate(trialStartDate: string, trialDurationDays = 7): string {
  const start = new Date(trialStartDate).getTime();
  return new Date(start + trialDurationDays * 86_400_000).toISOString();
}

export function isPlanExpired(planExpiresAt?: string): boolean {
  return !!(planExpiresAt && Date.now() > new Date(planExpiresAt).getTime());
}

export function isUnlimited(n: number) { return n === -1; }
export function bytesToGB(bytes: number, decimals = 2) {
  if (!bytes) return 0;
  const gb = bytes / (1024 ** 3);
  const f = Math.pow(10, decimals);
  return Math.round(gb * f) / f;
}

/* ============================
   Checkers (ritornano UsageCheck)
============================ */

export function checkWorkspaceCap(totalWorkspaces: number, maxWorkspaces: number): UsageCheck {
  if (isUnlimited(maxWorkspaces)) return { allowed: true };
  if (totalWorkspaces < maxWorkspaces) return { allowed: true };
  return { allowed: false, reason: formatUsageMessage('WORKSPACE_LIMIT', maxWorkspaces), limit: maxWorkspaces, currentUsage: totalWorkspaces };
}

export function checkOwnersCap(ownersCount: number, maxOwnersPerWorkspace: number): UsageCheck {
  if (isUnlimited(maxOwnersPerWorkspace)) return { allowed: true };
  if (ownersCount < maxOwnersPerWorkspace) return { allowed: true };
  return { allowed: false, reason: formatUsageMessage('OWNER_LIMIT', maxOwnersPerWorkspace), limit: maxOwnersPerWorkspace, currentUsage: ownersCount };
}

export function checkCollaboratorsCap(collaboratorsCount: number, maxCollaborators: number): UsageCheck {
  if (isUnlimited(maxCollaborators)) return { allowed: true };
  if (collaboratorsCount < maxCollaborators) return { allowed: true };
  return { allowed: false, reason: formatUsageMessage('COLLABORATOR_LIMIT', maxCollaborators), limit: maxCollaborators, currentUsage: collaboratorsCount };
}

export function checkActiveChatsCap(activeChats: number, maxActiveChatsPerWorkspace: number): UsageCheck {
  if (isUnlimited(maxActiveChatsPerWorkspace)) return { allowed: true };
  if (activeChats < maxActiveChatsPerWorkspace) return { allowed: true };
  return { allowed: false, reason: formatUsageMessage('ACTIVE_CHAT_LIMIT', maxActiveChatsPerWorkspace), limit: maxActiveChatsPerWorkspace, currentUsage: activeChats };
}

export function checkWebSearchToday(userUsage: UserUsage, perUserDailyLimit: number): UsageCheck {
  if (isUnlimited(perUserDailyLimit)) return { allowed: true };
  ensureUserDailyReset(userUsage);
  const cur = userUsage.globalMetrics.webSearchesToday;
  if (cur + 1 <= perUserDailyLimit) return { allowed: true };
  return { allowed: false, reason: formatUsageMessage('WEB_SEARCH_LIMIT', perUserDailyLimit), limit: perUserDailyLimit, currentUsage: cur };
}

export function incWebSearch(userUsage: UserUsage): void {
  ensureUserDailyReset(userUsage);
  userUsage.globalMetrics.webSearchesToday += 1;
}

export function checkWebAgentRun(workspace: WorkspaceUsage, maxRunsPerMonth: number): UsageCheck {
  ensureWorkspaceMonthlyReset(workspace);
  if (isUnlimited(maxRunsPerMonth)) return { allowed: true };
  const cur = workspace.webAgentRunsThisMonth;
  if (cur + 1 <= maxRunsPerMonth) return { allowed: true };
  return { allowed: false, reason: formatUsageMessage('WEB_AGENT_LIMIT', maxRunsPerMonth), limit: maxRunsPerMonth, currentUsage: cur };
}

export function incWebAgentRun(workspace: WorkspaceUsage): void {
  ensureWorkspaceMonthlyReset(workspace);
  workspace.webAgentRunsThisMonth += 1;
}

export function canRunWorkflowToday(workspace: WorkspaceUsage, workflowId: string, perWorkflowDailyLimit: number): UsageCheck {
  ensureWorkspaceDailyReset(workspace);
  if (isUnlimited(perWorkflowDailyLimit)) return { allowed: true };
  const cur = workspace.workflowExecutionsTodayByWorkflow[workflowId] ?? 0;
  if (cur + 1 <= perWorkflowDailyLimit) return { allowed: true };
  return { allowed: false, reason: formatUsageMessage('WORKFLOW_EXECUTION_LIMIT', perWorkflowDailyLimit), limit: perWorkflowDailyLimit, currentUsage: cur };
}

export function incWorkflowRun(workspace: WorkspaceUsage, workflowId: string): void {
  ensureWorkspaceDailyReset(workspace);
  workspace.workflowExecutionsTodayByWorkflow[workflowId] = (workspace.workflowExecutionsTodayByWorkflow[workflowId] ?? 0) + 1;
}

export function checkActiveWorkflowsCap(activeWorkflows: number, maxActiveWorkflowsPerWorkspace: number): UsageCheck {
  if (isUnlimited(maxActiveWorkflowsPerWorkspace)) return { allowed: true };
  if (activeWorkflows < maxActiveWorkflowsPerWorkspace) return { allowed: true };
  return { allowed: false, reason: formatUsageMessage('WORKFLOW_LIMIT', maxActiveWorkflowsPerWorkspace), limit: maxActiveWorkflowsPerWorkspace, currentUsage: activeWorkflows };
}

export function checkFilesThisMonth(workspace: WorkspaceUsage, maxFilesPerMonth: number): UsageCheck {
  ensureWorkspaceMonthlyReset(workspace);
  if (isUnlimited(maxFilesPerMonth)) return { allowed: true };
  const cur = workspace.filesThisMonth;
  if (cur + 1 <= maxFilesPerMonth) return { allowed: true };
  return { allowed: false, reason: formatUsageMessage('FILE_LIMIT', maxFilesPerMonth), limit: maxFilesPerMonth, currentUsage: cur };
}

export function incFilesThisMonth(workspace: WorkspaceUsage): void {
  ensureWorkspaceMonthlyReset(workspace);
  workspace.filesThisMonth += 1;
}

export function checkKBIncreaseBytes(currentBytes: number, addBytes: number, maxGB: number): UsageCheck {
  if (maxGB <= 0) {
    // 0 = KB disabilitata su Free
    return { allowed: false, reason: USAGE_MESSAGES.KNOWLEDGE_BASE_DISABLED, limit: 0, currentUsage: bytesToGB(currentBytes) };
  }
  if (isUnlimited(maxGB)) return { allowed: true };
  const nextBytes = currentBytes + addBytes;
  const capBytes = maxGB * 1024 ** 3;
  if (nextBytes <= capBytes) return { allowed: true };
  return {
    allowed: false,
    reason: formatUsageMessage('KNOWLEDGE_BASE_FULL', maxGB),
    currentUsage: bytesToGB(currentBytes),
    limit: maxGB
  };
}

export function checkEmailsThisMonth(workspace: WorkspaceUsage, maxEmailsPerMonth: number, inc = 1): UsageCheck {
  ensureWorkspaceMonthlyReset(workspace);
  if (isUnlimited(maxEmailsPerMonth)) return { allowed: true };
  const cur = workspace.emailsThisMonth;
  if (cur + inc <= maxEmailsPerMonth) return { allowed: true };
  return { allowed: false, reason: `Hai raggiunto il limite di ${maxEmailsPerMonth} email/mese.`, limit: maxEmailsPerMonth, currentUsage: cur };
}

export function incEmails(workspace: WorkspaceUsage, n = 1): void {
  ensureWorkspaceMonthlyReset(workspace);
  workspace.emailsThisMonth += n;
}

export function checkSmsThisMonth(workspace: WorkspaceUsage, maxSmsPerMonth: number, inc = 1): UsageCheck {
  ensureWorkspaceMonthlyReset(workspace);
  if (isUnlimited(maxSmsPerMonth)) return { allowed: true };
  const cur = workspace.smsThisMonth;
  if (cur + inc <= maxSmsPerMonth) return { allowed: true };
  return { allowed: false, reason: `Hai raggiunto il limite di ${maxSmsPerMonth} SMS/mese.`, limit: maxSmsPerMonth, currentUsage: cur };
}

export function incSms(workspace: WorkspaceUsage, n = 1): void {
  ensureWorkspaceMonthlyReset(workspace);
  workspace.smsThisMonth += n;
}
