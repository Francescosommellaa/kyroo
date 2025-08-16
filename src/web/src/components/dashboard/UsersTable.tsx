import { motion } from 'framer-motion';
import {
  Users,
  Shield,
  UserCheck,
  UserX,
  Trash2,
  CreditCard,
  Settings
} from 'lucide-react';
import PlanBadge from '../PlanBadge';
import type { UsersTableProps } from './dashboard-types';
import { getUserInitials, formatDate, isUserOnTrial, getRoleInfo } from './dashboard-utils';

export default function UsersTable({
  users,
  filteredUsers,
  actionLoading,
  onUpdateUserRole,
  onDeleteUser,
  onManagePlan,
  onManageEnterpriseLimits
}: UsersTableProps) {
  const handleRoleToggle = async (userId: string, currentRole: 'user' | 'admin') => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    await onUpdateUserRole(userId, newRole);
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      !confirm(
        'Sei sicuro di voler eliminare questo utente? Questa azione non può essere annullata.'
      )
    ) {
      return;
    }
    await onDeleteUser(userId);
  };

  if (filteredUsers.length === 0 && users.length > 0) {
    return (
      <motion.div
        className="card-elevated overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="text-center py-12">
          <Users className="mx-auto text-foreground-secondary mb-4" size={48} />
          <p className="text-foreground-secondary">
            Nessun utente trovato con i filtri applicati
          </p>
        </div>
      </motion.div>
    );
  }

  if (users.length === 0) {
    return (
      <motion.div
        className="card-elevated overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="text-center py-12">
          <Users className="mx-auto text-foreground-secondary mb-4" size={48} />
          <p className="text-foreground-secondary">Nessun utente trovato</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="card-elevated overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface border-b border-border">
            <tr>
              <th className="text-left py-4 px-6 font-semibold text-foreground">
                Utente
              </th>
              <th className="text-left py-4 px-6 font-semibold text-foreground">
                Ruolo
              </th>
              <th className="text-left py-4 px-6 font-semibold text-foreground">
                Piano
              </th>
              <th className="text-left py-4 px-6 font-semibold text-foreground">
                Creato
              </th>
              <th className="text-right py-4 px-6 font-semibold text-foreground">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => {
              const roleInfo = getRoleInfo(user.role);
              const isOnTrial = isUserOnTrial(user);
              const userInitials = getUserInitials(user);
              const isLoading = actionLoading === user.id;

              return (
                <motion.tr
                  key={user.id}
                  className="border-b border-border hover:bg-surface/50 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  {/* User Info */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-accent-violet to-accent-cyan rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {userInitials}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {user.display_name || 'Unnamed User'}
                        </p>
                        <p className="text-sm text-foreground-secondary font-mono">
                          {user.id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${roleInfo.className}`}>
                      {user.role === 'admin' ? (
                        <>
                          <Shield size={12} className="mr-1" />
                          {roleInfo.label}
                        </>
                      ) : (
                        <>
                          <UserCheck size={12} className="mr-1" />
                          {roleInfo.label}
                        </>
                      )}
                    </span>
                  </td>

                  {/* Plan */}
                  <td className="py-4 px-6">
                    <PlanBadge planType={user.plan} isTrialPro={isOnTrial} />
                  </td>

                  {/* Created Date */}
                  <td className="py-4 px-6 text-foreground-secondary">
                    {formatDate(user.created_at)}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2">
                      {/* Manage Plan */}
                      <motion.button
                        onClick={() => onManagePlan(user)}
                        className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-surface-elevated"
                        title="Gestisci Piano"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        disabled={isLoading}
                      >
                        <CreditCard size={16} />
                      </motion.button>

                      {/* Manage Enterprise Limits */}
                      {user.plan === 'enterprise' && (
                        <motion.button
                          onClick={() => onManageEnterpriseLimits(user.id)}
                          className="p-2 text-yellow-500 hover:bg-yellow-500/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-surface-elevated"
                          title="Gestisci Limiti Enterprise"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          disabled={isLoading}
                        >
                          <Settings size={16} />
                        </motion.button>
                      )}

                      {/* Toggle Role */}
                      <motion.button
                        onClick={() => handleRoleToggle(user.id, user.role)}
                        disabled={isLoading}
                        className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-elevated ${
                          user.role === 'admin'
                            ? 'text-orange-500 hover:bg-orange-500/10 focus:ring-orange-500'
                            : 'text-accent-violet hover:bg-accent-violet/10 focus:ring-accent-violet'
                        }`}
                        title={user.role === 'admin' ? 'Rimuovi admin' : 'Rendi admin'}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : user.role === 'admin' ? (
                          <UserX size={16} />
                        ) : (
                          <UserCheck size={16} />
                        )}
                      </motion.button>

                      {/* Delete User */}
                      <motion.button
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={isLoading}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-surface-elevated"
                        title="Elimina utente"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}