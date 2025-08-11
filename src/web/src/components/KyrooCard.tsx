import { motion } from 'framer-motion'

const KyrooCard = () => {
  return (
    <motion.div
      className="card-elevated group cursor-pointer"
      whileHover={{ 
        scale: 1.02,
        y: -4,
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="relative overflow-hidden">
        {/* Gradient overlay animato */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-accent-violet/10 to-accent-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={false}
        />
        
        {/* Icona KYROO */}
        <div className="relative z-10">
          <div className="flex items-center justify-center mb-6">
            <motion.div 
              className="w-16 h-16 bg-gradient-to-br from-accent-violet to-accent-cyan rounded-2xl flex items-center justify-center shadow-lg"
              whileHover={{ rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <span className="text-white font-bold text-2xl">K</span>
            </motion.div>
          </div>

          <div className="text-center">
            <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-accent-violet transition-colors">
              KYROO Platform
            </h3>
            <p className="text-foreground-secondary mb-6 leading-relaxed">
              Gestione intelligente dei processi aziendali con automazione avanzata e analytics in tempo reale.
            </p>
            
            <div className="space-y-3 mb-6">
              <FeatureItem text="Dashboard Analytics" />
              <FeatureItem text="Workflow Automation" />
              <FeatureItem text="Real-time Monitoring" />
            </div>

            <motion.button 
              className="btn-primary w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Esplora Platform
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const FeatureItem = ({ text }: { text: string }) => {
  return (
    <div className="flex items-center space-x-3">
      <div className="w-2 h-2 bg-accent-cyan rounded-full flex-shrink-0" />
      <span className="text-foreground-secondary text-sm">{text}</span>
    </div>
  )
}

export default KyrooCard