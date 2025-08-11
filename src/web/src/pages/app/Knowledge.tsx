import { motion } from 'framer-motion'
import { Brain, Database } from 'lucide-react'
import AppShell from '../../components/AppShell'

export default function Knowledge() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Knowledge</h1>
            <p className="text-foreground-secondary">
              Gestisci la knowledge base e i sistemi RAG per i tuoi modelli AI
            </p>
          </div>

          <motion.div
            className="card text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-accent-violet to-accent-cyan rounded-full flex items-center justify-center mx-auto mb-4">
              <Database className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Knowledge Base
            </h3>
            <p className="text-foreground-secondary">
              Organizza documenti, embeddings e retrieval per contesto intelligente
            </p>
          </motion.div>
        </motion.div>
      </div>
    </AppShell>
  )
}