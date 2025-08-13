/**
 * React hook for plan management and usage tracking
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { PlanType, PlanConfig } from '../../../shared/plans';
import { getPlanConfig } from '../../../shared/plans';
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

  const fetchPlanData = useCallback(async () => {
    if (!user || !session) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: undefined }));

      // Fetch user profile for plan info
      const { data: profile, error: profileError } = await supabase
        .from('user')
        .select('plan, plan_expires_at, trial_start_date, trial_used, created_at')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw new Error('Failed to fetch user profile');
      }

      const planType = profile.plan as PlanType || 'free';
      const planExpiresAt = profile.plan_expires_at;
      const isExpired = planExpiresAt ? new Date(planExpiresAt) < new Date() : false;

      // Check if user is in Pro trial (simplified logic)
      const isTrialPro = planType === 'pro' &&
        profile.trial_start_date &&
        !profile.trial_used &&
        !isExpired;

      setState(prev => ({
        ...prev,
        planType: isExpired ? 'free' : planType,
        isTrialPro: isTrialPro && !isExpired,
        trialStartDate: profile.trial_start_date,
        planExpiresAt,
        isExpired,
        config: getPlanConfig(isExpired ? 'free' : planType),
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch plan data',
        loading: false,
      }));
    }
  }, [user, session]);

  const checkUsageLimit = useCallback(async (
    _action: string,
    _workspaceId?: string,
    _actionCount: number = 1
  ): Promise<UsageCheck> => {
    // For now, return a basic check - you can implement full logic later
    return {
      allowed: true,
      reason: undefined,
      upgradeMessage: undefined,
    };
  }, []);

  const recordUsage = useCallback(async (
    _action: string,
    _workspaceId?: string,
    _amount: number = 1
  ): Promise<void> => {
    // For now, do nothing - implement usage recording later
  }, []);

  const upgradePlan = useCallback(async (
    newPlan: PlanType,
    expiresAt?: string
  ): Promise<void> => {
    if (!user) throw new Error('No user');

    const { error } = await supabase
      .from('user')
      .update({
        plan: newPlan,
        plan_expires_at: expiresAt,
      })
      .eq('id', user.id);

    if (error) {
      throw new Error('Failed to upgrade plan');
    }

    await fetchPlanData();
  }, [user, fetchPlanData]);

  const startProTrial = useCallback(async (): Promise<void> => {
    if (!user) throw new Error('No user');

    const trialExpiresAt = new Date();
    trialExpiresAt.setDate(trialExpiresAt.getDate() + 7); // 7 days trial

    const { error } = await supabase
      .from('user')
      .update({
        plan: 'pro',
        plan_expires_at: trialExpiresAt.toISOString(),
        trial_start_date: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      throw new Error('Failed to start trial');
    }

    await fetchPlanData();
  }, [user, fetchPlanData]);

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

