import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Star, Shield, ChevronUp, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Landing/Navbar';
import Footer from '../components/Landing/Footer';
import { PLAN_CONFIGS, formatLimit } from '@kyroo/shared/plans';
import type { PlanType } from '@kyroo/shared/plans';

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const planOrder: PlanType[] = ['free', 'pro', 'enterprise'];
  
  const planIcons = {
    free: Check,
    pro: Star,
    enterprise: Shield,
  };

  const planColors = {
    free: 'from-gray-500 to-gray-600',
    pro: 'from-accent-violet to-accent-cyan',
    enterprise: 'from-yellow-500 to-orange-500',
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      {/* Header */}
      <section className="pt-32 pb-16 section-padding">
        <div className="container mx-auto container-padding">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link 
              to="/"
              className="inline-flex items-center text-accent-violet hover:text-accent-cyan transition-colors mb-8"
            >
              <ArrowLeft size={20} className="mr-2" />
              Torna alla Home
            </Link>
            
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 text-gradient">
              Piani e Prezzi
            </h1>
            <p className="text-xl text-foreground-secondary mb-12 leading-relaxed">
              Scegli il piano perfetto per le tue esigenze. Inizia gratis e scala quando necessario.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center mb-16">
              <div className="bg-surface rounded-full p-1 flex items-center">
                <button
                  onClick={() => setIsYearly(false)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    !isYearly 
                      ? 'bg-accent-violet text-white shadow-lg' 
                      : 'text-foreground-secondary hover:text-foreground'
                  }`}
                >
                  Mensile
                </button>
                <button
                  onClick={() => setIsYearly(true)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    isYearly 
                      ? 'bg-accent-violet text-white shadow-lg' 
                      : 'text-foreground-secondary hover:text-foreground'
                  }`}
                >
                  Annuale
                  <span className="ml-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    -20%
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24 section-padding">
        <div className="container mx-auto container-padding">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {planOrder.map((planType, index) => {
              const plan = PLAN_CONFIGS[planType];
              const Icon = planIcons[planType];
              const gradientColor = planColors[planType];
              const isPro = planType === 'pro';
              const isEnterprise = planType === 'enterprise';
              
              return (
                <motion.div
                  key={planType}
                  className={`
                    relative bg-card border border-border rounded-2xl p-8
                    ${isPro ? 'ring-2 ring-accent-violet ring-opacity-50 scale-105' : ''}
                    hover:shadow-xl transition-all duration-300
                  `}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {/* Popular badge for Pro */}
                  {isPro && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-accent-violet to-accent-cyan text-white px-6 py-2 rounded-full text-sm font-medium">
                        Più Popolare
                      </div>
                    </div>
                  )}

                  {/* Plan header */}
                  <div className="text-center mb-8">
                    <div className={`w-20 h-20 bg-gradient-to-br ${gradientColor} rounded-full flex items-center justify-center mx-auto mb-6`}>
                      <Icon className="text-white" size={32} />
                    </div>
                    
                    <h3 className="text-3xl font-bold text-foreground mb-2">
                      {plan.displayName}
                    </h3>
                    
                    <p className="text-foreground-secondary mb-6">
                      {plan.tagline}
                    </p>

                    {/* Pricing */}
                    <div className="mb-8">
                      {isEnterprise ? (
                        <div className="text-foreground">
                          <div className="text-4xl font-bold mb-2">Personalizzato</div>
                          <div className="text-foreground-secondary">Contattaci per un preventivo</div>
                        </div>
                      ) : (
                        <div className="text-foreground">
                          <div className="text-5xl font-bold mb-2">
                            €{isYearly ? plan.price.yearly : plan.price.monthly}
                            {planType !== 'free' && (
                              <span className="text-xl font-normal text-foreground-secondary">
                                /{isYearly ? 'anno' : 'mese'}
                              </span>
                            )}
                          </div>
                          {planType !== 'free' && isYearly && (
                            <div className="text-sm text-green-600">
                              Risparmia €{(plan.price.monthly * 12) - plan.price.yearly} all'anno
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    <h4 className="font-semibold text-foreground mb-4">Caratteristiche principali:</h4>
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start space-x-3">
                        <Check className="text-green-500 mt-1 flex-shrink-0" size={16} />
                        <span className="text-foreground-secondary text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Detailed Limits */}
                  <div className="bg-background rounded-xl p-6 mb-8">
                    <h4 className="font-semibold text-foreground mb-4">Limiti dettagliati:</h4>
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-foreground-secondary">Workspace massimi:</span>
                        <span className="text-foreground font-medium">
                          {formatLimit(plan.limits.maxWorkspaces)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-foreground-secondary">Utenti per workspace:</span>
                        <span className="text-foreground font-medium">
                          {formatLimit(plan.limits.maxUsersPerWorkspace)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-foreground-secondary">Collaboratori per workspace:</span>
                        <span className="text-foreground font-medium">
                          {formatLimit(plan.limits.maxCollaboratorsPerWorkspace)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-foreground-secondary">Token chat massimi:</span>
                        <span className="text-foreground font-medium">
                          {formatLimit(plan.limits.maxChatInputTokens)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-foreground-secondary">Ricerche web/giorno:</span>
                        <span className="text-foreground font-medium">
                          {formatLimit(plan.limits.maxWebSearchesPerDay)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-foreground-secondary">File/mese:</span>
                        <span className="text-foreground font-medium">
                          {formatLimit(plan.limits.maxFilesPerMonth)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-foreground-secondary">Dimensione file max:</span>
                        <span className="text-foreground font-medium">
                          {formatLimit(plan.limits.maxFileSizeMB)} MB
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-foreground-secondary">Web-Agent run/mese:</span>
                        <span className="text-foreground font-medium">
                          {formatLimit(plan.limits.maxWebAgentRunsPerMonth)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-foreground-secondary">Workflow attivi/workspace:</span>
                        <span className="text-foreground font-medium">
                          {formatLimit(plan.limits.maxActiveWorkflowsPerWorkspace)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-foreground-secondary">Esecuzioni workflow/giorno:</span>
                        <span className="text-foreground font-medium">
                          {formatLimit(plan.limits.maxWorkflowExecutionsPerDay)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-foreground-secondary">Knowledge Base:</span>
                        <span className="text-foreground font-medium">
                          {formatLimit(plan.limits.maxKnowledgeBaseSizeGB)} GB
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-foreground-secondary">Retention dati:</span>
                        <span className="text-foreground font-medium">
                          {formatLimit(plan.limits.dataRetentionDays)} giorni
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    className={`
                      w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200
                      ${isPro
                        ? 'bg-gradient-to-r from-accent-violet to-accent-cyan text-white hover:shadow-xl hover:scale-105'
                        : isEnterprise
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-xl hover:scale-105'
                          : 'bg-foreground text-background hover:bg-foreground-secondary'
                      }
                    `}
                  >
                    {plan.cta}
                  </button>

                  {/* Trial info for Pro */}
                  {isPro && (
                    <div className="text-center mt-4">
                      <p className="text-sm text-foreground-secondary">
                        ✨ Prova gratuita di 7 giorni • Nessuna carta richiesta
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 section-padding bg-surface/30">
        <div className="container mx-auto container-padding">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Domande Frequenti
            </h2>
            <p className="text-xl text-foreground-secondary">
              Tutto quello che devi sapere sui nostri piani
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                question: "Posso cambiare piano in qualsiasi momento?",
                answer: "Sì, puoi fare upgrade o downgrade del tuo piano in qualsiasi momento. Le modifiche avranno effetto immediato e il billing sarà proporzionale."
              },
              {
                question: "Cosa succede se supero i limiti del mio piano?",
                answer: "Ti invieremo notifiche quando ti avvicini ai limiti. Se li superi, alcune funzionalità potrebbero essere temporaneamente limitate fino al rinnovo del ciclo o all'upgrade del piano."
              },
              {
                question: "Il piano Enterprise include supporto personalizzato?",
                answer: "Sì, il piano Enterprise include supporto dedicato 24/7, onboarding personalizzato e la possibilità di configurare limiti custom per le tue esigenze specifiche."
              },
              {
                question: "Posso provare il piano Pro gratuitamente?",
                answer: "Assolutamente! Offriamo una prova gratuita di 7 giorni del piano Pro senza richiedere carta di credito. Potrai accedere a tutte le funzionalità premium."
              },
              {
                question: "I dati sono sicuri e privati?",
                answer: "La sicurezza è la nostra priorità. Tutti i dati sono crittografati, rispettiamo il GDPR e non condividiamo mai le tue informazioni con terze parti."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                className="bg-card border border-border rounded-xl overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-surface/50 transition-colors"
                >
                  <span className="font-semibold text-foreground">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="text-accent-violet" size={20} />
                  ) : (
                    <ChevronDown className="text-foreground-secondary" size={20} />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-foreground-secondary leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

