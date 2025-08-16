# Configurazione Google OAuth per KYROO

Questa guida ti aiuterà a configurare l'autenticazione Google OAuth per l'applicazione KYROO utilizzando Supabase.

## Prerequisiti

- Un progetto Supabase attivo
- Un account Google Cloud Console
- Accesso alle credenziali del progetto

## Passo 1: Configurazione Google Cloud Console

### 1.1 Accedi a Google Cloud Console
1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Accedi con il tuo account Google
3. Seleziona o crea un nuovo progetto

### 1.2 Abilita le API necessarie
1. Nel menu di navigazione, vai su **API e servizi** → **Libreria**
2. Cerca "Google+ API" e abilitala
3. Cerca "Google Identity and Access Management (IAM) API" e abilitala

### 1.3 Crea le credenziali OAuth 2.0
1. Nel menu di navigazione, vai su **API e servizi** → **Credenziali**
2. Clicca su **+ CREA CREDENZIALI** → **ID client OAuth 2.0**
3. Se richiesto, configura la schermata di consenso OAuth:
   - Tipo di utente: **Esterno**
   - Nome dell'applicazione: **KYROO**
   - Email di supporto: il tuo email
   - Domini autorizzati: aggiungi il dominio della tua app

### 1.4 Configura l'ID client OAuth 2.0
1. Tipo di applicazione: **Applicazione web**
2. Nome: **KYROO Web Client**
3. **URI di reindirizzamento autorizzati**:
   - Per sviluppo: `https://nyscbjgrfuhjjzyffgun.supabase.co/auth/v1/callback`
   - Per produzione: `https://your-production-domain.supabase.co/auth/v1/callback`

4. Clicca **CREA**
5. **IMPORTANTE**: Copia e salva in modo sicuro:
   - **ID client** (GOOGLE_CLIENT_ID)
   - **Segreto client** (GOOGLE_CLIENT_SECRET)

## Passo 2: Configurazione Supabase Dashboard

### 2.1 Accedi a Supabase Dashboard
1. Vai su [Supabase Dashboard](https://app.supabase.com/)
2. Seleziona il tuo progetto KYROO

### 2.2 Configura Google OAuth Provider
1. Nel menu laterale, vai su **Authentication** → **Providers**
2. Trova **Google** nella lista dei provider
3. Abilita il toggle **Enable sign in with Google**
4. Inserisci le credenziali ottenute da Google Cloud Console:
   - **Client ID**: il GOOGLE_CLIENT_ID copiato
   - **Client Secret**: il GOOGLE_CLIENT_SECRET copiato
5. Clicca **Save**

### 2.3 Verifica URL di Callback
Assicurati che l'URL di callback in Supabase corrisponda a quello configurato in Google Cloud Console:
- URL Supabase: `https://nyscbjgrfuhjjzyffgun.supabase.co/auth/v1/callback`

## Passo 3: Configurazione Variabili d'Ambiente

### 3.1 Aggiorna il file .env
Aggiungi le seguenti variabili al tuo file `.env`:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

### 3.2 Riavvia il server di sviluppo
```bash
npm run dev
```

## Passo 4: Test della Configurazione

### 4.1 Test di Autenticazione
1. Apri l'applicazione nel browser
2. Clicca su "Accedi con Google"
3. Verifica che il flusso OAuth funzioni correttamente
4. Controlla che l'utente venga reindirizzato correttamente dopo l'autenticazione

### 4.2 Risoluzione Problemi Comuni

#### Errore: "Unable to exchange external code"
- **Causa**: Credenziali Google OAuth non configurate o errate
- **Soluzione**: Verifica che GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET siano corretti

#### Errore: "redirect_uri_mismatch"
- **Causa**: URL di callback non corrispondente
- **Soluzione**: Verifica che l'URL in Google Cloud Console corrisponda esattamente a quello di Supabase

#### Errore: "access_denied"
- **Causa**: Utente ha negato l'accesso o app non verificata
- **Soluzione**: Configura correttamente la schermata di consenso OAuth

## Sicurezza

⚠️ **IMPORTANTE**: 
- Non condividere mai le credenziali OAuth
- Non committare mai il file `.env` nel repository
- Usa variabili d'ambiente separate per sviluppo e produzione
- Rivedi regolarmente gli accessi OAuth nel Google Cloud Console

## Supporto

Per ulteriore assistenza:
- [Documentazione Supabase Auth](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Community](https://github.com/supabase/supabase/discussions)