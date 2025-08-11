import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Clock, MessageSquare, Users, FileText, ExternalLink, Linkedin, Instagram, Twitter } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Landing/Navbar'
import Footer from '../components/Landing/Footer'

const SOCIALS = [
  { name: "LinkedIn", href: "https://linkedin.com/company/kyroo", icon: Linkedin },
  { name: "Instagram", href: "https://instagram.com/kyroo", icon: Instagram },
  { name: "X (Twitter)", href: "https://x.com/kyroo", icon: Twitter },
]

const USEFUL_LINKS = [
  { name: "Documentazione", href: "/docs", icon: FileText, description: "Guide complete per iniziare" },
  { name: "Community", href: "/community", icon: Users, description: "Unisciti alla community" },
  { name: "Blog", href: "/blog", icon: MessageSquare, description: "News e aggiornamenti" },
  { name: "Status", href: "https://status.kyroo.io", icon: ExternalLink, description: "Stato dei servizi" },
]

export default function ContactsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* SEO */}
      <title>Contatti – Kyroo</title>
      <meta name="description" content="Contatta il team Kyroo per supporto, partnership o informazioni sulla piattaforma di orchestrazione IA." />
      
      {/* JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Kyroo",
          "url": "https://kyroo.io",
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer support",
            "email": "support@kyroo.io",
            "availableLanguage": ["Italian", "English"]
          }
        })}
      </script>

      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Contattaci
            </h1>
            <p className="text-xl text-foreground-secondary mb-8 leading-relaxed">
              Siamo qui per aiutarti. Scegli il canale più adatto alle tue esigenze.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Support Card */}
            <motion.div
              className="card-elevated text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-accent-violet to-accent-cyan rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="text-white" size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Supporto Tecnico</h3>
              <p className="text-foreground-secondary mb-6">
                Hai problemi tecnici o domande sull'utilizzo della piattaforma?
              </p>
              <div className="space-y-4">
                <a
                  href="mailto:support@kyroo.io?subject=Richiesta%20supporto%20Kyroo"
                  className="flex items-center justify-center gap-3 p-3 bg-surface hover:bg-surface-elevated border border-border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent-violet focus:ring-offset-2 focus:ring-offset-surface-elevated"
                  aria-label="Invia email al supporto tecnico"
                >
                  <Mail size={20} />
                  <span>support@kyroo.io</span>
                </a>
                <div className="flex items-center justify-center gap-2 text-sm text-foreground-secondary">
                  <Clock size={16} />
                  <span>Risposta entro 24h</span>
                </div>
              </div>
            </motion.div>

            {/* Business Card */}
            <motion.div
              className="card-elevated text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-accent-cyan to-accent-violet rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="text-white" size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Partnership & Business</h3>
              <p className="text-foreground-secondary mb-6">
                Interessato a partnership, integrazioni o piani enterprise?
              </p>
              <div className="space-y-4">
                <a
                  href="mailto:business@kyroo.io?subject=Partnership%20Kyroo"
                  className="flex items-center justify-center gap-3 p-3 bg-surface hover:bg-surface-elevated border border-border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-surface-elevated"
                  aria-label="Invia email per partnership"
                >
                  <Mail size={20} />
                  <span>business@kyroo.io</span>
                </a>
                <div className="flex items-center justify-center gap-2 text-sm text-foreground-secondary">
                  <Clock size={16} />
                  <span>Risposta entro 48h</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Links */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4">Seguici sui Social</h2>
            <p className="text-foreground-secondary text-lg">
              Resta aggiornato su novità, tips e community
            </p>
          </motion.div>

          <div className="flex justify-center gap-6">
            {SOCIALS.map((social, index) => (
              <motion.a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-16 h-16 bg-surface hover:bg-surface-elevated border border-border rounded-2xl flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-accent-violet focus:ring-offset-2 focus:ring-offset-background"
                aria-label={`Seguici su ${social.name}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <social.icon size={24} className="text-foreground-secondary" />
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Useful Links */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4">Link Utili</h2>
            <p className="text-foreground-secondary text-lg">
              Risorse per iniziare e approfondire
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {USEFUL_LINKS.map((link, index) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link
                  to={link.href}
                  className="card group hover:bg-surface-elevated transition-colors focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-background block"
                  aria-label={`Vai a ${link.name}: ${link.description}`}
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-accent-violet to-accent-cyan rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <link.icon className="text-white" size={20} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-accent-violet transition-colors">
                      {link.name}
                    </h3>
                    <p className="text-foreground-secondary text-sm">
                      {link.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Office Info */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="card max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-accent-violet to-accent-cyan rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MapPin className="text-white" size={24} />
            </div>
            <h3 className="text-2xl font-bold mb-4">Sede Legale</h3>
            <p className="text-foreground-secondary mb-4">
              [Indirizzo da definire]<br />
              [Città, CAP]<br />
              Italia
            </p>
            <p className="text-sm text-foreground-secondary">
              P.IVA: [Da definire]
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}