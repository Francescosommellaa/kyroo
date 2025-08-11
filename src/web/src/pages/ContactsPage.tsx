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
      <section className="pt-32 section-padding">
        <div className="container mx-auto container-padding">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <h1 className="text-5xl lg:text-6xl font-bold mb-8 tracking-tight">
              Contattaci
            </h1>
            <p className="text-2xl text-foreground-secondary mb-12 leading-relaxed font-light">
              Siamo qui per aiutarti. Scegli il canale più adatto alle tue esigenze.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="section-padding">
        <div className="container mx-auto container-padding">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Support Card */}
            <motion.div
              className="card-elevated text-center hover-lift"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-accent-violet to-accent-cyan rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <MessageSquare className="text-white" size={28} />
              </div>
              <h3 className="text-3xl font-bold mb-6 tracking-tight">Supporto Tecnico</h3>
              <p className="text-foreground-secondary mb-8 font-light leading-relaxed text-lg">
                Hai problemi tecnici o domande sull'utilizzo della piattaforma?
              </p>
              <div className="space-y-6">
                <a
                  href="mailto:support@kyroo.io?subject=Richiesta%20supporto%20Kyroo"
                  className="flex items-center justify-center gap-4 p-4 glass hover:glass-strong rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent-violet focus:ring-offset-4 focus:ring-offset-surface-elevated hover:scale-105 shadow-lg"
                  aria-label="Invia email al supporto tecnico"
                >
                  <Mail size={22} />
                  <span className="font-medium">support@kyroo.io</span>
                </a>
                <div className="flex items-center justify-center gap-3 text-foreground-secondary font-light">
                  <Clock size={18} />
                  <span>Risposta entro 24h</span>
                </div>
              </div>
            </motion.div>

            {/* Business Card */}
            <motion.div
              className="card-elevated text-center hover-lift"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-accent-cyan to-accent-violet rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <Users className="text-white" size={28} />
              </div>
              <h3 className="text-3xl font-bold mb-6 tracking-tight">Partnership & Business</h3>
              <p className="text-foreground-secondary mb-8 font-light leading-relaxed text-lg">
                Interessato a partnership, integrazioni o piani enterprise?
              </p>
              <div className="space-y-6">
                <a
                  href="mailto:business@kyroo.io?subject=Partnership%20Kyroo"
                  className="flex items-center justify-center gap-4 p-4 glass hover:glass-strong rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-4 focus:ring-offset-surface-elevated hover:scale-105 shadow-lg"
                  aria-label="Invia email per partnership"
                >
                  <Mail size={22} />
                  <span className="font-medium">business@kyroo.io</span>
                </a>
                <div className="flex items-center justify-center gap-3 text-foreground-secondary font-light">
                  <Clock size={18} />
                  <span>Risposta entro 48h</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Links */}
      <section className="section-padding bg-gradient-to-b from-background to-surface/50">
        <div className="container mx-auto container-padding">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <h2 className="text-4xl font-bold mb-6 tracking-tight">Seguici sui Social</h2>
            <p className="text-foreground-secondary text-xl font-light">
              Resta aggiornato su novità, tips e community
            </p>
          </motion.div>

          <div className="flex justify-center gap-8">
            {SOCIALS.map((social, index) => (
              <motion.a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-20 h-20 glass hover:glass-strong rounded-3xl flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent-violet focus:ring-offset-4 focus:ring-offset-background shadow-lg hover:shadow-2xl hover:scale-110"
                aria-label={`Seguici su ${social.name}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 100, damping: 20, delay: index * 0.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <social.icon size={28} className="text-foreground-secondary" />
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Useful Links */}
      <section className="section-padding">
        <div className="container mx-auto container-padding">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <h2 className="text-4xl font-bold mb-6 tracking-tight">Link Utili</h2>
            <p className="text-foreground-secondary text-xl font-light">
              Risorse per iniziare e approfondire
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {USEFUL_LINKS.map((link, index) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 100, damping: 20, delay: index * 0.1 }}
              >
                <Link
                  to={link.href}
                  className="card group hover-lift focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-4 focus:ring-offset-background block"
                  aria-label={`Vai a ${link.name}: ${link.description}`}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-accent-violet to-accent-cyan rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-accent-violet/25">
                      <link.icon className="text-white" size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-accent-violet transition-all duration-300 tracking-tight">
                      {link.name}
                    </h3>
                    <p className="text-foreground-secondary font-light leading-relaxed">
                      {link.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      <Footer />
    </div>
  )
}