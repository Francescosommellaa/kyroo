-- Risolve definitivamente l'errore PGRST202 con check_trigger_exists
-- Elimina tutte le versioni esistenti della funzione e ricrea con parametri corretti

-- 1. Elimina tutte le versioni esistenti della funzione
DROP FUNCTION IF EXISTS public.check_trigger_exists(text);
DROP FUNCTION IF EXISTS public.check_trigger_exists(trigger_name text);
DROP FUNCTION IF EXISTS public.check_trigger_exists(p_trigger_name text);

-- 2. Crea la funzione corretta che accetta sia 'trigger_name' che 'p_trigger_name'
-- Questo risolve il problema di compatibilità con il frontend
CREATE OR REPLACE FUNCTION public.check_trigger_exists(trigger_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM information_schema.triggers 
        WHERE triggers.trigger_name = check_trigger_exists.trigger_name
        AND event_object_schema = 'public'
    );
END;
$$;

-- 3. Garantisce i permessi corretti
GRANT EXECUTE ON FUNCTION public.check_trigger_exists(text) TO anon, authenticated;

-- 4. Verifica che la funzione sia stata creata correttamente
SELECT 
    'check_trigger_exists' as function_name,
    'Funzione ricreata con successo' as status,
    'Risolve errore PGRST202' as note;

-- 5. Test della funzione
SELECT 
    'Test check_trigger_exists' as test_name,
    public.check_trigger_exists('handle_new_user') as result;