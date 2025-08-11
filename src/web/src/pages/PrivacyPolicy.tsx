import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function PrivacyPolicy() {
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
              Informativa Privacy
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
                Titolare del trattamento
              </h2>
              <div className="text-foreground-secondary leading-relaxed space-y-2">
                <p><strong>Titolare:</strong> [Ragione sociale / Nome progetto] ("Kyroo")</p>
                <p><strong>Sede legale:</strong> [indirizzo]</p>
                <p><strong>Email privacy:</strong> <a href="mailto:privacy@kyroo.io" className="text-accent-cyan hover:underline">privacy@kyroo.io</a></p>
                <p><strong>PEC / REA (se applicabile):</strong> []</p>
                <p><strong>DPO (se nominato):</strong> [nome, contatti]</p>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-accent-violet text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                Che cos'è Kyroo
              </h2>
              <p className="text-foreground-secondary leading-relaxed">
                Kyroo è un'app SaaS che orchestra agenti IA: risponde direttamente alle richieste semplici e, per richieste complesse, pianifica ed esegue micro-task con strumenti esterni (web, HTTP, email, calendario, RAG su Milvus). L'area pubblica comprende la landing, l'area privata la dashboard accessibile dopo registrazione/login.
              </p>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-accent-violet text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
                Dati trattati
              </h2>
              <div className="text-foreground-secondary leading-relaxed space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Dati account:</h3>
                  <p>email, nome (se fornito), ID utente, tenant/ruoli, preferenze.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Dati operativi:</h3>
                  <p>prompt, chat, file caricati (PDF/CSV/TXT), sorgenti RAG e metadati, piani/DAG, step di esecuzione, log tecnici (token, latenza, esito, errori), audit dei tool (con redazione dove possibile).</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Dati di pagamento:</h3>
                  <p>gestiti da Stripe (vedi §9); Kyroo non conserva i numeri di carta.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Dati di utilizzo e cookie:</h3>
                  <p>eventi tecnici, pagine visitate, configurazioni; dettagli in Cookie Policy.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Dati provenienti da integrazioni esterne (facoltative):</h3>
                  <p>Google Calendar, email (Resend), ricerche web (Tavily), fonti vettoriali (Milvus/Zilliz), code/queue (Upstash), hosting/build (Netlify).</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Categorie particolari (art. 9 GDPR):</h3>
                  <p>non richieste né finalizzate; se l'utente le inserisce nei contenuti, verranno trattate solo per erogare il servizio.</p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-accent-violet text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">4</span>
                Finalità e basi giuridiche
              </h2>
              <div className="text-foreground-secondary leading-relaxed space-y-3">
                <p><strong>Erogazione del servizio</strong> (registrazione, autenticazione, chat, planner, esecuzione tool, RAG): art. 6.1(b) GDPR (contratto).</p>
                <p><strong>Pagamenti e fatturazione:</strong> art. 6.1(b) e 6.1(c) (obblighi legali).</p>
                <p><strong>Sicurezza, prevenzione abusi, logging e audit:</strong> art. 6.1(f) (legittimo interesse; minimizzazione e redazione).</p>
                <p><strong>Comunicazioni di servizio</strong> (es. scadenze piani, incidenti): 6.1(b)/(f).</p>
                <p><strong>Marketing opzionale / newsletter:</strong> art. 6.1(a) (consenso, sempre revocabile).</p>
                <p><strong>Integrazioni su richiesta</strong> (email, calendario, HTTP verso terzi): 6.1(b); per azioni irreversibili richiediamo consenso puntuale in-app.</p>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-accent-violet text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">5</span>
                Come funziona il trattamento con modelli IA
              </h2>
              <div className="text-foreground-secondary leading-relaxed space-y-3">
                <p>I prompt e le risposte possono transitare presso fornitori di modelli (es. OpenAI, Anthropic) esclusivamente per erogare la risposta/strumento richiesto.</p>
                <p>Configuriamo i provider affinché non utilizzino i dati per addestrare i loro modelli, ove l'opzione è disponibile.</p>
                <p>Per richieste complesse, il planner può inviare ai tool solo i minimi dati necessari (principio di minimizzazione).</p>
                <p>Prima di azioni esterne (es. invio email, creazione evento) chiediamo conferma e mostriamo un recap.</p>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-accent-violet text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">6</span>
                Necessità del conferimento
              </h2>
              <p className="text-foreground-secondary leading-relaxed">
                I dati obbligatori (email e credenziali) sono necessari per creare l'account. Senza i dati necessari alle integrazioni facoltative, le relative funzioni non saranno disponibili.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-accent-violet text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">7</span>
                Tempi di conservazione
              </h2>
              <div className="text-foreground-secondary leading-relaxed space-y-3">
                <p><strong>Account e profilo:</strong> fino a richiesta di cancellazione o chiusura account; metadati fiscali secondo i termini di legge.</p>
                <p><strong>Chat, piani, esecuzioni e log:</strong> fino a 12 mesi (default) per finalità operative e di sicurezza; per il piano Free la cronologia può essere limitata (es. 30 giorni).</p>
                <p><strong>Dati di fatturazione:</strong> secondo normativa applicabile (es. 10 anni).</p>
                <p>Trascorsi i termini, i dati sono eliminati o anonimizzati in modo irreversibile.</p>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-accent-violet text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">8</span>
                Destinatari e responsabili del trattamento
              </h2>
              <div className="text-foreground-secondary leading-relaxed space-y-4">
                <p>Trattiamo i dati con fornitori che agiscono come Responsabili ai sensi dell'art. 28 GDPR (DPA/SCC in essere), tra cui:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Supabase (autenticazione, DB, RLS)</li>
                  <li>Netlify (hosting statico + funzioni serverless)</li>
                  <li>Upstash (Redis/BullMQ) per code/queue</li>
                  <li>Zilliz Cloud / Milvus per database vettoriale (solo vettori + metadati)</li>
                  <li>Resend per invio email transazionali</li>
                  <li>Tavily per ricerca/estrazione web</li>
                  <li>Fornitori LLM (OpenAI, Anthropic) per inferenza</li>
                  <li>Altri sub-processor strettamente necessari, aggiornati nel registro dei trattamenti</li>
                </ul>
                <p>Stripe tratta i dati di pagamento come titolare autonomo per i profili di compliance PCI DSS.</p>
              </div>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-accent-violet text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">9</span>
                Trasferimenti extra-SEE
              </h2>
              <p className="text-foreground-secondary leading-relaxed">
                Alcuni fornitori possono trattare dati in Paesi extra-SEE. In tali casi adottiamo Clausole Contrattuali Standard (SCC) e misure supplementari (cifratura in transito, minimizzazione, data residency quando disponibile).
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-accent-violet text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">10</span>
                Sicurezza
              </h2>
              <div className="text-foreground-secondary leading-relaxed space-y-2">
                <p>• Cifratura in transito (TLS) e a riposo dove disponibile</p>
                <p>• RLS sui dati applicativi, segregazione per tenant, politiche di least-privilege sui tool</p>
                <p>• Logging e audit con redazione dei contenuti sensibili</p>
                <p>• Rate-limit, monitoraggio e test di sicurezza continui</p>
              </div>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-accent-violet text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">11</span>
                Diritti degli interessati
              </h2>
              <p className="text-foreground-secondary leading-relaxed">
                Hai diritto di accedere, rettificare, cancellare, limitare, opporti, alla portabilità dei dati e di revocare il consenso (artt. 15–22 GDPR). Per esercitarli: <a href="mailto:privacy@kyroo.io" className="text-accent-cyan hover:underline">privacy@kyroo.io</a>. Hai diritto di proporre reclamo al Garante per la Protezione dei Dati Personali.
              </p>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-accent-violet text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">12</span>
                Processi decisionali automatizzati
              </h2>
              <p className="text-foreground-secondary leading-relaxed">
                Kyroo non effettua decisioni che producano effetti giuridici basate unicamente su trattamenti automatizzati ai sensi dell'art. 22 GDPR. La pianificazione (DAG) supporta l'utente ma richiede conferme esplicite per azioni esterne.
              </p>
            </section>

            {/* Section 13 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-accent-violet text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">13</span>
                Minori
              </h2>
              <p className="text-foreground-secondary leading-relaxed">
                Il servizio non è destinato a minori di 16 anni. Se ritieni che un minore ci abbia fornito dati, contattaci: provvederemo alla rimozione.
              </p>
            </section>

            {/* Section 14 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-accent-violet text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">14</span>
                Cookie
              </h2>
              <p className="text-foreground-secondary leading-relaxed">
                Usiamo cookie tecnici e, previo consenso, di misurazione/marketing. Dettagli nella Cookie Policy: <a href="#" className="text-accent-cyan hover:underline">[link alla pagina cookie]</a>.
              </p>
            </section>

            {/* Section 15 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-accent-violet text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">15</span>
                Come contattarci
              </h2>
              <div className="text-foreground-secondary leading-relaxed space-y-2">
                <p><strong>Email:</strong> <a href="mailto:privacy@kyroo.io" className="text-accent-cyan hover:underline">privacy@kyroo.io</a></p>
                <p><strong>Indirizzo postale:</strong> []</p>
                <p><strong>DPO:</strong> [se nominato]</p>
              </div>
            </section>

            {/* Section 16 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-accent-violet text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">16</span>
                Modifiche all'informativa
              </h2>
              <p className="text-foreground-secondary leading-relaxed">
                Potremmo aggiornare la presente informativa per ragioni legali o tecniche. Le modifiche saranno pubblicate qui con data di aggiornamento; se sostanziali, te le comunicheremo via email o in-app.
              </p>
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