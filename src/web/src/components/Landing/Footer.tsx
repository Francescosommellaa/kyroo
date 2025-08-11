import { Link } from 'react-router-dom'
import { Mail, Linkedin, Instagram, Twitter } from 'lucide-react'

const FOOTER_LINKS = {
  product: [
    { name: "Features", href: "/#features" },
    { name: "Pricing", href: "/#pricing" },
    { name: "FAQ", href: "/#faq" },
  ],
  resources: [
    { name: "Blog", href: "/blog" },
    { name: "Documentazione", href: "/docs" },
    { name: "Community", href: "/community" },
    { name: "Status", href: "https://status.kyroo.io" },
  ],
  company: [
    { name: "About", href: "/about" },
    { name: "Contatti", href: "/contacts" },
    { name: "Careers", href: "/careers" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Termini di Servizio", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
  ]
}

const SOCIALS = [
  { name: "LinkedIn", href: "https://linkedin.com/company/kyroo", icon: Linkedin },
  { name: "Instagram", href: "https://instagram.com/kyroo", icon: Instagram },
  { name: "X (Twitter)", href: "https://x.com/kyroo", icon: Twitter },
]

export default function Footer() {
  return (
    <footer className="glass-soft border-t border-border/50">
      <div className="container mx-auto container-padding py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-12 mb-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <img 
                src="/kyroo-logo.svg" 
                alt="KYROO Logo" 
                className="w-12 h-12 shadow-lg rounded-2xl"
              />
              <span className="text-2xl font-bold text-foreground tracking-tight">KYROO</span>
            </div>
            <p className="text-foreground-secondary mb-8 max-w-sm font-light leading-relaxed text-lg">
              Super IA Orchestrator per automazione intelligente e gestione workflow aziendali.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-8">
              <a 
                href="mailto:support@kyroo.io" 
                className="flex items-center gap-3 text-foreground-secondary hover:text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-surface rounded-lg p-2 hover:bg-surface/50"
              >
                <Mail size={18} />
                <span className="font-light">support@kyroo.io</span>
              </a>
            </div>

            {/* Social Links */}
            <div className="flex gap-4">
              {SOCIALS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 glass hover:glass-strong rounded-2xl flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent-violet focus:ring-offset-2 focus:ring-offset-surface hover:scale-110 shadow-lg"
                  aria-label={`Seguici su ${social.name}`}
                >
                  <social.icon size={18} className="text-foreground-secondary" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-bold text-foreground mb-6 text-lg tracking-tight">Prodotto</h3>
            <ul className="space-y-4">
              {FOOTER_LINKS.product.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-foreground-secondary hover:text-foreground transition-all duration-200 font-light focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-surface rounded-lg p-1 hover:bg-surface/30"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-bold text-foreground mb-6 text-lg tracking-tight">Risorse</h3>
            <ul className="space-y-4">
              {FOOTER_LINKS.resources.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-foreground-secondary hover:text-foreground transition-all duration-200 font-light focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-surface rounded-lg p-1 hover:bg-surface/30"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-bold text-foreground mb-6 text-lg tracking-tight">Azienda</h3>
            <ul className="space-y-4">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-foreground-secondary hover:text-foreground transition-all duration-200 font-light focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-surface rounded-lg p-1 hover:bg-surface/30"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-bold text-foreground mb-6 text-lg tracking-tight">Legale</h3>
            <ul className="space-y-4">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-foreground-secondary hover:text-foreground transition-all duration-200 font-light focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-surface rounded-lg p-1 hover:bg-surface/30"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-border/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-foreground-secondary font-light">
              © 2024 KYROO. Tutti i diritti riservati.
            </p>
            <div className="flex items-center gap-8 text-foreground-secondary font-light">
              <span>Made with ❤️ in Italy</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}