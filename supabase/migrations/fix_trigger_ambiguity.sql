-- RISOLUZIONE ERRORE AMBIGUITÀ TRIGGER
-- Elimina e ricrea completamente il trigger handle_new_user

-- 1. Elimina tutti i trigger esistenti correlati
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP TRIGGER IF EXISTS handle_updated_at ON public.user;

-- 2. Elimina le funzioni esistenti
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_updated_at();
DROP FUNCTION IF EXISTS public.check_trigger_exists(text);
DROP FUNCTION IF EXISTS public.check_function_exists(text);

-- 3. Ricrea la funzione handle_new_user senza ambiguità
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_provider TEXT := 'email';
    user_verified BOOLEAN := FALSE;
    user_full_name TEXT;
    user_avatar_url TEXT;
BEGIN
    -- Log dell'operazione per debug
    RAISE LOG 'handle_new_user triggered for user ID: %', NEW.id;
    
    -- Determina il provider basandosi sui metadati
    IF NEW.app_metadata ? 'provider' THEN
        user_provider := NEW.app_metadata->>'provider';
    ELSIF NEW.user_metadata ? 'provider' THEN
        user_provider := NEW.user_metadata->>'provider';
    ELSIF NEW.email LIKE '%@gmail.com' AND NEW.app_metadata ? 'providers' THEN
        user_provider := 'google';
    END IF;
    
    -- Determina se l'email è verificata
    user_verified := (NEW.email_confirmed_at IS NOT NULL);
    
    -- Estrae il nome completo dai metadati
    user_full_name := COALESCE(
        NEW.user_metadata->>'full_name',
        NEW.user_metadata->>'name',
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name'
    );
    
    -- Estrae l'avatar URL dai metadati
    user_avatar_url := COALESCE(
        NEW.user_metadata->>'avatar_url',
        NEW.user_metadata->>'picture',
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'picture'
    );
    
    -- Gestisce INSERT (nuovo utente)
    IF TG_OP = 'INSERT' THEN
        BEGIN
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
                user_verified,
                NEW.created_at,
                NOW()
            );
            
            RAISE LOG 'User profile created successfully for ID: %', NEW.id;
            
        EXCEPTION
            WHEN unique_violation THEN
                RAISE LOG 'User profile already exists for ID: %, updating instead', NEW.id;
                -- Se l'utente esiste già, aggiorna i dati
                UPDATE public.user SET
                    email = NEW.email,
                    full_name = COALESCE(user_full_name, full_name),
                    avatar_url = COALESCE(user_avatar_url, avatar_url),
                    provider = user_provider,
                    email_verified = user_verified,
                    updated_at = NOW()
                WHERE id = NEW.id;
                
            WHEN OTHERS THEN
                RAISE LOG 'Error creating user profile for ID %: %', NEW.id, SQLERRM;
                -- Non bloccare la registrazione per errori nella tabella user
        END;
        
    -- Gestisce UPDATE (aggiornamento utente esistente)
    ELSIF TG_OP = 'UPDATE' THEN
        BEGIN
            UPDATE public.user SET
                email = NEW.email,
                full_name = COALESCE(user_full_name, full_name),
                avatar_url = COALESCE(user_avatar_url, avatar_url),
                provider = user_provider,
                email_verified = user_verified,
                updated_at = NOW()
            WHERE id = NEW.id;
            
            RAISE LOG 'User profile updated successfully for ID: %', NEW.id;
            
        EXCEPTION
            WHEN OTHERS THEN
                RAISE LOG 'Error updating user profile for ID %: %', NEW.id, SQLERRM;
        END;
    END IF;
    
    RETURN NEW;
END;
$$;

-- 4. Ricrea la funzione per aggiornare updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- 5. Ricrea i trigger per INSERT e UPDATE su auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 6. Ricrea il trigger per aggiornare automaticamente updated_at
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.user
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 7. Ricrea le funzioni helper per il debug
CREATE OR REPLACE FUNCTION public.check_trigger_exists(p_trigger_name text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM information_schema.triggers 
        WHERE trigger_name = p_trigger_name
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.check_function_exists(p_function_name text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM information_schema.routines 
        WHERE routine_name = p_function_name
        AND routine_schema = 'public'
    );
END;
$$;

-- Commento finale
-- Trigger handle_new_user ricreato senza ambiguità di colonne
-- Tutte le variabili sono ora esplicitamente dichiarate e utilizzate