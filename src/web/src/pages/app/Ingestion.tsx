import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'
import AppShell from '../../components/AppShell'

export default function Ingestion() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Ingestion</h1>
            <p className="text-foreground-secondary">
              Importa e processa dati da diverse fonti per alimentare la knowledge base
            </p>
          </div>

          <motion.div
            className="card text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-accent-violet to-accent-cyan rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Data Ingestion
            </h3>
            <p className="text-foreground-secondary">
              Pipeline automatiche per documenti, web scraping e API integrations
            </p>
          </motion.div>
        </motion.div>
      </div>
    </AppShell>
  )
}