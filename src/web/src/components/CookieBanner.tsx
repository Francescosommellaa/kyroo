import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X, Settings } from 'lucide-react'

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState({
    essential: true, // sempre true, non modificabile
    analytics: false,
    marketing: false,
    functional: false
  })

  useEffect(() => {
    // Controlla se l'utente ha già fatto una scelta
    const cookieConsent = localStorage.getItem('kyroo-cookie-consent')
    if (!cookieConsent) {
      setIsVisible(true)
    }
  }, [])

  const handleAcceptAll = () => {
    const consent = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('kyroo-cookie-consent', JSON.stringify(consent))
    setIsVisible(false)
  }

  const handleAcceptEssential = () => {
    const consent = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('kyroo-cookie-consent', JSON.stringify(consent))
    setIsVisible(false)
  }

  const handleSavePreferences = () => {
    const consent = {
      ...preferences,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('kyroo-cookie-consent', JSON.stringify(consent))
    setIsVisible(false)
    setShowSettings(false)
  }

  const handlePreferenceChange = (key: keyof typeof preferences) => {
    if (key === 'essential') return // Non permettere di disabilitare i cookie essenziali
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 bg-surface-elevated border-t border-border shadow-2xl"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="container mx-auto px-4 py-6">
          {!showSettings ? (
            // Banner principale
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-violet to-accent-cyan rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Cookie className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Utilizziamo i cookie
                  </h3>
                  <p className="text-foreground-secondary text-sm leading-relaxed">
                    Utilizziamo cookie essenziali per il funzionamento del sito e, con il tuo consenso, 
                    cookie per analytics e marketing per migliorare la tua esperienza. Puoi gestire le 
                    tue preferenze in qualsiasi momento.
                  </p>
                  <p className="text-xs text-foreground-secondary mt-2">
                    Continuando la navigazione accetti la nostra{' '}
                    <a href="/privacy" className="text-accent-cyan hover:underline">
                      Privacy Policy
                    </a>
                    .
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <motion.button
                  onClick={() => setShowSettings(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-surface hover:bg-surface-elevated border border-border text-foreground rounded-lg font-medium transition-colors text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Settings size={16} />
                  Personalizza
                </motion.button>
                
                <motion.button
                  onClick={handleAcceptEssential}
                  className="px-4 py-2 bg-surface hover:bg-surface-elevated border border-border text-foreground rounded-lg font-medium transition-colors text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Solo Essenziali
                </motion.button>
                
                <motion.button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 bg-accent-violet hover:bg-accent-violet/90 text-white rounded-lg font-medium transition-colors text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Accetta Tutti
                </motion.button>
              </div>
            </div>
          ) : (
            // Pannello impostazioni
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  Preferenze Cookie
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 text-foreground-secondary hover:text-foreground transition-colors rounded-lg hover:bg-surface"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid gap-4">
                {/* Cookie Essenziali */}
                <div className="flex items-start justify-between p-4 bg-surface rounded-lg border border-border">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground mb-1">Cookie Essenziali</h4>
                    <p className="text-sm text-foreground-secondary">
                      Necessari per il funzionamento base del sito (autenticazione, sicurezza, preferenze).
                    </p>
                  </div>
                  <div className="ml-4">
                    <div className="w-12 h-6 bg-accent-violet rounded-full flex items-center justify-end px-1">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Cookie Analytics */}
                <div className="flex items-start justify-between p-4 bg-surface rounded-lg border border-border">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground mb-1">Cookie Analytics</h4>
                    <p className="text-sm text-foreground-secondary">
                      Ci aiutano a capire come utilizzi il sito per migliorare l'esperienza utente.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => handlePreferenceChange('analytics')}
                      className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                        preferences.analytics 
                          ? 'bg-accent-violet justify-end' 
                          : 'bg-border justify-start'
                      } px-1`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </button>
                  </div>
                </div>

                {/* Cookie Marketing */}
                <div className="flex items-start justify-between p-4 bg-surface rounded-lg border border-border">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground mb-1">Cookie Marketing</h4>
                    <p className="text-sm text-foreground-secondary">
                      Utilizzati per mostrarti contenuti e pubblicità personalizzati.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => handlePreferenceChange('marketing')}
                      className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                        preferences.marketing 
                          ? 'bg-accent-violet justify-end' 
                          : 'bg-border justify-start'
                      } px-1`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </button>
                  </div>
                </div>

                {/* Cookie Funzionali */}
                <div className="flex items-start justify-between p-4 bg-surface rounded-lg border border-border">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground mb-1">Cookie Funzionali</h4>
                    <p className="text-sm text-foreground-secondary">
                      Abilitano funzionalità avanzate come chat, integrazioni e personalizzazioni.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => handlePreferenceChange('functional')}
                      className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                        preferences.functional 
                          ? 'bg-accent-violet justify-end' 
                          : 'bg-border justify-start'
                      } px-1`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
                <motion.button
                  onClick={handleAcceptEssential}
                  className="px-4 py-2 bg-surface hover:bg-surface-elevated border border-border text-foreground rounded-lg font-medium transition-colors text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Solo Essenziali
                </motion.button>
                
                <motion.button
                  onClick={handleSavePreferences}
                  className="px-4 py-2 bg-accent-violet hover:bg-accent-violet/90 text-white rounded-lg font-medium transition-colors text-sm flex-1 sm:flex-none"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Salva Preferenze
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}