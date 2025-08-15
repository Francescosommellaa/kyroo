-- Corregge la funzione check_trigger_exists con parametri corretti
-- Elimina la funzione esistente se presente
DROP FUNCTION IF EXISTS public.check_trigger_exists(text);
DROP FUNCTION IF EXISTS public.check_trigger_exists(trigger_name text);

-- Crea la funzione corretta con parametro p_trigger_name
CREATE OR REPLACE FUNCTION public.check_trigger_exists(p_trigger_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM information_schema.triggers 
        WHERE trigger_name = p_trigger_name
        AND event_object_schema = 'public'
    );
END;
$$;

-- Garantisce i permessi corretti
GRANT EXECUTE ON FUNCTION public.check_trigger_exists(text) TO anon, authenticated;

-- Verifica che la funzione sia stata creata correttamente
SELECT 'Funzione check_trigger_exists creata con successo' as status;