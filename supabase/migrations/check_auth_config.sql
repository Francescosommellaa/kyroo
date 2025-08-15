-- Verifica utenti non confermati
SELECT 
    'Unconfirmed users' as check_type,
    email,
    email_confirmed_at,
    confirmation_sent_at,
    confirmation_token IS NOT NULL as has_confirmation_token,
    created_at,
    CASE 
        WHEN email_confirmed_at IS NULL AND confirmation_sent_at IS NOT NULL THEN 'Email inviata ma non confermata'
        WHEN email_confirmed_at IS NULL AND confirmation_sent_at IS NULL THEN 'Nessuna email inviata'
        ELSE 'Email confermata'
    END as status
FROM auth.users 
WHERE email_confirmed_at IS NULL 
ORDER BY created_at DESC 
LIMIT 10;

-- Verifica tutti i tipi di token disponibili
SELECT 
    'Token types available' as check_type,
    token_type,
    COUNT(*) as count,
    MAX(created_at) as latest_token
FROM auth.one_time_tokens 
GROUP BY token_type;

-- Verifica token di conferma specifici
SELECT 
    'Confirmation tokens' as check_type,
    u.email,
    ott.token_type,
    ott.created_at as token_created,
    u.confirmation_sent_at,
    u.email_confirmed_at
FROM auth.one_time_tokens ott
JOIN auth.users u ON ott.user_id = u.id
WHERE ott.token_type = 'confirmation_token'
ORDER BY ott.created_at DESC
LIMIT 5;

-- Verifica audit log recenti (usando payload per identificare eventi)
SELECT 
    'Recent audit events' as check_type,
    payload->>'action' as action_type,
    COUNT(*) as count,
    MAX(created_at) as latest_event
FROM auth.audit_log_entries 
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY payload->>'action'
ORDER BY latest_event DESC;