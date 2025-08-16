import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Menu, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/auth'
import { AuthModal } from '../AuthModal'

const RESOURCES = [
  { name: "Blog", href: "/blog", description: "News e aggiornamenti" },
  { name: "Support & Docs", href: "/docs", description: "Guide e documentazione" },
  { name: "Community", href: "/community", description: "Forum e discussioni" },
]

export default function Navbar() {
  const [isResourcesOpen, setIsResourcesOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'register' }>({ 
    isOpen: false, 
    mode: 'login' 
  })
  const { user } = useAuth()

  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthModal({ isOpen: true, mode })
  }

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, mode: 'login' })
  }

  return (
    <>
    <motion.nav 
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="container mx-auto container-padding">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div 
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <img 
                src="/kyroo-logo.svg" 
                alt="KYROO Logo" 
                className="w-10 h-10"
              />
              <span className="text-2xl font-bold text-foreground tracking-tight">KYROO</span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-12">
            <Link 
              to="/" 
              className="text-foreground-secondary hover:text-foreground transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-background rounded-lg px-3 py-2"
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
                className="flex items-center space-x-1 text-foreground-secondary hover:text-foreground transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-background rounded-lg px-3 py-2"
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
                    className="absolute top-full left-0 mt-3 w-72 bg-surface-elevated/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl py-3"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  >
                    {RESOURCES.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="block px-6 py-4 hover:bg-surface-elevated/80 transition-all duration-200 focus:outline-none focus:bg-surface-elevated/80 rounded-xl mx-2"
                      >
                        <div className="font-semibold text-foreground mb-1">{item.name}</div>
                        <div className="text-sm text-foreground-secondary leading-relaxed">{item.description}</div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link 
              to="/contacts" 
              className="text-foreground-secondary hover:text-foreground transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-background rounded-lg px-3 py-2"
            >
              Contact
            </Link>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <Link to="/app/chat">
                <motion.button 
                  className="btn-primary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Dashboard
                </motion.button>
              </Link>
            ) : (
              <>
                <motion.button 
                  onClick={() => openAuthModal('login')}
                  className="btn-secondary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Login
                </motion.button>
                <motion.button 
                  onClick={() => openAuthModal('register')}
                  className="btn-primary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Inizia Gratis
                </motion.button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-3 text-foreground-secondary hover:text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-background rounded-xl"
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
              className="md:hidden border-t border-border/50 glass-soft"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="py-6 space-y-2">
                <Link 
                  to="/" 
                  className="block px-6 py-3 text-foreground-secondary hover:text-foreground transition-all duration-200 rounded-xl mx-4 hover:bg-surface/50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                
                {RESOURCES.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block px-6 py-3 text-foreground-secondary hover:text-foreground transition-all duration-200 rounded-xl mx-4 hover:bg-surface/50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                
                <Link 
                  to="/contacts" 
                  className="block px-6 py-3 text-foreground-secondary hover:text-foreground transition-all duration-200 rounded-xl mx-4 hover:bg-surface/50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </Link>
                
                <div className="px-6 pt-6 space-y-4 border-t border-border/50 mt-6">
                  {user ? (
                    <Link to="/app/chat" className="block">
                      <button 
                        className="btn-primary w-full"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Dashboard
                      </button>
                    </Link>
                  ) : (
                    <>
                      <button 
                        onClick={() => {
                          openAuthModal('login')
                          setIsMobileMenuOpen(false)
                        }}
                        className="btn-secondary w-full"
                      >
                        Login
                      </button>
                      <button 
                        onClick={() => {
                          openAuthModal('register')
                          setIsMobileMenuOpen(false)
                        }}
                        className="btn-primary w-full"
                      >
                        Inizia Gratis
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
    
    {/* Modal renderizzato fuori dalla navbar */}
    <AuthModal 
      isOpen={authModal.isOpen} 
      onClose={closeAuthModal}
      defaultMode={authModal.mode}
    />
    </>
  )
}