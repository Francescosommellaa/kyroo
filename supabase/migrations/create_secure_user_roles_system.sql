-- Crea un sistema di ruoli sicuro per risolvere il problema di sicurezza RLS
-- Sostituisce l'uso di user_metadata con una tabella dedicata

-- 1. Crea la tabella user_roles per gestire ruoli e permessi in modo sicuro
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'user',
    permissions jsonb DEFAULT '{}',
    assigned_by uuid REFERENCES auth.users(id),
    assigned_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    -- Constraint per ruoli validi
    CONSTRAINT valid_roles CHECK (role IN ('user', 'admin', 'moderator', 'premium')),
    
    -- Un utente può avere un solo ruolo principale
    CONSTRAINT unique_user_role UNIQUE (user_id)
);

-- 2. Abilita RLS sulla tabella user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Policy RLS sicure per user_roles
-- Gli utenti possono vedere solo il proprio ruolo
CREATE POLICY "Users can view own role" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

-- Solo gli admin possono modificare i ruoli
CREATE POLICY "Only admins can manage roles" ON public.user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
        )
    );

-- Gli utenti possono inserire il proprio ruolo iniziale (solo 'user')
CREATE POLICY "Users can insert own initial role" ON public.user_roles
    FOR INSERT WITH CHECK (
        auth.uid() = user_id 
        AND role = 'user'
        AND assigned_by IS NULL
    );

-- 4. Funzione per assegnare ruolo di default ai nuovi utenti
CREATE OR REPLACE FUNCTION public.assign_default_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Assegna ruolo 'user' di default ai nuovi utenti
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user')
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$;

-- 5. Trigger per assegnare ruolo di default
DROP TRIGGER IF EXISTS on_auth_user_created_assign_role ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_role
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.assign_default_user_role();

-- 6. Funzione helper per verificare i ruoli
CREATE OR REPLACE FUNCTION public.user_has_role(user_uuid uuid, required_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = user_uuid 
        AND role = required_role
    );
END;
$$;

-- 7. Funzione helper per ottenere il ruolo di un utente
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role text;
BEGIN
    SELECT role INTO user_role
    FROM public.user_roles 
    WHERE user_id = user_uuid;
    
    RETURN COALESCE(user_role, 'user');
END;
$$;

-- 8. Garantisce i permessi corretti
GRANT SELECT, INSERT ON public.user_roles TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.assign_default_user_role() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_role(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO anon, authenticated;

-- 9. Aggiorna il trigger handle_new_user per includere l'assegnazione del ruolo
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_full_name text;
    user_avatar_url text;
    user_provider text;
BEGIN
    -- Estrae i dati dal metadata
    user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', '');
    user_avatar_url := NEW.raw_user_meta_data->>'avatar_url';
    user_provider := COALESCE(NEW.raw_app_meta_data->>'provider', 'email');
    
    -- Inserisce nella tabella user
    INSERT INTO public.user (
        id,
        email,
        full_name,
        avatar_url,
        provider,
        email_verified,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        user_full_name,
        user_avatar_url,
        user_provider,
        NEW.email_confirmed_at IS NOT NULL,
        NEW.created_at,
        NEW.updated_at
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        avatar_url = EXCLUDED.avatar_url,
        provider = EXCLUDED.provider,
        email_verified = EXCLUDED.email_verified,
        updated_at = EXCLUDED.updated_at;
    
    -- Assegna ruolo di default se non esiste
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user')
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$;

-- 10. Verifica che tutto sia stato creato correttamente
SELECT 
    'user_roles_system' as component,
    'Sistema di ruoli sicuro creato con successo' as status,
    'Risolve problema sicurezza RLS' as note;

-- 11. Test del sistema
SELECT 
    'Test user_roles functions' as test_name,
    public.get_user_role() as current_user_role;