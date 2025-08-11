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

Copia `src/web/.env.local.example` in `src/web/.env.local` e compila:

```
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
```

Riavvia il dev server dopo ogni modifica alle env.