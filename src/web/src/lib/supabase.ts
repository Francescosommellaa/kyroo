import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Configuração Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug logging per verificare le variabili d'ambiente
console.log('🔍 Debug Supabase Environment Variables:')
console.log('VITE_SUPABASE_URL:', supabaseUrl)
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 10)}...` : 'undefined')
console.log('All env vars:', import.meta.env)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.error('supabaseUrl:', supabaseUrl)
  console.error('supabaseAnonKey:', supabaseAnonKey)
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'kyroo-web'
    }
  }
})

// Debug logging per verificare l'inizializzazione del client
console.log('✅ Supabase client created successfully')
console.log('Supabase client:', supabase)

// Test di connessione
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ Errore nel test di connessione Supabase:', error)
  } else {
    console.log('✅ Test di connessione Supabase riuscito')
    console.log('Session data:', data)
  }
}).catch(err => {
  console.error('❌ Errore critico nella connessione Supabase:', err)
})

// Log di configurazione (solo in sviluppo)
if (import.meta.env.DEV) {
  console.log('🔧 Supabase configured:', {
    url: supabaseUrl,
    hasKey: !!supabaseAnonKey,
    keyLength: supabaseAnonKey?.length || 0,
    env: import.meta.env
  })

  // Debug aggiuntivo
  console.log('🔍 Environment check:', {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING'
  })
}

// Helper types
export type Profile = Database['public']['Tables']['users']['Row']
export type ProfileUpdate = Database['public']['Tables']['users']['Update']
export type ProfileInsert = Database['public']['Tables']['users']['Insert']
