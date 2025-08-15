-- Aggiorna il trigger handle_new_user per gestire display_name
-- Il display_name viene estratto dai metadata o impostato uguale a full_name

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_full_name text;
    user_display_name text;
    user_avatar_url text;
    user_provider text;
BEGIN
    -- Estrae i dati dal metadata
    user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', '');
    user_display_name := NEW.raw_user_meta_data->>'display_name';
    user_avatar_url := NEW.raw_user_meta_data->>'avatar_url';
    user_provider := COALESCE(NEW.raw_app_meta_data->>'provider', 'email');
    
    -- Se display_name non è specificato, usa full_name
    IF user_display_name IS NULL OR user_display_name = '' THEN
        user_display_name := user_full_name;
    END IF;
    
    -- Inserisce nella tabella user
    INSERT INTO public.user (
        id,
        email,
        full_name,
        display_name,
        avatar_url,
        provider,
        email_verified,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        user_full_name,
        user_display_name,
        user_avatar_url,
        user_provider,
        NEW.email_confirmed_at IS NOT NULL,
        NEW.created_at,
        NEW.updated_at
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        display_name = EXCLUDED.display_name,
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

-- Verifica che la funzione sia stata aggiornata
SELECT 
    'handle_new_user_updated' as component,
    'Trigger aggiornato per gestire display_name' as status;

-- Commento per chiarire la funzione
COMMENT ON FUNCTION public.handle_new_user() IS 'Gestisce la creazione di nuovi utenti nella tabella public.user con supporto per full_name e display_name separati';