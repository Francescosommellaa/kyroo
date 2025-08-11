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
    <footer className="bg-surface border-t border-border">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-8">
          {/* Brand Column */}
          <div className="col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-accent-violet to-accent-cyan rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="text-xl font-bold text-foreground">KYROO</span>
            </div>
            <p className="text-foreground-secondary mb-6 max-w-sm">
              Super IA Orchestrator per automazione intelligente e gestione workflow aziendali.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 mb-6">
              <a 
                href="mailto:support@kyroo.io" 
                className="flex items-center gap-2 text-foreground-secondary hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-surface rounded"
              >
                <Mail size={16} />
                <span className="text-sm">support@kyroo.io</span>
              </a>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {SOCIALS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-surface-elevated hover:bg-background border border-border rounded-lg flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-accent-violet focus:ring-offset-2 focus:ring-offset-surface"
                  aria-label={`Seguici su ${social.name}`}
                >
                  <social.icon size={16} className="text-foreground-secondary" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Prodotto</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.product.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-foreground-secondary hover:text-foreground transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-surface rounded"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Risorse</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.resources.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-foreground-secondary hover:text-foreground transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-surface rounded"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Azienda</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-foreground-secondary hover:text-foreground transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-surface rounded"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Legale</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-foreground-secondary hover:text-foreground transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-surface rounded"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-foreground-secondary text-sm">
              © 2024 KYROO. Tutti i diritti riservati.
            </p>
            <div className="flex items-center gap-6 text-sm text-foreground-secondary">
              <span>Made with ❤️ in Italy</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}