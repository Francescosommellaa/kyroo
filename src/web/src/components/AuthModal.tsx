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
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-background/60 backdrop-blur-xl"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-lg glass-strong border border-border/50 rounded-3xl p-10 shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-3 text-foreground-secondary hover:text-foreground transition-all duration-200 rounded-2xl hover:bg-surface/50 focus:outline-none focus:ring-2 focus:ring-accent-violet focus:ring-offset-2 focus:ring-offset-surface-elevated"
              aria-label="Chiudi modal"
            >
              <X size={24} />
            </button>

            <div className="text-center">
              <div className="mb-10">
                <div className="w-20 h-20 bg-gradient-to-br from-accent-violet to-accent-cyan rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <span className="text-white font-bold text-3xl">K</span>
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-4 tracking-tight">
                  Accedi a KYROO
                </h2>
                <p className="text-foreground-secondary text-lg font-light">
                  {demo ? 'Modalità demo attiva' : 'Scegli come accedere'}
                </p>
              </div>

              <div className="space-y-4">
                {demo && (
                  <motion.button
                    onClick={handleDemoLogin}
                    className="w-full bg-gradient-to-r from-accent-violet to-accent-cyan hover:from-accent-violet/90 hover:to-accent-cyan/90 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent-violet focus:ring-offset-4 focus:ring-offset-surface-elevated shadow-lg hover:shadow-xl hover:scale-105"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Accedi Demo
                  </motion.button>
                )}

                <motion.button
                  onClick={handleRegister}
                  className="w-full glass hover:glass-strong text-foreground px-8 py-4 rounded-2xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-4 focus:ring-offset-surface-elevated hover:scale-105"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Registrati
                </motion.button>
              </div>

              <p className="text-sm text-foreground-secondary mt-8 font-light">
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