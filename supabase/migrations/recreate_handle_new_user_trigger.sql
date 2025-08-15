-- Ricrea completamente il trigger handle_new_user

-- 1. Elimina il trigger esistente se presente
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;

-- 2. Elimina la funzione esistente se presente
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Crea la funzione handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Inserisce un nuovo record nella tabella public.user
    INSERT INTO public.user (
        id,
        email,
        full_name,
        avatar_url,
        provider,
        email_verified,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
        CASE 
            WHEN NEW.app_metadata->>'provider' = 'google' THEN 'google'
            WHEN NEW.app_metadata->>'provider' = 'github' THEN 'github'
            WHEN NEW.app_metadata->>'provider' = 'facebook' THEN 'facebook'
            ELSE 'email'
        END,
        COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
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
    
    RETURN NEW;
END;
$$;

-- 4. Crea il trigger
CREATE TRIGGER handle_new_user
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 5. Garantisce i permessi corretti
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated;
GRANT ALL ON public.user TO anon, authenticated;

-- 6. Verifica che tutto sia stato creato correttamente
SELECT 'Trigger handle_new_user ricreato con successo' as status;

-- 7. Test finale
SELECT public.check_trigger_exists('handle_new_user') as trigger_exists;