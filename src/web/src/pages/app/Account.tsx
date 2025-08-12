import { motion } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { 
  User, 
  Mail, 
  Phone, 
  Camera, 
  Save, 
  AlertCircle, 
  CheckCircle,
  Crown,
  CreditCard,
  ArrowRight
} from 'lucide-react'
import AppShell from '../../components/AppShell'
import { useAuth } from '../../contexts/AuthContext'

export default function Account() {
  const { user, profile, updateProfile, uploadAvatar } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    display_name: '',
    phone: '',
    first_name: '',
    last_name: ''
  })

  // Sync form data with profile when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        phone: profile.phone || '',
        first_name: '',
        last_name: ''
      })
    }
  }, [profile])

  // Get user plan from profile
  const userPlan = profile?.plan || 'free'
  
  const planInfo = {
    free: {
      name: 'Free',
      color: 'text-gray-500',
      bgColor: 'bg-gray-500/10',
      icon: User
    },
    pro: {
      name: 'Pro',
      color: 'text-accent-violet',
      bgColor: 'bg-accent-violet/10',
      icon: Crown
    },
    enterprise: {
      name: 'Enterprise',
      color: 'text-accent-cyan',
      bgColor: 'bg-accent-cyan/10',
      icon: Crown
    }
  }

  const currentPlan = planInfo[userPlan as keyof typeof planInfo] || planInfo.free

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Seleziona un file immagine valido' })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'L\'immagine deve essere inferiore a 5MB' })
      return
    }

    try {
      setLoading(true)
      setMessage(null)
      
      const { error } = await uploadAvatar(file)
      
      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: 'Avatar aggiornato con successo!' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Errore durante l\'upload dell\'avatar' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setMessage(null)
      
      const { error } = await updateProfile({
        display_name: formData.display_name.trim() || null,
        phone: formData.phone.trim() || null
      })
      
      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: 'Profilo aggiornato con successo!' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Errore durante l\'aggiornamento del profilo' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Ciao, {profile?.display_name || 'Utente'}!
            </h1>
            <p className="text-foreground-secondary">
              Gestisci il tuo profilo, preferenze e impostazioni di sicurezza
            </p>
          </div>

          {/* Message */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                message.type === 'success' 
                  ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              {message.text}
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Section */}
            <div className="lg:col-span-2">
              <motion.div
                className="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Informazioni Profilo
                  </h2>
                  <p className="text-foreground-secondary text-sm">
                    Aggiorna le tue informazioni personali e di contatto
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div 
                        className="w-20 h-20 rounded-full overflow-hidden cursor-pointer group"
                        onClick={handleAvatarClick}
                      >
                        {profile?.avatar_url ? (
                          <img 
                            src={profile.avatar_url} 
                            alt="Avatar" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-accent-violet to-accent-cyan flex items-center justify-center">
                            <User className="text-white" size={32} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera className="text-white" size={20} />
                        </div>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">Foto Profilo</h3>
                      <p className="text-sm text-foreground-secondary">
                        Clicca per cambiare la tua foto profilo
                      </p>
                      <p className="text-xs text-foreground-secondary mt-1">
                        JPG, PNG o GIF. Max 5MB.
                      </p>
                    </div>
                  </div>

                  {/* Email (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary" size={18} />
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-foreground-secondary cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-foreground-secondary mt-1">
                      L'email non può essere modificata
                    </p>
                  </div>

                  {/* Display Name */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Nome Visualizzato
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary" size={18} />
                      <input
                        type="text"
                        name="display_name"
                        value={formData.display_name}
                        onChange={handleInputChange}
                        placeholder="Come vuoi essere chiamato"
                        className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-foreground-secondary focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Numero di Telefono
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary" size={18} />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+39 123 456 7890"
                        className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-foreground-secondary focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-accent-violet hover:bg-accent-violet/90 disabled:bg-accent-violet/50 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-accent-violet focus:ring-offset-2 focus:ring-offset-background"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save size={20} />
                    )}
                    {loading ? 'Salvando...' : 'Salva Modifiche'}
                  </motion.button>
                </form>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Plan Card */}
              <motion.div
                className="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="mb-4">
                  <h3 className="font-semibold text-foreground mb-2">Piano Attuale</h3>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${currentPlan.bgColor} ${currentPlan.color}`}>
                    <currentPlan.icon size={16} />
                    {currentPlan.name}
                  </div>
                </div>
                
                {userPlan === 'free' && (
                  <div className="p-4 bg-gradient-to-r from-accent-violet/10 to-accent-cyan/10 border border-accent-violet/20 rounded-xl">
                    <h4 className="font-medium text-foreground mb-2">
                      Sblocca tutte le funzionalità
                    </h4>
                    <p className="text-sm text-foreground-secondary mb-3">
                      Passa a Pro per accedere a funzionalità avanzate e limiti più alti
                    </p>
                    <motion.button
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent-violet hover:bg-accent-violet/90 text-white text-sm font-medium rounded-lg transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => window.location.href = '/app/billing'}
                    >
                      <Crown size={16} />
                      Effettua Upgrade
                      <ArrowRight size={16} />
                    </motion.button>
                  </div>
                )}
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                className="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h3 className="font-semibold text-foreground mb-4">Azioni Rapide</h3>
                <div className="space-y-3">
                  <motion.button
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-surface-elevated rounded-lg transition-colors"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => window.location.href = '/app/billing'}
                  >
                    <div className="w-8 h-8 bg-accent-cyan/10 rounded-lg flex items-center justify-center">
                      <CreditCard className="text-accent-cyan" size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Fatturazione</p>
                      <p className="text-xs text-foreground-secondary">Gestisci piano e pagamenti</p>
                    </div>
                  </motion.button>
                </div>
              </motion.div>

              {/* Account Info */}
              <motion.div
                className="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h3 className="font-semibold text-foreground mb-4">Informazioni Account</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-foreground-secondary">Membro da</span>
                    <span className="text-foreground">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('it-IT') : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-secondary">Ruolo</span>
                    <span className={`font-medium ${profile?.role === 'admin' ? 'text-accent-violet' : 'text-foreground'}`}>
                      {profile?.role === 'admin' ? 'Amministratore' : 'Utente'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-secondary">ID Utente</span>
                    <span className="text-foreground font-mono text-xs">
                      {user?.id?.slice(0, 8)}...
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </AppShell>
  )
}

