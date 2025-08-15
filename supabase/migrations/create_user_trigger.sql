-- TRIGGER HANDLE_NEW_USER - VERSIONE PULITA E ROBUSTA
-- Sincronizza automaticamente auth.users con public.user

-- Funzione per gestire la sincronizzazione degli utenti
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_provider TEXT := 'email';
    user_verified BOOLEAN := FALSE;
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
                COALESCE(
                    NEW.user_metadata->>'full_name',
                    NEW.user_metadata->>'name',
                    NEW.raw_user_meta_data->>'full_name',
                    NEW.raw_user_meta_data->>'name'
                ),
                COALESCE(
                    NEW.user_metadata->>'avatar_url',
                    NEW.user_metadata->>'picture',
                    NEW.raw_user_meta_data->>'avatar_url',
                    NEW.raw_user_meta_data->>'picture'
                ),
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
                    full_name = COALESCE(
                        NEW.user_metadata->>'full_name',
                        NEW.user_metadata->>'name',
                        NEW.raw_user_meta_data->>'full_name',
                        NEW.raw_user_meta_data->>'name',
                        full_name
                    ),
                    avatar_url = COALESCE(
                        NEW.user_metadata->>'avatar_url',
                        NEW.user_metadata->>'picture',
                        NEW.raw_user_meta_data->>'avatar_url',
                        NEW.raw_user_meta_data->>'picture',
                        avatar_url
                    ),
                    provider = user_provider,
                    email_verified = user_verified,
                    updated_at = NOW()
                WHERE id = NEW.id;
                
            WHEN OTHERS THEN
                RAISE LOG 'Error creating user profile for ID %: %', NEW.id, SQLERRM;
                -- Non bloccare la registrazione per errori nella tabella user
                -- L'utente può comunque autenticarsi tramite auth.users
        END;
        
    -- Gestisce UPDATE (aggiornamento utente esistente)
    ELSIF TG_OP = 'UPDATE' THEN
        BEGIN
            UPDATE public.user SET
                email = NEW.email,
                full_name = COALESCE(
                    NEW.user_metadata->>'full_name',
                    NEW.user_metadata->>'name',
                    NEW.raw_user_meta_data->>'full_name',
                    NEW.raw_user_meta_data->>'name',
                    full_name
                ),
                avatar_url = COALESCE(
                    NEW.user_metadata->>'avatar_url',
                    NEW.user_metadata->>'picture',
                    NEW.raw_user_meta_data->>'avatar_url',
                    NEW.raw_user_meta_data->>'picture',
                    avatar_url
                ),
                provider = user_provider,
                email_verified = user_verified,
                updated_at = NOW()
            WHERE id = NEW.id;
            
            RAISE LOG 'User profile updated successfully for ID: %', NEW.id;
            
        EXCEPTION
            WHEN OTHERS THEN
                RAISE LOG 'Error updating user profile for ID %: %', NEW.id, SQLERRM;
                -- Non bloccare l'aggiornamento per errori nella tabella user
        END;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Crea i trigger per INSERT e UPDATE su auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Funzione per aggiornare automaticamente updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Trigger per aggiornare automaticamente updated_at nella tabella user
DROP TRIGGER IF EXISTS handle_updated_at ON public.user;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.user
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Commento di verifica
-- Trigger handle_new_user creato con gestione errori robusta e logging