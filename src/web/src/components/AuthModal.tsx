import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { demo, loginDemo } = useAuth()
  const navigate = useNavigate()

  const handleDemoLogin = () => {
    loginDemo()
    navigate('/app/chat')
    onClose()
  }

  const handleRegister = () => {
    alert('La registrazione verrà attivata nello Step 2')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md bg-surface-elevated border border-border rounded-xl p-6 shadow-xl"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-foreground-secondary hover:text-foreground transition-colors rounded-lg hover:bg-surface focus:outline-none focus:ring-2 focus:ring-accent-violet focus:ring-offset-2 focus:ring-offset-surface-elevated"
              aria-label="Chiudi modal"
            >
              <X size={20} />
            </button>

            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-accent-violet to-accent-cyan rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">K</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Accedi a KYROO
                </h2>
                <p className="text-foreground-secondary">
                  {demo ? 'Modalità demo attiva' : 'Scegli come accedere'}
                </p>
              </div>

              <div className="space-y-3">
                {demo && (
                  <motion.button
                    onClick={handleDemoLogin}
                    className="w-full bg-accent-violet hover:bg-accent-violet/90 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-violet focus:ring-offset-2 focus:ring-offset-surface-elevated"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Accedi Demo
                  </motion.button>
                )}

                <motion.button
                  onClick={handleRegister}
                  className="w-full bg-surface hover:bg-surface-elevated border border-border text-foreground px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-surface-elevated"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Registrati
                </motion.button>
              </div>

              <p className="text-xs text-foreground-secondary mt-4">
                Continuando accetti i nostri{' '}
                <a href="#" className="text-accent-cyan hover:underline">
                  Termini di Servizio
                </a>{' '}
                e{' '}
                <a href="#" className="text-accent-cyan hover:underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}