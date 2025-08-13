import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Configurazione Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validazione variabili d'ambiente
if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars = []
  if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL')
  if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY')

  const errorMsg = `Missing Supabase environment variables: ${missingVars.join(', ')}`

  if (import.meta.env.DEV) {
    console.error(`❌ ${errorMsg}`)
    console.error('📝 Create .env.local from .env.example in project root and add your Supabase credentials')
  } else {
    console.error(`❌ ${errorMsg}`)
    console.error('📝 Configure environment variables in Netlify dashboard')
  }

  throw new Error(errorMsg)
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
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
export type Profile = Database['public']['Tables']['user']['Row']
export type ProfileUpdate = Database['public']['Tables']['user']['Update']
export type ProfileInsert = Database['public']['Tables']['user']['Insert']
