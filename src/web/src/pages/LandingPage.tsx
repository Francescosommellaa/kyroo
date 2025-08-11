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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [isYearly, setIsYearly] = useState(false)
  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const getPricingPlans = (yearly: boolean) => [
    {
      name: "Free",
      price: "€0",
      period: "/mese",
      features: ["5 workflow al mese", "Modelli base", "Support community", "Dashboard basic", "Cronologia 30 giorni"],
      cta: "Inizia Gratis",
      popular: false
    },
    {
      name: "Pro",
      price: yearly ? "€182" : "€19",
      period: yearly ? "/anno" : "/mese",
      originalPrice: yearly ? "€228/anno" : undefined,
      savings: yearly ? "Risparmia 20%" : undefined,
      features: ["Workflow illimitati", "Tutti i modelli AI", "Support prioritario", "Analytics avanzate", "Integrazioni premium", "Cronologia estesa"],
      cta: "Prova Pro",
      popular: true
    },
    {
      name: "Enterprise",
      price: yearly ? "€374" : "€39",
      period: yearly ? "/anno" : "/mese",
      originalPrice: yearly ? "€468/anno" : undefined,
      savings: yearly ? "Risparmia 20%" : undefined,
      features: ["Tutto di Pro", "Team illimitati", "Onboarding dedicato", "Custom integrations", "SLA garantito", "Support 24/7"],
      cta: "Contatta Sales",
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-accent-violet to-accent-cyan bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              KYROO
            </motion.h1>
            <motion.p 
              className="text-xl lg:text-2xl text-foreground-secondary mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Super IA Orchestrator
            </motion.p>
            <motion.p 
              className="text-lg text-foreground-secondary mb-12 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Orchestrazione intelligente di modelli AI, automazione avanzata e integrazione seamless per trasformare il tuo workflow aziendale.
            </motion.p>
            <motion.button
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-accent-violet hover:bg-accent-violet/90 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent-violet focus:ring-offset-2 focus:ring-offset-background"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Inizia Ora
              <ArrowRight size={20} />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Cosa fa Section */}
      <section className="py-20 bg-surface">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Cosa fa KYROO
            </h2>
            <p className="text-foreground-secondary text-lg max-w-2xl mx-auto">
              Una piattaforma completa per orchestrare intelligenza artificiale e automazione aziendale
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                className="card text-center group hover:bg-surface-elevated transition-colors"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-accent-violet to-accent-cyan rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-foreground-secondary">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Pricing Semplice
            </h2>
            <p className="text-foreground-secondary text-lg">
              Scegli il piano perfetto per le tue esigenze
            </p>
          </motion.div>

          {/* Billing Toggle */}
          <motion.div
            className="flex items-center justify-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center space-x-4 bg-surface rounded-lg p-1">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  !isYearly 
                    ? 'bg-accent-violet text-white shadow-sm' 
                    : 'text-foreground-secondary hover:text-foreground'
                }`}
              >
                Mensile
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-6 py-2 rounded-md font-medium transition-all relative ${
                  isYearly 
                    ? 'bg-accent-violet text-white shadow-sm' 
                    : 'text-foreground-secondary hover:text-foreground'
                }`}
              >
                Annuale
                <span className="absolute -top-2 -right-2 bg-accent-cyan text-white text-xs px-2 py-1 rounded-full">
                  -20%
                </span>
              </button>
            </div>
          </motion.div>

<div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
  {getPricingPlans(isYearly).map((plan, index) => (
    <motion.div
      key={plan.name}
      className={`card-elevated relative flex flex-col ${plan.popular ? 'ring-2 ring-accent-violet' : ''}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-accent-violet text-white px-4 py-1 rounded-full text-sm font-medium">
            Più Popolare
          </span>
        </div>
      )}

      <div className="text-center flex flex-col h-full">
        <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
        <div className="mb-4">
          <span className="text-4xl font-bold">{plan.price}</span>
          <span className="text-foreground-secondary">{plan.period}</span>
        </div>

        {plan.savings && (
          <div className="mb-6 text-sm">
            <span className="text-foreground-secondary">invece di </span>
            <span className="text-foreground-secondary line-through">{plan.originalPrice}</span>
            <span className="text-accent-cyan font-medium ml-2">{plan.savings}</span>
          </div>
        )}

        <ul className="space-y-3 mb-8 flex-grow">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-center gap-3">
              <Check className="text-accent-cyan flex-shrink-0" size={16} />
              <span className="text-foreground-secondary">{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto">
          <motion.button
            onClick={() => setIsAuthModalOpen(true)}
            className={`w-full py-3 px-6 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-elevated ${
              plan.popular
                ? 'bg-accent-violet hover:bg-accent-violet/90 text-white focus:ring-accent-violet'
                : 'bg-surface hover:bg-surface-elevated border border-border text-foreground focus:ring-accent-cyan'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {plan.cta}
          </motion.button>
        </div>
      </div>
    </motion.div>
  ))}
</div>

        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-surface">
  const [isYearly, setIsYearly] = useState(false)
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Domande Frequenti
            </h2>
            <p className="text-foreground-secondary text-lg">
              Tutto quello che devi sapere su KYROO
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
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
                className="card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left flex items-center justify-between p-0 focus:outline-none rounded-lg"
                  aria-expanded={openFaq === index}
                >
                  <h3 className="text-lg font-semibold pr-4">{faq.question}</h3>
                  {openFaq === index ? (
                    <ChevronUp className="text-accent-violet flex-shrink-0" size={20} />
                  ) : (
                    <ChevronDown className="text-foreground-secondary flex-shrink-0" size={20} />
                  )}
                </button>
                
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="text-foreground-secondary mt-4 leading-relaxed">
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
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  )
}