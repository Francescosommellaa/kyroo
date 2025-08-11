import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    // TODO: Gestire callback Supabase nello Step 2
    // Per ora redirect alla home dopo 2 secondi
    const timer = setTimeout(() => {
      navigate('/')
    }, 2000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <img 
          src="/kyroo-logo.svg" 
          alt="KYROO Logo" 
         className="w-16 h-16 mx-auto mb-6"
        />
        
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Elaborazione autenticazione...
        </h1>
        
        <p className="text-foreground-secondary mb-8">
          Ti stiamo reindirizzando, attendi un momento.
        </p>
        
        <div className="flex justify-center">
          <motion.div
            className="w-8 h-8 border-4 border-accent-violet border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </motion.div>
    </div>
  )
}