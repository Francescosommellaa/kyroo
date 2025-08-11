import { motion } from 'framer-motion'
import { ArrowLeft, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-foreground-secondary hover:text-foreground transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Torna alla Home</span>
            </Link>
            
            <div className="flex items-center space-x-2">
              <img 
                src="/kyroo-logo.svg" 
                alt="KYROO Logo" 
                className="w-8 h-8"
              />
              <span className="text-xl font-bold">KYROO</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Title */}
          <div className="text-center mb-12">
            <img 
              src="/kyroo-logo.svg" 
              alt="KYROO Logo" 
              className="w-16 h-16 mx-auto mb-6"
            />
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Termini di Servizio
            </h1>
            <p className="text-foreground-secondary text-lg">
              Ultimo aggiornamento: 11 agosto 2025
            </p>
          </div>

          {/* Content */}
          <div className="card space-y-8">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-accent-violet text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
                Chi siamo
              </h2>
              <div className="text-foreground-secondary leading-relaxed space-y-2">
                <p><strong>Servizio:</strong> "Kyroo" – piattaforma SaaS di orchestrazione IA.</p>
                <p><strong>Titolare del servizio:</strong> [Ragione sociale / Nome progetto] ("Kyroo").</p>
                <p><strong>Sede legale:</strong> [indirizzo].</p>
                <p><strong>Contatti:</strong> <a href="mailto:support@kyroo.io" className="text-accent-cyan hover:underline">support@kyroo.io</a> | <a href="mailto:privacy@kyroo.io" className="text-accent-cyan hover:underline">privacy@kyroo.io</a>.</p>
                <p><strong>Documenti collegati:</strong> Privacy Policy e Cookie Policy (parte integrante dei presenti Termini).</p>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-accent-violet text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                Oggetto del servizio
              </h2>
              <div className="text-foreground-secondary leading-relaxed space-y-3">
                <p>Kyroo consente di:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>rispondere direttamente a richieste semplici (routing di modelli LLM);</li>
                  <li>pianificare ed eseguire richieste complesse tramite To-Do/DAG e strumenti esterni (web, HTTP, email, calendario, RAG su Milvus), con richieste di consenso per azioni irreversibili.</li>
                </ul>
                <p>Funzionalità, limiti e piani sono descritti nella landing e nell'app. Kyroo può aggiornare o modificare le funzionalità senza preavviso, mantenendo compatibilità ragionevole.</p>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-accent-violet text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
                Registrazione e account
              </h2>
              <div className="text-foreground-secondary leading-relaxed space-y-3">
                <p>Per accedere alla dashboard è necessario un account. L'utente deve:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>fornire informazioni veritiere;</li>
                  <li>proteggere le proprie credenziali;</li>
                  <li>essere legalmente capace (≥ 16 anni) e, se agisce per conto terzi, avere le necessarie autorizzazioni.</li>
                </ul>
                <p>Kyroo può sospendere o chiudere account in caso di violazioni (vedi §12).</p>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-accent-violet text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">4</span>
                Piani, prezzi e pagamenti
              </h2>
              <div className="text-foreground-secondary leading-relaxed space-y-3">
                <p><strong>Piani:</strong> Free / Pro Mensile / Pro Annuale (dettagli e limiti indicati in app).</p>
                <p><strong>Pagamenti:</strong> elaborati da Stripe. Kyroo non conserva i numeri di carta.</p>
                <p><strong>Rinnovo:</strong> i piani a pagamento si rinnovano automaticamente fino a disdetta. Puoi disdire in qualsiasi momento; l'accesso Pro resta attivo fino alla fine del periodo pagato.</p>
                <p><strong>Prezzi e tasse:</strong> importi indicati al netto/ivato a seconda della giurisdizione; eventuali imposte (es. IVA) sono applicate da Stripe.</p>
                <p><strong>Rimborsi:</strong> salvo quanto previsto dalla legge applicabile o da politiche indicate in app, i corrispettivi già fatturati non sono rimborsabili. Per consumatori UE si applicano i diritti inderogabili; l'esecuzione immediata del servizio può comportare la perdita del diritto di recesso (Dir. 2011/83/UE).</p>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-accent-violet text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">5</span>
                Uso consentito e limiti (Fair Use)
              </h2>
              <div className="text-foreground-secondary leading-relaxed space-y-3">
                <p>È vietato usare Kyroo per attività illecite, spam, malware, scraping non autorizzato, violazioni IP, profiling proibito, contenuti che violano diritti o norme.</p>
                <p>Kyroo applica limiti tecnici (es. token, tool-calls/min, dimensione file, retention) per garantire stabilità del servizio. I limiti di Free/Pro sono indicati in app e possono essere aggiornati con preavviso ragionevole.</p>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-accent-violet text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">6</span>
                Contenuti dell'utente e integrazioni
              </h2>
              <div className="text-foreground-secondary leading-relaxed space-y-3">
                <p><strong>Tuo contenuto:</strong> sei responsabile di dati inseriti, file caricati e sorgenti RAG; garantisci di avere diritti/consensi necessari e che i contenuti non violino diritti di terzi o norme.</p>
                <p><strong>Integrazioni:</strong> puoi collegare servizi terzi (es. Google Calendar, webhook HTTP). L'uso di integrazioni è soggetto ai termini dei rispettivi fornitori.</p>
                <p><strong>Azioni esterne:</strong> per azioni con effetti esterni (es. inviare email, creare eventi, POST verso terzi) Kyroo mostra un recap e richiede conferma esplicita; resta tua responsabilità verificare i destinatari e i contenuti.</p>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-accent-violet text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">7</span>
                Modelli IA e accuratezza
              </h2>
              <div className="text-foreground-secondary leading-relaxed space-y-3">
                <p>Le risposte generate da modelli IA (OpenAI, Anthropic, ecc.) possono essere incomplete o imprecise.</p>
                <p>Kyroo adotta il principio di minimo privilegio e, se disponibile, imposta i provider per non usare i dati a fini di training. Tuttavia:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>devi verificare criticamente i risultati prima di usarli;</li>
                  <li>non utilizzare Kyroo come unico riferimento per decisioni mediche/legali/finanziarie;</li>
                  <li>sei responsabile dell'uso conforme alle leggi e ai termini dei provider LLM.</li>
                </ul>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-accent-violet text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">8</span>
                Proprietà intellettuale
              </h2>
              <div className="text-foreground-secondary leading-relaxed space-y-3">
                <p><strong>Kyroo:</strong> tutto il software, il design e i contenuti originali di Kyroo restano di proprietà di Kyroo o dei suoi licenzianti.</p>
                <p><strong>Licenza d'uso:</strong> ti concediamo una licenza limitata, non esclusiva e revocabile per usare Kyroo secondo questi Termini.</p>
                <p><strong>Feedback:</strong> fornendo suggerimenti/migliorie, concedi a Kyroo una licenza gratuita, irrevocabile e trasferibile per usarli senza ulteriori obblighi.</p>
              </div>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-accent-violet text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">9</span>
                Privacy e protezione dati
              </h2>
              <div className="text-foreground-secondary leading-relaxed space-y-3">
                <p>Il trattamento dei dati personali è descritto nella Privacy Policy.</p>
                <p>Kyroo adotta misure di sicurezza tecniche e organizzative (TLS, RLS, segregazione per tenant, audit con redazione). In caso di conflitto, prevale la <a href="/privacy" className="text-accent-cyan hover:underline">Privacy Policy</a>. Su richiesta B2B, è disponibile un Data Processing Addendum (DPA).</p>
              </div>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-accent-violet text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">10</span>
                Disponibilità, modifiche e beta
              </h2>
              <div className="text-foreground-secondary leading-relaxed space-y-3">
                <p><strong>SLA/SLO:</strong> servizio "best-effort"; eventuali obiettivi di servizio (SLO) possono essere indicati separatamente.</p>
                <p><strong>Manutenzioni:</strong> potremmo effettuare interventi programmati o urgenti; cercheremo di ridurre al minimo l'impatto.</p>
                <p><strong>Funzionalità beta:</strong> possono essere instabili, "AS IS", senza garanzie; potremmo modificarle o interromperle.</p>
              </div>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-accent-violet text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">11</span>
                Garanzie e disclaimer
              </h2>
              <div className="text-foreground-secondary leading-relaxed space-y-3">
                <p>Kyroo è fornito "AS IS" e "AS AVAILABLE". Nei limiti consentiti dalla legge:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>escludiamo garanzie implicite di commerciabilità, idoneità a uno scopo specifico e non violazione;</li>
                  <li>non garantiamo che i risultati dell'IA siano corretti, né che il servizio sia privo di errori o sempre disponibile.</li>
                </ul>
              </div>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-accent-violet text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">12</span>
                Sospensione e chiusura
              </h2>
              <div className="text-foreground-secondary leading-relaxed space-y-3">
                <p>Possiamo sospendere o chiudere l'account in caso di:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>violazioni dei Termini, uso illecito o rischi per la sicurezza;</li>
                  <li>richieste di autorità competenti;</li>
                  <li>mancato pagamento.</li>
                </ul>
                <p>In caso di chiusura, potrai esportare i dati disponibili secondo le opzioni in app, salvo obblighi di legge o motivi di sicurezza.</p>
              </div>
            </section>

            {/* Section 13 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-accent-violet text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">13</span>
                Responsabilità
              </h2>
              <div className="text-foreground-secondary leading-relaxed space-y-3">
                <p>Nella misura massima consentita:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Kyroo non è responsabile di danni indiretti, lucro cessante, perdita di dati non imputabile a sua colpa grave o dolo;</li>
                  <li>la responsabilità complessiva di Kyroo è limitata all'importo pagato dall'utente nei 12 mesi precedenti l'evento che ha generato la pretesa (o €100 se maggiore per legge).</li>
                </ul>
                <p>Nulla limita la responsabilità che non può essere esclusa per legge (es. dolo, colpa grave, morte o lesioni personali da negligenza).</p>
              </div>
            </section>

            {/* Section 14 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-accent-violet text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">14</span>
                Indennizzo
              </h2>
              <p className="text-foreground-secondary leading-relaxed">
                Accetti di tenere indenne Kyroo da reclami di terzi derivanti dai tuoi contenuti o dall'uso del servizio in violazione dei Termini o della legge.
              </p>
            </section>

            {/* Section 15 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-accent-violet text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">15</span>
                Conservazione ed export dei dati
              </h2>
              <div className="text-foreground-secondary leading-relaxed space-y-3">
                <p><strong>Retention:</strong> cronologia e log come indicato in app e nella Privacy Policy.</p>
                <p><strong>Export:</strong> forniamo, quando disponibile, strumenti di esportazione. Alcuni dati (es. log tecnici, vettori) potrebbero non essere esportabili integralmente.</p>
              </div>
            </section>

            {/* Section 16 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-accent-violet text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">16</span>
                Modifiche ai Termini
              </h2>
              <p className="text-foreground-secondary leading-relaxed">
                Possiamo aggiornare i presenti Termini. Se la modifica è sostanziale, te ne daremo notizia via email o in-app con preavviso ragionevole. L'uso continuato del servizio dopo l'efficacia delle modifiche costituisce accettazione.
              </p>
            </section>

            {/* Section 17 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-accent-violet text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">17</span>
                Legge applicabile e foro
              </h2>
              <div className="text-foreground-secondary leading-relaxed space-y-3">
                <p>Se usi Kyroo come consumatore nell'UE, si applicano le norme imperative della tua residenza e il foro competente è quello del consumatore.</p>
                <p>Per utenti business/B2B, salvo diversa legge imperativa, i Termini sono regolati dalla legge italiana e il foro esclusivo è [città].</p>
              </div>
            </section>

            {/* Section 18 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-accent-violet text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">18</span>
                Varie
              </h2>
              <div className="text-foreground-secondary leading-relaxed space-y-3">
                <p><strong>Intero accordo:</strong> i presenti Termini, la Privacy Policy e la Cookie Policy costituiscono l'intero accordo.</p>
                <p><strong>Invalidità parziale:</strong> l'eventuale nullità di una clausola non invalida le restanti.</p>
                <p><strong>Cessione:</strong> puoi cedere i diritti solo con consenso scritto; Kyroo può cedere in caso di riorganizzazione societaria.</p>
                <p><strong>Forza maggiore:</strong> nessuna parte è responsabile per eventi fuori dal controllo ragionevole (es. guasti rete, disastri, atti governativi).</p>
                <p><strong>Comunicazioni:</strong> via email o in-app all'indirizzo associato all'account.</p>
              </div>
            </section>

            {/* Allegato A */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-accent-cyan text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">A</span>
                Allegato A – Accettabile Uso (AUP) sintetica
              </h2>
              <p className="text-foreground-secondary leading-relaxed">
                È vietato: (i) violare leggi o diritti altrui; (ii) distribuire malware, phishing, spam; (iii) caricare dati personali di terzi senza base giuridica; (iv) aggirare limiti tecnici o di sicurezza; (v) usare Kyroo per attività ad alto rischio (es. dispositivi medici, sistemi di sicurezza critica).
              </p>
            </section>

            {/* Allegato B */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-accent-cyan text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">B</span>
                Allegato B – Limiti di piano
              </h2>
              <div className="text-foreground-secondary leading-relaxed space-y-2">
                <p><strong>Free:</strong> chat semplice, RAG limitato, niente tool esterni, cronologia 30 gg.</p>
                <p><strong>Pro Mensile/Annuale:</strong> RAG esteso (topK&gt;4), tools esterni abilitati, esecuzione piani &gt; 2 step, cronologia estesa, priorità di coda.</p>
              </div>
            </section>
          </div>

          {/* Back to top */}
          <div className="text-center mt-12">
            <Link 
              to="/" 
              className="btn-primary inline-flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              Torna alla Home
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  )
}