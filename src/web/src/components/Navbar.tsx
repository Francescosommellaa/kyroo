import { motion } from 'framer-motion'

const Navbar = () => {
  return (
    <motion.nav 
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-accent-violet to-accent-cyan rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="text-xl font-bold text-foreground">KYROO</span>
          </motion.div>

          <div className="hidden md:flex items-center space-x-8">
            <NavLink href="#home">Home</NavLink>
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#about">About</NavLink>
            <NavLink href="#contact">Contact</NavLink>
          </div>

          <div className="flex items-center space-x-4">
            <motion.button 
              className="btn-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Login
            </motion.button>
            <motion.button 
              className="btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  return (
    <motion.a
      href={href}
      className="text-foreground-secondary hover:text-foreground transition-colors font-medium"
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      {children}
    </motion.a>
  )
}

export default Navbar