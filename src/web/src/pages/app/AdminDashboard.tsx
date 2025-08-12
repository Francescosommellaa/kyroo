import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Shield, 
  Trash2, 
  UserCheck, 
  UserX, 
  Search,
  Filter,
  AlertTriangle,
  CreditCard,
  Star,
  Check
} from 'lucide-react'
import AppShell from '../../components/AppShell'
import PlanManagementModal from '../../components/PlanManagementModal'
import { useAuth } from '../../contexts/AuthContext'
import type { PlanType } from '../../../shared/plans'

interface User {
  id: string
  display_name: string | null
  phone: string | null
  avatar_url: string | null
  role: 'user' | 'admin'
  plan: PlanType
  plan_expires_at: string | null
  trial_start_date: string | null
  trial_used: boolean
  created_at: string
  updated_at: string
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all')
  const [planFilter, setPlanFilter] = useState<'all' | PlanType>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [planModalOpen, setPlanModalOpen] = useState(false)
  const { session } = useAuth()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/.netlify/functions/admin', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to load users')
      }

      const data = await response.json()
      setUsers(data.users || [])
    } catch (err) {
      setError('Errore nel caricamento degli utenti')
      console.error('Error loading users:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      setActionLoading(userId)
      const response = await fetch('/.netlify/functions/admin', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'update_user_role',
          userId,
          role: newRole
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update user role')
      }

      // Reload users
      await loadUsers()
    } catch (err) {
      setError('Errore nell\'aggiornamento del ruolo')
      console.error('Error updating user role:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo utente? Questa azione non può essere annullata.')) {
      return
    }

    try {
      setActionLoading(userId)
      const response = await fetch(`/.netlify/functions/admin?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete user')
      }

      // Reload users
      await loadUsers()
    } catch (err) {
      setError('Errore nell\'eliminazione dell\'utente')
      console.error('Error deleting user:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesPlan = planFilter === 'all' || user.plan === planFilter
    
    return matchesSearch && matchesRole && matchesPlan
  })

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-accent-violet border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-violet to-accent-cyan rounded-2xl flex items-center justify-center">
                <Shield className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-foreground-secondary">Gestisci utenti e permessi del sistema</p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3">
              <AlertTriangle size={20} />
              {error}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              className="card-elevated"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground-secondary text-sm">Totale Utenti</p>
                  <p className="text-3xl font-bold text-foreground">{users.length}</p>
                </div>
                <div className="w-12 h-12 bg-accent-violet/10 rounded-xl flex items-center justify-center">
                  <Users className="text-accent-violet" size={24} />
                </div>
              </div>
            </motion.div>

            <motion.div
              className="card-elevated"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground-secondary text-sm">Amministratori</p>
                  <p className="text-3xl font-bold text-foreground">
                    {users.filter(u => u.role === 'admin').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent-cyan/10 rounded-xl flex items-center justify-center">
                  <Shield className="text-accent-cyan" size={24} />
                </div>
              </div>
            </motion.div>

            <motion.div
              className="card-elevated"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground-secondary text-sm">Utenti Standard</p>
                  <p className="text-3xl font-bold text-foreground">
                    {users.filter(u => u.role === 'user').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <UserCheck className="text-green-500" size={24} />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Filters */}
          <motion.div
            className="card-elevated mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary" size={18} />
                <input
                  type="text"
                  placeholder="Cerca per nome o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-foreground-secondary focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent"
                />
              </div>

              {/* Role Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary" size={18} />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="pl-10 pr-8 py-3 bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="all">Tutti i ruoli</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>

              {/* Plan Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary" size={18} />
                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value as PlanType | 'all')}
                  className="pl-10 pr-8 py-3 bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="all">Tutti i piani</option>
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Users Table */}
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
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Utente</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Ruolo</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Piano</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Creato</th>
                    <th className="text-right py-4 px-6 font-semibold text-foreground">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      className="border-b border-border hover:bg-surface/50 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-accent-violet to-accent-cyan rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {user.display_name?.charAt(0)?.toUpperCase() || 'U'}
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
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-accent-violet/10 text-accent-violet' 
                            : 'bg-green-500/10 text-green-500'
                        }`}>
                          {user.role === 'admin' ? (
                            <>
                              <Shield size={12} className="mr-1" />
                              Admin
                            </>
                          ) : (
                            <>
                              <UserCheck size={12} className="mr-1" />
                              User
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <PlanBadge planType={user.plan} isTrialPro={user.plan === 'pro' && user.trial_start_date !== null && user.plan_expires_at !== null && new Date(user.plan_expires_at) > new Date()} />
                      </td>
                      <td className="py-4 px-6 text-foreground-secondary">
                        {new Date(user.created_at).toLocaleDateString("it-IT")}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          {/* Manage Plan */}
                          <motion.button
                            onClick={() => {
                              setSelectedUser(user);
                              setPlanModalOpen(true);
                            }}
                            className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-surface-elevated"
                            title="Gestisci Piano"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <CreditCard size={16} />
                          </motion.button>

                          {/* Manage Enterprise Limits */}
                          {user.plan === 'enterprise' && (
                            <motion.button
                              onClick={() => navigate(`/app/admin/enterprise-limits/${user.id}`)}
                              className="p-2 text-yellow-500 hover:bg-yellow-500/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-surface-elevated"
                              title="Gestisci Limiti Enterprise"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Settings size={16} />
                            </motion.button>
                          )}

                          {/* Toggle Role */}
                          <motion.button
                            onClick={() => updateUserRole(user.id, user.role === 'admin' ? 'user' : 'admin')}
                            disabled={actionLoading === user.id}
                            className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-elevated ${
                              user.role === 'admin'
                                ? 'text-orange-500 hover:bg-orange-500/10 focus:ring-orange-500'
                                : 'text-accent-violet hover:bg-accent-violet/10 focus:ring-accent-violet'
                            }`}
                            title={user.role === 'admin' ? 'Rimuovi admin' : 'Rendi admin'}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {actionLoading === user.id ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : user.role === 'admin' ? (
                              <UserX size={16} />
                            ) : (
                              <UserCheck size={16} />
                            )}
                          </motion.button>

                          {/* Delete User */}
                          <motion.button
                            onClick={() => deleteUser(user.id)}
                            disabled={actionLoading === user.id}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-surface-elevated"
                            title="Elimina utente"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {actionLoading === user.id ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="mx-auto text-foreground-secondary mb-4" size={48} />
                  <p className="text-foreground-secondary">
                    {searchTerm || roleFilter !== 'all' 
                      ? 'Nessun utente trovato con i filtri applicati' 
                      : 'Nessun utente trovato'
                    }
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </AppShell>
  )
}