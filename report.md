# Report di Implementazione: Piani di Abbonamento e Gestione Limiti Enterprise

Questo report riassume le modifiche e le nuove funzionalità implementate nell'applicazione Kyroo relative ai piani di abbonamento (Free, Pro, Enterprise) e alla gestione dei limiti personalizzati per gli utenti Enterprise.

## 1. Implementazione della Logica dei Piani nel Backend

Sono stati creati i seguenti file e logiche nel backend:

*   **`src/shared/plans.ts`**: Definizione completa dei piani Free, Pro ed Enterprise, inclusi i limiti predefiniti per ciascun piano, la configurazione del trial Pro (7 giorni con limiti dimezzati) e i testi UI in italiano. Sono state aggiunte utilità per controlli e formattazione relativi ai piani.

*   **`src/shared/usage-tracking.ts`**: Interfacce e logiche per il tracking delle metriche di utilizzo degli utenti e dei workspace. Include la gestione dei reset giornalieri e mensili (fuso orario Europe/Rome), la validazione dei limiti e messaggi di errore localizzati.

*   **`src/server/lib/plan-service.ts`**: Implementazione della classe `PlanService` per gestire i piani utente e i relativi limiti. Questo servizio si occupa dei controlli di utilizzo per le varie azioni, della gestione del trial Pro e delle scadenze, della registrazione dell'utilizzo e delle operazioni di upgrade/downgrade dei piani.

*   **`supabase/migrations/20250812080000_add_usage_tracking.sql`**: Script di migrazione del database per aggiungere le tabelle necessarie al tracking dell'utilizzo (es. `user_usage`, `workspace_usage`). Include funzioni per i reset automatici, trigger per l'inizializzazione automatica dei dati di utilizzo e politiche RLS (Row Level Security) per garantire la sicurezza dei dati.

## 2. Aggiornamento dell'Interfaccia Utente (UI) e della Messaggistica

Sono stati introdotti nuovi componenti e modifiche all'interfaccia utente per riflettere i piani di abbonamento:

*   **`src/web/src/hooks/usePlan.ts`**: Un React hook per accedere facilmente alle informazioni sul piano dell'utente corrente in qualsiasi componente frontend.

*   **`src/web/src/components/PlanCard.tsx`**: Componente per visualizzare le informazioni di un piano, utile per la pagina di billing o per confronti tra piani.

*   **`src/web/src/components/UsageBar.tsx`**: Componente per visualizzare l'utilizzo corrente delle risorse rispetto ai limiti del piano, con una barra di progresso.

*   **`src/web/src/components/PlanBadge.tsx`**: Un badge visivo che mostra il tipo di piano attivo dell'utente (Free, Pro, Enterprise) con styling e icone appropriate. Questo badge sostituisce la visualizzazione del ruolo utente nella sidebar.

*   **`src/web/src/components/AppShell.tsx`**: Modificato per integrare il `usePlan` hook e visualizzare il `PlanBadge` nella sidebar (sia desktop che mobile) sotto il nome utente, fornendo un'indicazione immediata del piano attivo.

*   **`src/web/src/components/PlanManagementModal.tsx`**: Un modal completo per gli amministratori per gestire i piani degli utenti. Permette di visualizzare il piano attuale, lo stato del trial/scadenza, selezionare un nuovo piano con anteprima, gestire le date di scadenza e avviare trial Pro.

## 3. Gestione Utenti Enterprise e Limiti Personalizzati

È stata aggiunta una nuova sezione per la gestione granulare degli utenti Enterprise:

*   **`src/web/src/pages/app/EnterpriseLimits.tsx`**: Una nuova pagina dedicata alla modifica dei limiti personalizzati per un utente Enterprise specifico. Questa pagina permette agli amministratori di impostare valori personalizzati per tutte le metriche di utilizzo (es. max workspaces, max chat input tokens, max web searches, ecc.).

*   **`src/web/src/pages/app/AdminDashboard.tsx`**: La dashboard amministrativa è stata aggiornata per includere un filtro per i piani (per visualizzare solo gli utenti Enterprise) e un pulsante di azione per ogni utente Enterprise che reindirizza alla pagina `EnterpriseLimits` per la gestione dei limiti personalizzati.

*   **`src/web/src/App.tsx`**: È stata aggiunta la rotta `/app/admin/enterprise-limits/:userId` per accedere alla nuova pagina di gestione dei limiti Enterprise.

## 4. Calcolo Costi/Guadagni per Enterprise

È stata implementata una funzionalità per stimare i costi operativi e suggerire un prezzo di vendita per i piani Enterprise, basandosi sui limiti configurati:

*   **`src/shared/cost-calculator.ts`**: Questo file contiene la logica per calcolare i costi stimati. Sono stati definiti costi unitari per ogni risorsa (es. token AI, ricerche web, storage, esecuzioni workflow) basati sui prezzi reali dei servizi utilizzati (OpenAI, Anthropic Claude, Tavily, Milvus/Zilliz Cloud, Supabase, Cohere). La funzione `calculateEnterpriseCosts` prende i limiti del piano e un tasso di utilizzo stimato per fornire una ripartizione dettagliata dei costi mensili e annuali, un margine di profitto e un prezzo suggerito.

*   **`src/web/src/components/CostCalculator.tsx`**: Un componente React che visualizza il riepilogo dei costi e dei ricavi stimati sulla pagina `EnterpriseLimits`. Include un cursore per regolare il tasso di utilizzo stimato, un riepilogo dei costi totali, del prezzo suggerito e del margine di profitto, e una ripartizione dettagliata dei costi per categoria. Fornisce anche raccomandazioni di pricing.

## 5. Aggiornamenti del Codice e Dipendenze

*   Sono state aggiunte nuove dipendenze o aggiornate quelle esistenti per supportare le nuove funzionalità (es. `lucide-react` per le icone, `framer-motion` per le animazioni).
*   Il codice è stato scritto in TypeScript per garantire maggiore robustezza e manutenibilità.

## 6. Commit e Push su GitHub

Tutte le modifiche descritte in questo report sono state commesse e pushate sul repository GitHub `Francescosommellaa/kyroo` con il commit `6982a1f` e il messaggio:

```
feat: Implement comprehensive subscription plans system

- Add Free, Pro, and Enterprise plans with detailed limits
- Implement plan service with usage tracking and validation
- Add database migration for usage tracking tables
- Create plan management UI components (PlanCard, UsageBar, PlanBadge)
- Update sidebar to show plan badges instead of user roles
- Add admin interface for plan management with modal
- Create Enterprise limits management page with cost calculator
- Implement real-time cost estimation based on actual service pricing
- Add plan filter to admin dashboard
- Include routing for Enterprise limits management
- Based on real pricing from OpenAI, Claude, Tavily, Milvus, Supabase, Cohere
```

Questo conclude l'implementazione delle funzionalità richieste. Sono a disposizione per ulteriori domande o modifiche.

