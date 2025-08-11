import { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { 
  MessageSquare, 
  Calendar, 
  Play, 
  Brain, 
  Download, 
  CreditCard, 
  User, 
  LogOut,
  Menu,
  X
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const closeSidebar = () => setIsSidebarOpen(false)

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <motion.aside 
        className={`fixed lg:relative w-64 bg-surface border-r border-border flex flex-col z-50 h-screen lg:h-full transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          transform: isSidebarOpen 
            ? 'translateX(0)' 
            : window.innerWidth >= 1024 
              ? 'translateX(0)' 
              : 'translateX(-100%)'
        }}
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
                  onClick={closeSidebar}
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
      <main className="flex-1 overflow-auto lg:ml-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-surface border-b border-border p-4 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-foreground-secondary hover:text-foreground transition-colors rounded-lg hover:bg-surface-elevated"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-accent-violet to-accent-cyan rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="text-lg font-bold text-foreground">KYROO</span>
          </div>
        </div>

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