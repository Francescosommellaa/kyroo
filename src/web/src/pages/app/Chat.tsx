import { motion } from 'framer-motion'
import { Bot, Zap } from 'lucide-react'
import AppShell from '../../components/AppShell'

export default function Chat() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Chat</h1>
            <p className="text-foreground-secondary">
              Interagisci con i modelli AI attraverso il router intelligente
            </p>
          </div>

          {/* Model Router Peek */}
          <motion.div
            className="card-elevated mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-violet to-accent-cyan rounded-lg flex items-center justify-center">
                <Bot className="text-white" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Model Router Peek</h3>
                <p className="text-sm text-foreground-secondary">Anteprima del routing intelligente</p>
              </div>
            </div>

            <div className="bg-surface rounded-lg p-4 border border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground-secondary">Stato Router</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-foreground-secondary">Attivo</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground">GPT-4</span>
                  <span className="text-xs text-accent-cyan">Disponibile</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground">Claude-3</span>
                  <span className="text-xs text-accent-cyan">Disponibile</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground">Gemini Pro</span>
                  <span className="text-xs text-accent-cyan">Disponibile</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border">
                <div className="flex items-center space-x-2 text-xs text-foreground-secondary">
                  <Zap size={14} />
                  <span>Routing automatico basato su contesto e performance</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Chat Interface Placeholder */}
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-surface-elevated rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="text-accent-violet" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Interfaccia Chat
              </h3>
              <p className="text-foreground-secondary">
                L'interfaccia di chat verrà implementata nei prossimi step
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </AppShell>
  )
}