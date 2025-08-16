import { useMemo } from 'react';
import type { PlanType } from '../../../shared/plans';
import { getPlanLimits } from '../../../shared/plans';
import type { UsageCheck, UserUsage, WorkspaceUsage } from '../../../shared/usage-tracking';

export interface UsageLimitsResult {
  // Workspace limits
  canCreateWorkspace: UsageCheck;
  canAddOwner: UsageCheck;
  canAddCollaborator: UsageCheck;
  
  // Chat limits
  canCreateChat: UsageCheck;
  
  // Search limits
  canUseWebSearch: UsageCheck;
  canUseWebAgent: UsageCheck;
  
  // Workflow limits
  canCreateWorkflow: UsageCheck;
  canRunWorkflow: (workflowId: string) => UsageCheck;
  
  // File limits
  canUploadFile: UsageCheck;
  canAddToKnowledgeBase: (sizeBytes: number) => UsageCheck;
  
  // Communication limits
  canSendEmail: (count?: number) => UsageCheck;
  canSendSms: (count?: number) => UsageCheck;
  canInviteUsers: UsageCheck;
  
  // Plan status
  isTrialExpired: boolean;
  isPlanActive: boolean;
  planType: PlanType;
}

export interface UseUsageLimitsProps {
  userUsage?: UserUsage;
  workspace?: WorkspaceUsage;
  planType: PlanType;
  isTrialPro?: boolean;
}

export function useUsageLimits({
  userUsage,
  workspace,
  planType,
  isTrialPro = false
}: UseUsageLimitsProps): UsageLimitsResult {
  return useMemo(() => {
    const planLimits = getPlanLimits(planType, isTrialPro);
    
    // Helper function per controlli semplici
    const checkLimit = (current: number, max: number, feature: string): UsageCheck => {
      if (max === -1) return { allowed: true }; // Unlimited
      return current < max 
        ? { allowed: true }
        : { allowed: false, reason: `Limite ${feature} raggiunto (${current}/${max})` };
    };
    
    return {
      // Workspace limits
      canCreateWorkspace: checkLimit(
        userUsage?.globalMetrics?.totalWorkspaces || 0,
        planLimits.maxWorkspaces,
        'workspace'
      ),
      
      canAddOwner: workspace ? checkLimit(
        workspace.ownersCount || 0,
        planLimits.maxOwnersPerWorkspace,
        'proprietari'
      ) : { allowed: false, reason: 'Nessun workspace selezionato' },
      
      canAddCollaborator: workspace ? checkLimit(
        workspace.collaboratorsCount || 0,
        planLimits.maxUserCollaboratorsPerWorkspace,
        'collaboratori'
      ) : { allowed: false, reason: 'Nessun workspace selezionato' },
      
      canCreateChat: { allowed: true }, // Simplified for now
      
      canUseWebSearch: checkLimit(
        userUsage?.globalMetrics?.webSearchesToday || 0,
        planLimits.maxWebSearchesPerDay,
        'ricerche web'
      ),
      
      canUseWebAgent: planType !== 'free' 
        ? checkLimit(
            workspace?.webAgentRunsThisMonth || 0,
            planLimits.maxWebAgentRunsPerMonth,
            'esecuzioni web agent'
          )
        : { allowed: false, reason: 'Web Agent non disponibile nel piano gratuito' },
      
      canCreateWorkflow: checkLimit(
        workspace?.activeWorkflowsCount || 0,
        planLimits.maxActiveWorkflowsPerWorkspace,
        'workflow attivi'
      ),
      
      canRunWorkflow: () => checkLimit(
        Object.values(workspace?.workflowExecutionsTodayByWorkflow || {}).reduce((sum, count) => sum + count, 0),
      planLimits.maxWorkflowExecutionsPerDayPerWorkflow || 100,
        'esecuzioni workflow'
      ),
      
      canUploadFile: checkLimit(
        workspace?.filesThisMonth || 0,
        planLimits.maxFilesPerMonth,
        'file caricati'
      ),
      
      canAddToKnowledgeBase: (sizeBytes: number) => {
        const currentSizeGB = (workspace?.knowledgeBaseSizeBytes || 0) / (1024 * 1024 * 1024);
        const newSizeGB = sizeBytes / (1024 * 1024 * 1024);
        const totalSizeGB = currentSizeGB + newSizeGB;
        
        return checkLimit(
          Math.round(totalSizeGB * 100) / 100,
          planLimits.maxKnowledgeBaseSizeGB,
          'dimensione Knowledge Base (GB)'
        );
      },
      
      canSendEmail: (count = 1) => checkLimit(
        (workspace?.emailsThisMonth || 0) + count,
        planLimits.maxEmailsPerMonth,
        'email'
      ),
      
      canSendSms: (count = 1) => checkLimit(
        (workspace?.smsThisMonth || 0) + count,
        planLimits.maxSmsPerMonth,
        'SMS'
      ),
      
      canInviteUsers: planType !== 'free' 
        ? { allowed: true } 
        : { allowed: false, reason: 'Inviti non disponibili nel piano gratuito' },
      
      // Plan status
      isTrialExpired: false, // Simplified for now
      isPlanActive: true, // Simplified for now
      planType
    };
  }, [userUsage, workspace, planType, isTrialPro]);
}