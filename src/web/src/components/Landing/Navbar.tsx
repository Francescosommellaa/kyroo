import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Menu, X } from 'lucide-react'
import { Link } from 'react-router-dom'

const RESOURCES = [
  { name: "Blog", href: "/blog", description: "News e aggiornamenti" },
  { name: "Support & Docs", href: "/docs", description: "Guide e documentazione" },
  { name: "Community", href: "/community", description: "Forum e discussioni" },
]

export default function Navbar() {
  const [isResourcesOpen, setIsResourcesOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <motion.nav 
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
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
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-foreground-secondary hover:text-foreground transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-background rounded"
            >
              Home
            </Link>
            
            {/* Resources Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setIsResourcesOpen(true)}
              onMouseLeave={() => setIsResourcesOpen(false)}
            >
              <button 
                className="flex items-center space-x-1 text-foreground-secondary hover:text-foreground transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-background rounded px-2 py-1"
                aria-expanded={isResourcesOpen}
                aria-haspopup="true"
              >
                <span>Resources</span>
                <ChevronDown 
                  size={16} 
                  className={`transition-transform ${isResourcesOpen ? 'rotate-180' : ''}`} 
                />
              </button>
              
              <AnimatePresence>
                {isResourcesOpen && (
                  <motion.div
                    className="absolute top-full left-0 mt-2 w-64 bg-surface-elevated border border-border rounded-lg shadow-xl py-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {RESOURCES.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="block px-4 py-3 hover:bg-surface transition-colors focus:outline-none focus:bg-surface"
                      >
                        <div className="font-medium text-foreground">{item.name}</div>
                        <div className="text-sm text-foreground-secondary">{item.description}</div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link 
              to="/contacts" 
              className="text-foreground-secondary hover:text-foreground transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-background rounded"
            >
              Contact
            </Link>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center space-x-4">
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
              Inizia Gratis
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground-secondary hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-background rounded"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="md:hidden border-t border-border bg-background"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="py-4 space-y-4">
                <Link 
                  to="/" 
                  className="block px-4 py-2 text-foreground-secondary hover:text-foreground transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                
                {RESOURCES.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block px-4 py-2 text-foreground-secondary hover:text-foreground transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                
                <Link 
                  to="/contacts" 
                  className="block px-4 py-2 text-foreground-secondary hover:text-foreground transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </Link>
                
                <div className="px-4 pt-4 space-y-3 border-t border-border">
                  <button className="btn-secondary w-full">
                    Login
                  </button>
                  <button className="btn-primary w-full">
                    Inizia Gratis
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}