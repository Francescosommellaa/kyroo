#!/usr/bin/env python3
"""
Script per creare un utente admin nel sistema KYROO
"""

import os
import sys
import requests
import json
from dotenv import load_dotenv

# Carica le variabili d'ambiente
load_dotenv('../.env.local')

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("❌ Errore: Variabili d'ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY non trovate")
    sys.exit(1)

def create_admin_user(email, password, display_name=None):
    """
    Crea un nuovo utente admin utilizzando l'API di Supabase
    """
    
    # Headers per le richieste API
    headers = {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': f'Bearer {SUPABASE_SERVICE_ROLE_KEY}',
        'Content-Type': 'application/json'
    }
    
    # Dati per la creazione dell'utente
    user_data = {
        'email': email,
        'password': password,
        'email_confirm': True,  # Conferma automaticamente l'email
        'user_metadata': {
            'display_name': display_name or email.split('@')[0]
        }
    }
    
    try:
        print(f"🔄 Creazione utente admin: {email}")
        
        # Crea l'utente tramite Admin API
        response = requests.post(
            f'{SUPABASE_URL}/auth/v1/admin/users',
            headers=headers,
            json=user_data
        )
        
        if response.status_code != 200:
            print(f"❌ Errore nella creazione dell'utente: {response.status_code}")
            print(f"Risposta: {response.text}")
            return False
            
        user = response.json()
        user_id = user['id']
        
        print(f"✅ Utente creato con successo. ID: {user_id}")
        
        # Aggiorna il profilo per impostare il ruolo admin
        print("🔄 Impostazione ruolo admin...")
        
        profile_data = {
            'role': 'admin',
            'display_name': display_name or email.split('@')[0]
        }
        
        profile_response = requests.patch(
            f'{SUPABASE_URL}/rest/v1/profiles?id=eq.{user_id}',
            headers=headers,
            json=profile_data
        )
        
        if profile_response.status_code not in [200, 204]:
            print(f"⚠️  Avviso: Errore nell'aggiornamento del profilo: {profile_response.status_code}")
            print(f"Risposta: {profile_response.text}")
            print("L'utente è stato creato ma potrebbe non avere il ruolo admin")
            return True
            
        print("✅ Ruolo admin impostato con successo!")
        print(f"📧 Email: {email}")
        print(f"🔑 Password: {password}")
        print(f"👤 Nome visualizzato: {display_name or email.split('@')[0]}")
        print(f"🛡️  Ruolo: admin")
        
        return True
        
    except Exception as e:
        print(f"❌ Errore durante la creazione dell'utente: {str(e)}")
        return False

def main():
    """
    Funzione principale
    """
    print("🚀 KYROO - Creazione Utente Admin")
    print("=" * 40)
    
    # Credenziali dell'admin da creare
    admin_email = "francescosommellaa@gmail.com"
    admin_password = "Plmoknijb098-"
    admin_display_name = "Francesco Sommella"
    
    success = create_admin_user(admin_email, admin_password, admin_display_name)
    
    if success:
        print("\n🎉 Utente admin creato con successo!")
        print("\nPuoi ora accedere alla dashboard con:")
        print(f"Email: {admin_email}")
        print(f"Password: {admin_password}")
        print("\nDopo il login, vedrai il pulsante 'Admin Dashboard' nella sidebar.")
    else:
        print("\n❌ Creazione utente admin fallita!")
        sys.exit(1)

if __name__ == "__main__":
    main()

