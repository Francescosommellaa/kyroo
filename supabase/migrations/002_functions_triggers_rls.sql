-- Funzioni, Trigger e Row Level Security (RLS)

-- 1. Funzione per aggiornare updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. Trigger per tutte le tabelle
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON public.workspaces
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_workspaces_updated_at BEFORE UPDATE ON public.user_workspaces
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON public.collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Funzioni per codici di verifica
-- Genera codice di verifica a 6 cifre
CREATE OR REPLACE FUNCTION generate_verification_code()
RETURNS TEXT AS $$
BEGIN
    RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Verifica validità codice
CREATE OR REPLACE FUNCTION is_verification_code_valid(
    user_id UUID,
    code TEXT,
    code_type TEXT DEFAULT 'email'
)
RETURNS BOOLEAN AS $$
DECLARE
    stored_code TEXT;
    expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
    IF code_type = 'email' THEN
        SELECT email_verification_code, email_verification_expires_at
        INTO stored_code, expires_at
        FROM public.users
        WHERE id = user_id;
    ELSIF code_type = 'password_reset' THEN
        SELECT password_reset_code, password_reset_expires_at
        INTO stored_code, expires_at
        FROM public.users
        WHERE id = user_id;
    ELSE
        RETURN FALSE;
    END IF;
    
    RETURN stored_code = code AND expires_at > NOW();
END;
$$ LANGUAGE plpgsql;

-- Pulisce codici di verifica
CREATE OR REPLACE FUNCTION clear_verification_codes(
    user_id UUID,
    code_type TEXT DEFAULT 'email'
)
RETURNS VOID AS $$
BEGIN
    IF code_type = 'email' THEN
        UPDATE public.users
        SET email_verification_code = NULL,
            email_verification_expires_at = NULL
        WHERE id = user_id;
    ELSIF code_type = 'password_reset' THEN
        UPDATE public.users
        SET password_reset_code = NULL,
            password_reset_expires_at = NULL
        WHERE id = user_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 4. Row Level Security (RLS)

-- Abilita RLS per tutte le tabelle
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- 5. Politiche RLS per Users
-- Gli utenti possono vedere solo i propri dati
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Gli utenti possono aggiornare solo i propri dati
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Gli admin possono vedere tutti gli utenti
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 6. Politiche RLS per Workspaces
-- Gli utenti possono vedere i workspace a cui hanno accesso
CREATE POLICY "Users can view accessible workspaces" ON public.workspaces
    FOR SELECT USING (
        owner_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_workspaces
            WHERE workspace_id = id AND user_id = auth.uid()
        )
    );

-- Solo i proprietari possono modificare i workspace
CREATE POLICY "Owners can update workspaces" ON public.workspaces
    FOR UPDATE USING (owner_id = auth.uid());

-- Solo i proprietari possono eliminare i workspace
CREATE POLICY "Owners can delete workspaces" ON public.workspaces
    FOR DELETE USING (owner_id = auth.uid());

-- Gli utenti autenticati possono creare workspace
CREATE POLICY "Authenticated users can create workspaces" ON public.workspaces
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- 7. Politiche RLS per User-Workspaces
-- Gli utenti possono vedere le proprie relazioni
CREATE POLICY "Users can view own workspace relations" ON public.user_workspaces
    FOR SELECT USING (user_id = auth.uid());

-- I proprietari dei workspace possono gestire le relazioni
CREATE POLICY "Workspace owners can manage relations" ON public.user_workspaces
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.workspaces
            WHERE id = workspace_id AND owner_id = auth.uid()
        )
    );

-- 8. Politiche RLS per Collections
-- Gli utenti possono vedere le collezioni dei workspace accessibili
CREATE POLICY "Users can view accessible collections" ON public.collections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.workspaces w
            LEFT JOIN public.user_workspaces uw ON w.id = uw.workspace_id
            WHERE w.id = workspace_id AND (
                w.owner_id = auth.uid() OR uw.user_id = auth.uid()
            )
        )
    );

-- Gli utenti possono gestire le collezioni dei workspace accessibili
CREATE POLICY "Users can manage accessible collections" ON public.collections
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.workspaces w
            LEFT JOIN public.user_workspaces uw ON w.id = uw.workspace_id
            WHERE w.id = workspace_id AND (
                w.owner_id = auth.uid() OR 
                (uw.user_id = auth.uid() AND uw.role IN ('owner', 'admin', 'member'))
            )
        )
    );

-- 9. Permessi base per i ruoli
-- Permessi per utenti autenticati
GRANT SELECT, UPDATE ON public.users TO authenticated;
GRANT ALL ON public.workspaces TO authenticated;
GRANT ALL ON public.user_workspaces TO authenticated;
GRANT ALL ON public.collections TO authenticated;

-- Permessi per utenti anonimi (solo lettura limitata)
GRANT SELECT ON public.users TO anon;

-- Permessi per le funzioni
GRANT EXECUTE ON FUNCTION generate_verification_code() TO authenticated;
GRANT EXECUTE ON FUNCTION is_verification_code_valid(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION clear_verification_codes(UUID, TEXT) TO authenticated;