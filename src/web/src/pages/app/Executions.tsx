import { motion } from 'framer-motion'
import { Play, Activity } from 'lucide-react'
import AppShell from '../../components/AppShell'

export default function Executions() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Executions</h1>
            <p className="text-foreground-secondary">
              Monitora e gestisci le esecuzioni dei tuoi workflow in tempo reale
            </p>
          </div>

          <motion.div
            className="card text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-accent-violet to-accent-cyan rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Execution Monitor
            </h3>
            <p className="text-foreground-secondary">
              Dashboard in tempo reale per tracking e debugging dei workflow
            </p>
          </motion.div>
        </motion.div>
      </div>
    </AppShell>
  )
}