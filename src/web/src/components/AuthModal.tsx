import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultMode?: AuthMode
}

type AuthMode = 'login' | 'register' | 'reset'

export default function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(defaultMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const { signIn, signUp, resetPassword } = useAuth()
  const navigate = useNavigate()

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setDisplayName('')
    setError('')
    setMessage('')
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  // Reset form when modal opens with new mode
  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode)
      resetForm()
    }
  }, [isOpen, defaultMode])

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode)
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setError('Email richiesta')
      return
    }
    
    if (mode !== 'reset' && !password.trim()) {
      setError('Password richiesta')
      return
    }
    
    if (mode === 'register') {
      if (!displayName.trim()) {
        setError('Nome visualizzato richiesto')
        return
      }
      if (password !== confirmPassword) {
        setError('Le password non corrispondono')
        return
      }
      if (password.length < 6) {
        setError('La password deve essere di almeno 6 caratteri')
        return
      }
    }
    
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password)
        if (error) {
          setError(error.message)
        } else {
          onClose()
          navigate('/app/chat')
        }
      } else if (mode === 'register') {
        const { error } = await signUp(email, password, displayName)
        if (error) {
          setError(error.message)
        } else {
          setMessage('Controlla la tua email per confermare la registrazione')
        }
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email)
        if (error) {
          setError(error.message)
        } else {
          setMessage('Controlla la tua email per le istruzioni di reset')
        }
      }
    } catch (err) {
      setError('Si è verificato un errore imprevisto')
    } finally {
      setLoading(false)
    }
  }

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Accedi a KYROO'
      case 'register': return 'Registrati su KYROO'
      case 'reset': return 'Reset Password'
    }
  }

  const getButtonText = () => {
    switch (mode) {
      case 'login': return 'Accedi'
      case 'register': return 'Registrati'
      case 'reset': return 'Invia Reset'
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{ zIndex: 9999 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/95 backdrop-blur-xl"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-md bg-surface-elevated/98 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-2xl z-10 mx-auto my-auto"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-foreground-secondary hover:text-foreground transition-all duration-200 rounded-xl hover:bg-surface/50 focus:outline-none focus:ring-2 focus:ring-accent-violet focus:ring-offset-2 focus:ring-offset-surface-elevated"
            aria-label="Chiudi modal"
          >
            <X size={20} />
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-violet to-accent-cyan rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white font-bold text-xl">K</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2 tracking-tight">
              {getTitle()}
            </h2>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}
          
          {message && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Display Name (solo per registrazione) */}
            {mode === 'register' && (
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-foreground mb-2">
                  Nome visualizzato
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary" size={18} />
                  <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-foreground-secondary focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent transition-all duration-200"
                    placeholder="Il tuo nome"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary" size={18} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-foreground-secondary focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent transition-all duration-200"
                  placeholder="la-tua-email@esempio.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password (non per reset) */}
            {mode !== 'reset' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary" size={18} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-12 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-foreground-secondary focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent transition-all duration-200"
                    placeholder={mode === 'register' ? 'Almeno 6 caratteri' : 'La tua password'}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password (solo per registrazione) */}
            {mode === 'register' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                  Conferma Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary" size={18} />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-12 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-foreground-secondary focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent transition-all duration-200"
                    placeholder="Ripeti la password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-accent-violet to-accent-cyan hover:from-accent-violet/90 hover:to-accent-cyan/90 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent-violet focus:ring-offset-2 focus:ring-offset-surface-elevated shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading && <Loader2 className="animate-spin" size={18} />}
              {getButtonText()}
            </motion.button>
          </form>

          {/* Mode switching */}
          <div className="mt-8 text-center space-y-3">
            {mode === 'login' && (
              <>
                <button
                  onClick={() => handleModeChange('register')}
                  className="text-accent-cyan hover:underline text-sm"
                >
                  Non hai un account? Registrati
                </button>
                <br />
                <button
                  onClick={() => handleModeChange('reset')}
                  className="text-foreground-secondary hover:text-foreground text-sm"
                >
                  Password dimenticata?
                </button>
              </>
            )}
            
            {mode === 'register' && (
              <button
                onClick={() => handleModeChange('login')}
                className="text-accent-cyan hover:underline text-sm"
              >
                Hai già un account? Accedi
              </button>
            )}
            
            {mode === 'reset' && (
              <button
                onClick={() => handleModeChange('login')}
                className="text-accent-cyan hover:underline text-sm"
              >
                Torna al login
              </button>
            )}
          </div>

          <p className="text-xs text-foreground-secondary mt-6 text-center">
            Continuando accetti i nostri{' '}
            <a href="/terms" className="text-accent-cyan hover:underline">
              Termini di Servizio
            </a>{' '}
            e{' '}
            <a href="/privacy" className="text-accent-cyan hover:underline">
              Privacy Policy
            </a>
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}