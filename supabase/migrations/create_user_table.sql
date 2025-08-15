-- CREAZIONE TABELLA USER PULITA
-- Tabella per memorizzare i profili utente sincronizzati con auth.users

-- Crea la tabella user con struttura pulita
CREATE TABLE IF NOT EXISTS public.user (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    provider TEXT DEFAULT 'email',
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraint per garantire email unica
    CONSTRAINT user_email_unique UNIQUE (email),
    
    -- Constraint per validare il provider
    CONSTRAINT user_provider_check CHECK (provider IN ('email', 'google', 'github', 'facebook'))
);

-- Crea indici per migliorare le performance
CREATE INDEX IF NOT EXISTS user_email_idx ON public.user(email);
CREATE INDEX IF NOT EXISTS user_provider_idx ON public.user(provider);
CREATE INDEX IF NOT EXISTS user_created_at_idx ON public.user(created_at);

-- Abilita Row Level Security
ALTER TABLE public.user ENABLE ROW LEVEL SECURITY;

-- Concede i permessi di base ai ruoli
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user TO authenticated;
GRANT SELECT ON public.user TO anon;

-- Crea policy RLS di base
CREATE POLICY "Users can view own profile" ON public.user
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only" ON public.user
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Commento di verifica
-- Tabella user creata con successo con RLS e permessi configurati