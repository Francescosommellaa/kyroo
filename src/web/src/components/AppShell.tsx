import { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  MessageSquare, 
  Calendar, 
  Play, 
  Brain, 
  Download, 
  CreditCard, 
  User, 
  LogOut 
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface AppShellProps {
  children: ReactNode
}

const navItems = [
  { path: '/app/chat', label: 'Chat', icon: MessageSquare },
  { path: '/app/planner', label: 'Planner', icon: Calendar },
  { path: '/app/executions', label: 'Executions', icon: Play },
  { path: '/app/knowledge', label: 'Knowledge', icon: Brain },
  { path: '/app/ingestion', label: 'Ingestion', icon: Download },
  { path: '/app/billing', label: 'Billing', icon: CreditCard },
  { path: '/app/account', label: 'Account', icon: User },
]

export default function AppShell({ children }: AppShellProps) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <motion.aside 
        className="w-64 bg-surface border-r border-border flex flex-col"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-violet to-accent-cyan rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">KYROO</h1>
              <p className="text-xs text-foreground-secondary">Super IA Orchestrator</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent-violet focus:ring-offset-2 focus:ring-offset-surface ${
                      isActive
                        ? 'bg-accent-violet text-white'
                        : 'text-foreground-secondary hover:text-foreground hover:bg-surface-elevated'
                    }`
                  }
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-border">
          <motion.button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-foreground-secondary hover:text-foreground hover:bg-surface-elevated rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-surface"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </motion.button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <motion.div
          className="p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}