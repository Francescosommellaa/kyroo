import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, 
  Zap, 
  Network, 
  Calendar, 
  Brain,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import AuthModal from '../components/AuthModal'
import Navbar from '../components/Landing/Navbar'
import Footer from '../components/Landing/Footer'

export default function LandingPage() {
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'register' }>({ 
    isOpen: false, 
    mode: 'register' 
  })
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [isYearly, setIsYearly] = useState(false)

  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthModal({ isOpen: true, mode })
  }

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, mode: 'register' })
  }

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const getPricingPlans = (yearly: boolean) => [
    {
      name: "Free",
      price: "€0",
      period: "/mese",
      features: [
        "3 workspace",
        "5 utenti totali",
        "10 ricerche web/giorno",
        "20 file/mese",
        "Support community"
      ],
      cta: "Inizia Gratis",
      popular: false
    },
    {
      name: "Pro",
      price: yearly ? "€96" : "€12",
      period: yearly ? "/anno" : "/mese",
      originalPrice: yearly ? "€144/anno" : undefined,
      savings: yearly ? "Risparmia 33%" : undefined,
      features: [
        "10 workspace",
        "50 utenti totali",
        "100 ricerche web/giorno",
        "200 file/mese",
        "Support prioritario",
        "Prova gratuita 7 giorni"
      ],
      cta: "Prova Pro",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Personalizzato",
      period: "",
      features: [
        "Workspace illimitati",
        "Utenti illimitati",
        "Limiti personalizzabili",
        "Support dedicato 24/7",
        "SLA garantito",
        "Onboarding dedicato"
      ],
      cta: "Contatta Sales",
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 section-padding">
        <div className="container mx-auto container-padding">
          <motion.div
            className="text-center max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <motion.h1 
              className="text-6xl lg:text-8xl font-bold mb-8 text-gradient tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
            >
              KYROO
            </motion.h1>
            <motion.p 
              className="text-2xl lg:text-3xl text-foreground-secondary mb-12 font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
            >
              Super IA Orchestrator
            </motion.p>
            <motion.p 
              className="text-xl text-foreground-secondary mb-16 max-w-3xl mx-auto leading-relaxed font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 }}
            >
              Orchestrazione intelligente di modelli AI, automazione avanzata e integrazione seamless per trasformare il tuo workflow aziendale.
            </motion.p>
            <motion.button
              onClick={() => openAuthModal('register')}
              className="bg-gradient-to-r from-accent-violet to-accent-cyan hover:from-accent-violet/90 hover:to-accent-cyan/90 text-white px-12 py-5 rounded-2xl font-semibold text-xl transition-all duration-300 inline-flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-accent-violet focus:ring-offset-4 focus:ring-offset-background shadow-2xl hover:shadow-accent-violet/25 hover:scale-105 active:scale-95"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.4 }}
            >
              Inizia Ora
              <ArrowRight size={24} />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Cosa fa Section */}
      <section className="section-padding bg-gradient-to-b from-background to-surface/50">
        <div className="container mx-auto container-padding">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
              Cosa fa KYROO
            </h2>
            <p className="text-foreground-secondary text-xl max-w-3xl mx-auto font-light leading-relaxed">
              Una piattaforma completa per orchestrare intelligenza artificiale e automazione aziendale
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              {
                icon: Network,
                title: "Routing Modelli",
                description: "Instradamento intelligente tra diversi modelli AI per ottimizzare performance e costi"
              },
              {
                icon: Brain,
                title: "Piani & DAG",
                description: "Creazione e gestione di workflow complessi con grafi aciclici diretti"
              },
              {
                icon: Calendar,
                title: "Tools Integrati",
                description: "Connessioni native con web, email, calendar e sistemi RAG per automazione completa"
              },
              {
                icon: Zap,
                title: "Consenso Intelligente",
                description: "Sistema di approvazione automatica con controlli di sicurezza e governance"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="card text-center group hover-lift"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 100, damping: 20, delay: index * 0.1 }}
              >
                <div className="w-20 h-20 bg-gradient-to-br from-accent-violet to-accent-cyan rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-accent-violet/25">
                  <feature.icon className="text-white" size={28} />
                </div>
                <h3 className="text-2xl font-semibold mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-foreground-secondary leading-relaxed font-light">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="section-padding">
        <div className="container mx-auto container-padding">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
              Pricing Semplice
            </h2>
            <p className="text-foreground-secondary text-xl font-light">
              Scegli il piano perfetto per le tue esigenze
            </p>
          </motion.div>

          {/* Billing Toggle */}
          <motion.div
            className="flex items-center justify-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
          >
            <div className="flex items-center space-x-2 glass rounded-2xl p-2">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                  !isYearly 
                    ? 'bg-gradient-to-r from-accent-violet to-accent-cyan text-white shadow-lg' 
                    : 'text-foreground-secondary hover:text-foreground'
                }`}
              >
                Mensile
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 relative ${
                  isYearly 
                    ? 'bg-gradient-to-r from-accent-violet to-accent-cyan text-white shadow-lg' 
                    : 'text-foreground-secondary hover:text-foreground'
                }`}
              >
                Annuale
                <span className="absolute -top-3 -right-3 bg-gradient-to-r from-accent-cyan to-accent-violet text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg">
                  -20%
                </span>
              </button>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {getPricingPlans(isYearly).map((plan, index) => (
              <motion.div
                key={index}
                className={`card-elevated relative flex flex-col hover-lift ${plan.popular ? 'ring-2 ring-accent-violet shadow-2xl shadow-accent-violet/20' : ''}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 100, damping: 20, delay: index * 0.1 }}
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-accent-violet to-accent-cyan text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      Più Popolare
                    </span>
                  </div>
                )}
                
                <div className="text-center flex flex-col h-full">
                  <h3 className="text-2xl font-bold mb-4 tracking-tight">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-5xl font-bold tracking-tight">{plan.price}</span>
                    <span className="text-foreground-secondary text-lg font-light">{plan.period}</span>
                  </div>
                  
                  {plan.savings && (
                    <div className="mb-8 text-sm">
                      <span className="text-foreground-secondary">invece di </span>
                      <span className="text-foreground-secondary line-through">{plan.originalPrice}</span>
                      <span className="text-accent-cyan font-bold ml-2">{plan.savings}</span>
                    </div>
                  )}
                  
                  <ul className="space-y-4 mb-10 flex-grow">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-4">
                        <Check className="text-accent-cyan flex-shrink-0" size={18} />
                        <span className="text-foreground-secondary font-light">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-auto">
                    <motion.button
                      onClick={() => openAuthModal(plan.name === 'Free' ? 'register' : 'register')}
                      className={`w-full py-4 px-8 rounded-2xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-offset-surface-elevated shadow-lg hover:shadow-xl ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-accent-violet to-accent-cyan hover:from-accent-violet/90 hover:to-accent-cyan/90 text-white focus:ring-accent-violet hover:scale-105' 
                          : 'glass-strong hover:glass text-foreground focus:ring-accent-cyan hover:scale-105'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      {plan.cta}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Compare Plans Button */}
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 }}
          >
            <motion.button
              onClick={() => window.open('/pricing', '_blank')}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-accent-violet/10 to-accent-cyan/10 border border-accent-violet/20 rounded-2xl text-accent-violet hover:text-accent-cyan transition-all duration-300 hover:shadow-lg hover:scale-105 font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Zap className="mr-2" size={20} />
              Confronta tutti i piani e limiti
              <ArrowRight className="ml-2" size={20} />
            </motion.button>
            <p className="text-foreground-secondary text-sm mt-3">
              Visualizza tutti i dettagli, limiti e funzionalità di ogni piano
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding bg-gradient-to-b from-surface/50 to-background">
        <div className="container mx-auto container-padding">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
              Domande Frequenti
            </h2>
            <p className="text-foreground-secondary text-xl font-light">
              Tutto quello che devi sapere su KYROO
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-6">
            {[
              {
                question: "Come funziona l'orchestrazione dei modelli AI?",
                answer: "KYROO analizza automaticamente le tue richieste e instrada le query al modello più appropriato, ottimizzando costi e performance. Supporta GPT, Claude, Gemini e modelli custom."
              },
              {
                question: "Posso integrare i miei sistemi esistenti?",
                answer: "Sì, KYROO offre API REST, webhook e connettori nativi per CRM, ERP, email, calendar e database. Supportiamo anche integrazioni custom tramite il nostro SDK."
              },
              {
                question: "Come funziona il sistema di consenso?",
                answer: "Il sistema di consenso intelligente analizza automaticamente le azioni proposte dall'AI e richiede approvazione umana solo per operazioni critiche, basandosi su regole configurabili."
              },
              {
                question: "Quali sono i limiti del piano gratuito?",
                answer: "Il piano gratuito include 5 workflow al mese, accesso ai modelli base e support community. Perfetto per testare la piattaforma e piccoli progetti."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                className="card hover:glass-strong transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 100, damping: 20, delay: index * 0.1 }}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left flex items-center justify-between p-0 focus:outline-none rounded-2xl"
                  aria-expanded={openFaq === index}
                >
                  <h3 className="text-xl font-semibold pr-6 tracking-tight">{faq.question}</h3>
                  {openFaq === index ? (
                    <ChevronUp className="text-accent-violet flex-shrink-0" size={24} />
                  ) : (
                    <ChevronDown className="text-foreground-secondary flex-shrink-0" size={24} />
                  )}
                </button>
                
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 30 }}
                      className="overflow-hidden"
                    >
                      <p className="text-foreground-secondary mt-6 leading-relaxed font-light text-lg">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      <AuthModal 
        isOpen={authModal.isOpen} 
        onClose={closeAuthModal}
        defaultMode={authModal.mode}
      />
    </div>
  )
}