import type { PlanType } from '@kyroo/shared/plans';

// User interface for admin dashboard
export interface User {
  id: string;
  full_name: string | null;
  display_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  plan: PlanType;
  plan_expires_at: string | null;
  trial_start_date: string | null;
  trial_used: boolean;
  created_at: string;
  updated_at: string;
}

// Filter states
export interface DashboardFilters {
  searchTerm: string;
  roleFilter: 'all' | 'user' | 'admin';
  planFilter: 'all' | PlanType;
}

// Dashboard stats
export interface DashboardStats {
  totalUsers: number;
  adminUsers: number;
  standardUsers: number;
  enterpriseUsers: number;
  proUsers: number;
  freeUsers: number;
}

// Action loading state
export type ActionLoadingState = string | null;

// Message state
export interface MessageState {
  type: 'success' | 'error' | 'info';
  message: string;
}

// Component props
export interface DashboardStatsProps {
  users: User[];
  loading: boolean;
}

export interface DashboardFiltersProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: Partial<DashboardFilters>) => void;
}

export interface UsersTableProps {
  users: User[];
  filteredUsers: User[];
  actionLoading: ActionLoadingState;
  onUpdateUserRole: (userId: string, newRole: 'user' | 'admin') => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  onManagePlan: (user: User) => void;
  onManageEnterpriseLimits: (userId: string) => void;
}

export interface PlanManagementProps {
  selectedUser: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdatePlan: (userId: string, newPlan: PlanType, expiresAt?: string) => Promise<void>;
  onStartTrial: (userId: string) => Promise<void>;
}

// API response types
export interface AdminApiResponse {
  users: User[];
}

export interface UpdateUserRoleRequest {
  action: 'update_user_role';
  userId: string;
  role: 'user' | 'admin';
}

export interface UpdateUserPlanRequest {
  action: 'update_user_plan';
  userId: string;
  plan: PlanType;
  expiresAt?: string;
}

export interface StartTrialRequest {
  action: 'start_trial';
  userId: string;
}

export type AdminApiRequest = UpdateUserRoleRequest | UpdateUserPlanRequest | StartTrialRequest;