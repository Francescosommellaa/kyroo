import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Esplicito nello sviluppare in Bolt/preview
  // Evita ReferenceError e spiega il fix
  console.error('Supabase env missing', { 
    hasUrl: !!supabaseUrl, 
    hasAnon: !!supabaseAnonKey,
    url: supabaseUrl ? 'presente' : 'mancante',
    key: supabaseAnonKey ? 'presente' : 'mancante'
  });
  throw new Error('Missing Supabase environment variables. Controlla .env.local');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']