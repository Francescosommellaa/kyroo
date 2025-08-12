/**
 * React hook for plan management and usage tracking
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { PlanType, PlanConfig } from '../../../shared/plans';
import { getPlanConfig, getPlanLimits } from '../../../shared/plans';
import type { UserUsage, UsageCheck } from '../../../shared/usage-tracking';

interface PlanState {
  planType: PlanType;
  isTrialPro: boolean;
  trialStartDate?: string;
  planExpiresAt?: string;
  isExpired: boolean;
  config: PlanConfig;
  usage?: UserUsage;
  loading: boolean;
  error?: string;
}

interface UsePlanReturn extends PlanState {
  checkUsageLimit: (action: string, workspaceId?: string, actionCount?: number) => Promise<UsageCheck>;
  recordUsage: (action: string, workspaceId?: string, amount?: number) => Promise<void>;
  upgradePlan: (newPlan: PlanType, expiresAt?: string) => Promise<void>;
  startProTrial: () => Promise<void>;
  refreshUsage: () => Promise<void>;
}

export function usePlan(): UsePlanReturn {
  const { user, session } = useAuth();
  const [state, setState] = useState<PlanState>({
    planType: 'free',
    isTrialPro: false,
    isExpired: false,
    config: getPlanConfig('free'),
    loading: true,
  });

  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    if (!session?.access_token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }, [session?.access_token]);

  const fetchPlanData = useCallback(async () => {
    if (!user || !session) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: undefined }));

      const [planData, usageData] = await Promise.all([
        apiCall('/plan'),
        apiCall('/usage'),
      ]);

      setState(prev => ({
        ...prev,
        planType: planData.planType,
        isTrialPro: planData.isTrialPro,
        trialStartDate: planData.trialStartDate,
        planExpiresAt: planData.planExpiresAt,
        isExpired: planData.isExpired,
        config: getPlanConfig(planData.planType),
        usage: usageData,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch plan data',
        loading: false,
      }));
    }
  }, [user, session, apiCall]);

  const checkUsageLimit = useCallback(async (
    action: string,
    workspaceId?: string,
    actionCount: number = 1
  ): Promise<UsageCheck> => {
    try {
      const params = new URLSearchParams({
        action,
        ...(workspaceId && { workspaceId }),
        ...(actionCount !== 1 && { actionCount: actionCount.toString() }),
      });

      return await apiCall(`/usage/check?${params}`);
    } catch (error) {
      return {
        allowed: false,
        reason: 'Errore nel controllo dei limiti',
        upgradeMessage: 'Riprova più tardi',
      };
    }
  }, [apiCall]);

  const recordUsage = useCallback(async (
    action: string,
    workspaceId?: string,
    amount: number = 1
  ): Promise<void> => {
    await apiCall('/usage/record', {
      method: 'POST',
      body: JSON.stringify({
        action,
        workspaceId,
        amount,
      }),
    });

    // Refresh usage data after recording
    await fetchPlanData();
  }, [apiCall, fetchPlanData]);

  const upgradePlan = useCallback(async (
    newPlan: PlanType,
    expiresAt?: string
  ): Promise<void> => {
    await apiCall('/plan/upgrade', {
      method: 'POST',
      body: JSON.stringify({
        plan: newPlan,
        expiresAt,
      }),
    });

    // Refresh plan data after upgrade
    await fetchPlanData();
  }, [apiCall, fetchPlanData]);

  const startProTrial = useCallback(async (): Promise<void> => {
    await apiCall('/plan/trial', {
      method: 'POST',
    });

    // Refresh plan data after starting trial
    await fetchPlanData();
  }, [apiCall, fetchPlanData]);

  const refreshUsage = useCallback(async (): Promise<void> => {
    await fetchPlanData();
  }, [fetchPlanData]);

  // Fetch plan data on mount and when user changes
  useEffect(() => {
    fetchPlanData();
  }, [fetchPlanData]);

  return {
    ...state,
    checkUsageLimit,
    recordUsage,
    upgradePlan,
    startProTrial,
    refreshUsage,
  };
}

// Hook for checking specific usage limits with UI feedback
export function useUsageCheck() {
  const { checkUsageLimit } = usePlan();

  const checkAndShowLimit = useCallback(async (
    action: string,
    workspaceId?: string,
    actionCount?: number,
    onBlocked?: (check: UsageCheck) => void
  ): Promise<boolean> => {
    const check = await checkUsageLimit(action, workspaceId, actionCount);
    
    if (!check.allowed && onBlocked) {
      onBlocked(check);
    }
    
    return check.allowed;
  }, [checkUsageLimit]);

  return { checkAndShowLimit };
}

