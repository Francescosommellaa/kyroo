#!/usr/bin/env python3
"""
Script per creare il bucket 'avatars' su Supabase Storage
"""

import os
import requests
import json
from dotenv import load_dotenv

# Carica le variabili d'ambiente dal file .env.local
load_dotenv('.env.local')

SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("❌ Errore: Variabili d'ambiente VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY richieste")
    exit(1)

def create_avatars_bucket():
    """Crea il bucket 'avatars' su Supabase Storage"""
    
    url = f"{SUPABASE_URL}/storage/v1/bucket"
    
    headers = {
        'Authorization': f'Bearer {SUPABASE_SERVICE_ROLE_KEY}',
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY
    }
    
    bucket_config = {
        'id': 'avatars',
        'name': 'avatars',
        'public': True,
        'allowed_mime_types': ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
        'file_size_limit': 5242880  # 5MB
    }
    
    print("🚀 Creazione bucket 'avatars' su Supabase...")
    print(f"📍 URL: {SUPABASE_URL}")
    
    try:
        response = requests.post(url, headers=headers, json=bucket_config)
        
        if response.status_code == 200:
            print("✅ Bucket 'avatars' creato con successo!")
            print(f"📊 Configurazione: {json.dumps(bucket_config, indent=2)}")
            return True
        elif response.status_code == 400 and "already exists" in response.text:
            print("ℹ️ Bucket 'avatars' già esistente")
            return True
        else:
            print(f"❌ Errore nella creazione del bucket: {response.status_code}")
            print(f"📝 Risposta: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Errore durante la richiesta: {str(e)}")
        return False

def set_bucket_policy():
    """Imposta la policy per permettere upload e lettura pubblica"""
    
    # Policy per permettere upload agli utenti autenticati e lettura pubblica
    policy_sql = """
    -- Policy per permettere agli utenti autenticati di caricare i propri avatar
    CREATE POLICY "Users can upload their own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

    -- Policy per permettere agli utenti autenticati di aggiornare i propri avatar
    CREATE POLICY "Users can update their own avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

    -- Policy per permettere lettura pubblica degli avatar
    CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');
    """
    
    print("📋 Policy SQL da eseguire manualmente su Supabase:")
    print("=" * 60)
    print(policy_sql)
    print("=" * 60)
    print("💡 Vai su Supabase Dashboard > SQL Editor e esegui questo codice")

if __name__ == "__main__":
    print("🔧 Setup Supabase Storage per Avatar")
    print("=" * 40)
    
    success = create_avatars_bucket()
    
    if success:
        print("\n📋 Prossimi passi:")
        print("1. ✅ Bucket 'avatars' creato/verificato")
        print("2. 🔐 Configura le policy di sicurezza (vedi sotto)")
        print("3. 🧪 Testa l'upload dell'avatar nell'app")
        
        print("\n" + "=" * 60)
        set_bucket_policy()
    else:
        print("\n❌ Setup fallito. Controlla le credenziali e riprova.")

