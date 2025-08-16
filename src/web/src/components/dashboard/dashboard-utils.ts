import type { User, DashboardStats, DashboardFilters } from './dashboard-types';
import type { PlanType } from '@kyroo/shared/plans';

/**
 * Calculate dashboard statistics from users array
 */
export const calculateDashboardStats = (users: User[]): DashboardStats => {
  const totalUsers = users.length;
  const adminUsers = users.filter(u => u.role === 'admin').length;
  const standardUsers = users.filter(u => u.role === 'user').length;
  const enterpriseUsers = users.filter(u => u.plan === 'enterprise').length;
  const proUsers = users.filter(u => u.plan === 'pro').length;
  const freeUsers = users.filter(u => u.plan === 'free').length;

  return {
    totalUsers,
    adminUsers,
    standardUsers,
    enterpriseUsers,
    proUsers,
    freeUsers
  };
};

/**
 * Filter users based on search term, role, and plan
 */
export const filterUsers = (users: User[], filters: DashboardFilters): User[] => {
  return users.filter(user => {
    const matchesSearch = !filters.searchTerm ||
      user.full_name?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(filters.searchTerm.toLowerCase());

    const matchesRole = filters.roleFilter === 'all' || user.role === filters.roleFilter;
    const matchesPlan = filters.planFilter === 'all' || user.plan === filters.planFilter;

    return matchesSearch && matchesRole && matchesPlan;
  });
};

/**
 * Get user initials for avatar display
 */
export const getUserInitials = (user: User): string => {
  if (user.display_name) {
    return user.display_name.charAt(0).toUpperCase();
  }
  if (user.full_name) {
    const names = user.full_name.split(' ');
    if (names.length >= 2) {
      return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase();
  }
  return 'U';
};

/**
 * Format date for display in Italian locale
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('it-IT');
};

/**
 * Check if user is on trial
 */
export const isUserOnTrial = (user: User): boolean => {
  return user.plan === 'pro' &&
    user.trial_start_date !== null &&
    user.plan_expires_at !== null &&
    new Date(user.plan_expires_at) > new Date();
};

/**
 * Get role display info
 */
export const getRoleInfo = (role: 'user' | 'admin') => {
  return role === 'admin'
    ? {
        label: 'Admin',
        className: 'bg-accent-violet/10 text-accent-violet',
        icon: 'Shield'
      }
    : {
        label: 'User',
        className: 'bg-green-500/10 text-green-500',
        icon: 'UserCheck'
      };
};

/**
 * Validate user ID format
 */
export const isValidUserId = (userId: string): boolean => {
  return typeof userId === 'string' && userId.length > 0;
};

/**
 * Get plan filter options
 */
export const getPlanFilterOptions = (): Array<{ value: 'all' | PlanType; label: string }> => {
  return [
    { value: 'all', label: 'Tutti i piani' },
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro' },
    { value: 'enterprise', label: 'Enterprise' }
  ];
};

/**
 * Get role filter options
 */
export const getRoleFilterOptions = (): Array<{ value: 'all' | 'user' | 'admin'; label: string }> => {
  return [
    { value: 'all', label: 'Tutti i ruoli' },
    { value: 'admin', label: 'Admin' },
    { value: 'user', label: 'User' }
  ];
};

/**
 * Debounce function for search input
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Sort users by different criteria
 */
export const sortUsers = (users: User[], sortBy: 'name' | 'role' | 'plan' | 'created', order: 'asc' | 'desc' = 'asc'): User[] => {
  const sorted = [...users].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        const nameA = a.display_name || a.full_name || '';
        const nameB = b.display_name || b.full_name || '';
        comparison = nameA.localeCompare(nameB);
        break;
      case 'role':
        comparison = a.role.localeCompare(b.role);
        break;
      case 'plan':
        comparison = a.plan.localeCompare(b.plan);
        break;
      case 'created':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
    }
    
    return order === 'desc' ? -comparison : comparison;
  });
  
  return sorted;
};