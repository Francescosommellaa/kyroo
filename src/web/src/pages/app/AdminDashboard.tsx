import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import PlanManagementModal from '../../components/PlanManagementModal';
import {
  DashboardStats,
  DashboardFilters,
  UsersTable,
  type User,
  type DashboardFilters as DashboardFiltersType,
  type MessageState,
  type ActionLoadingState,
  calculateDashboardStats,
  filterUsers
} from '../../components/dashboard';
import type { PlanType } from '../../../../shared/plans';

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<MessageState | null>(null);
  const [filters, setFilters] = useState<DashboardFiltersType>({
    searchTerm: '',
    roleFilter: 'all',
    planFilter: 'all'
  });
  const [actionLoading, setActionLoading] = useState<ActionLoadingState>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);

  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/.netlify/functions/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ action: 'get_users' })
      });

      if (!response.ok) {
        throw new Error('Failed to load users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error('Error loading users:', err);
      setError({
        type: 'error',
        message: 'Failed to load users. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: "user" | "admin") => {
    try {
      setActionLoading(userId);
      setError(null);
      const response = await fetch("/.netlify/functions/admin", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "update_user_role",
          userId,
          role: newRole,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user role");
      }

      // Reload users
      await loadUsers();
    } catch (err) {
      console.error("Error updating user role:", err);
      setError({
        type: 'error',
        message: 'Failed to update user role. Please try again.'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async (userId: string) => {
    if (
      !confirm(
        "Sei sicuro di voler eliminare questo utente? Questa azione non può essere annullata.",
      )
    ) {
      return;
    }

    try {
      setActionLoading(userId);
      setError(null);
      const response = await fetch(
        `/.netlify/functions/admin?userId=${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      // Reload users
      await loadUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      setError({
        type: 'error',
        message: 'Failed to delete user. Please try again.'
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Aggiungi queste funzioni QUI
  const handleUpdatePlan = async (
    userId: string,
    newPlan: PlanType,
    expiresAt?: string,
  ) => {
    try {
      setActionLoading(userId);
      setError(null);
      const response = await fetch("/.netlify/functions/admin", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "update_user_plan",
          userId,
          plan: newPlan,
          expiresAt,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user plan");
      }

      // Reload users
      await loadUsers();

      // Close modal
      setShowPlanModal(true);
      setSelectedUser(null);
    } catch (err) {
      setError({
        type: 'error',
        message: 'Failed to update user plan. Please try again.'
      });
      console.error("Error updating user plan:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartTrial = async (userId: string) => {
    try {
      setActionLoading(userId);
      setError(null);
      const response = await fetch("/.netlify/functions/admin", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "start_trial",
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start trial");
      }

      // Reload users
      await loadUsers();

      // Close modal
      setShowPlanModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Error starting trial:", err);
      setError({
        type: 'error',
        message: 'Failed to start trial. Please try again.'
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: Partial<DashboardFiltersType>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Handle plan management
  const handleManagePlan = (user: User) => {
    setSelectedUser(user);
    setShowPlanModal(true);
  };

  // Handle enterprise limits management
  const handleManageEnterpriseLimits = (userId: string) => {
    // TODO: Implement enterprise limits management
    console.log('Managing enterprise limits for user:', userId);
  };

  // Memoized filtered users
  const filteredUsers = useMemo(() => {
    return filterUsers(users, filters);
  }, [users, filters]);

  // Memoized dashboard stats
  const dashboardStats = useMemo(() => {
    return calculateDashboardStats(users);
  }, [users]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-accent-violet border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground-secondary">Caricamento utenti...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Dashboard Amministratore
          </h1>
          <p className="text-foreground-secondary">
            Gestisci utenti e monitora l'attività della piattaforma
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-red-500">{error.message}</p>
        </motion.div>
      )}

      {/* Dashboard Stats */}
      <DashboardStats users={users} loading={loading} />

      {/* Dashboard Filters */}
      <DashboardFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {/* Users Table */}
      <UsersTable
        users={users}
        filteredUsers={filteredUsers}
        actionLoading={actionLoading}
        onUpdateUserRole={updateUserRole}
        onDeleteUser={deleteUser}
        onManagePlan={handleManagePlan}
        onManageEnterpriseLimits={handleManageEnterpriseLimits}
      />

      {/* Plan Management Modal */}
      {selectedUser && (
        <PlanManagementModal
          user={selectedUser}
          isOpen={showPlanModal}
          onClose={() => {
            setShowPlanModal(false);
            setSelectedUser(null);
          }}
          onUpdatePlan={handleUpdatePlan}
          onStartTrial={handleStartTrial}
        />
      )}
    </div>
  );
}
