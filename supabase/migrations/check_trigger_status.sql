-- Verifica lo stato del trigger handle_new_user e identifica errori

-- 1. Verifica se il trigger esiste
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name LIKE '%handle_new_user%' OR trigger_name LIKE '%on_auth_user%';

-- 2. Verifica se la funzione handle_new_user esiste
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- 3. Verifica se ci sono conflitti di nomi nelle colonne
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE column_name = 'trigger_name' 
AND table_schema IN ('public', 'auth', 'information_schema');

-- 4. Verifica la struttura della tabella user
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Verifica eventuali errori nei trigger esistenti
SELECT 
    t.trigger_name,
    t.event_object_table,
    t.action_statement,
    r.routine_definition
FROM information_schema.triggers t
LEFT JOIN information_schema.routines r ON r.routine_name = SUBSTRING(t.action_statement FROM 'EXECUTE FUNCTION ([^(]+)');