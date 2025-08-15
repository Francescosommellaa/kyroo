-- Query per verificare utenti non confermati e token di conferma
SELECT 
    id, 
    email, 
    email_confirmed_at, 
    confirmation_sent_at, 
    confirmation_token IS NOT NULL as has_token, 
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

-- Verifica anche la configurazione email
SELECT 
    'Email configuration check' as info,
    COUNT(*) as unconfirmed_users
FROM auth.users 
WHERE email_confirmed_at IS NULL;