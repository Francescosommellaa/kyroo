# KYROO

Full-stack application con frontend React, backend Node.js, funzioni Netlify e database Supabase.

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Struttura

- `src/web/` - Frontend React/Vite
- `src/server/` - Codice condiviso backend/tools
- `netlify/functions/` - Funzioni serverless Netlify
- `supabase/` - Migrazioni e policies database
- `scripts/` - Script di utilità

## Comandi

- `npm run dev` - Avvia sviluppo frontend
- `npm run build` - Build completo del progetto
- `npm run lint` - Linting del codice
- `npm run format` - Formattazione del codice

## Ambiente FE (Vite)

### Sviluppo Locale

Copia `.env.example` in `.env.local` **nella root del progetto** e inserisci i valori reali:

```
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
```

**Importante**: Il file `.env.local` deve essere nella root del progetto (`/home/project/.env.local`), non in `src/web/`.

### Produzione

Le variabili d'ambiente vengono configurate tramite:
- **Netlify**: Site Settings → Environment Variables
- **Supabase**: Project Settings → API

**Importante**: Non committare mai file `.env*` con credenziali reali!

Riavvia il dev server dopo ogni modifica alle env.

## Autenticazione OAuth

### Google OAuth Setup

Per abilitare l'autenticazione con Google, è necessario configurare OAuth sia in Google Cloud Console che in Supabase Dashboard.

**Configurazione rapida:**
1. Aggiungi le credenziali Google al file `.env`:
   ```
   GOOGLE_CLIENT_ID=your-google-client-id-here
   GOOGLE_CLIENT_SECRET=your-google-client-secret-here
   ```

2. Configura Google OAuth in Supabase Dashboard:
   - Vai su **Authentication** → **Providers** → **Google**
   - Abilita il provider e inserisci le credenziali

**Documentazione completa:** Consulta [`docs/GOOGLE_OAUTH_SETUP.md`](./docs/GOOGLE_OAUTH_SETUP.md) per istruzioni dettagliate.

### Risoluzione Problemi OAuth

- **Errore "Unable to exchange external code"**: Verifica che le credenziali Google siano configurate correttamente
- **Errore "redirect_uri_mismatch"**: Controlla che l'URL di callback corrisponda tra Google Cloud Console e Supabase
- **Errore di rete Google**: Assicurati che il provider Google sia abilitato in Supabase Dashboard