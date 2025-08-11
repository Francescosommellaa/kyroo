import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// In produzione, le variabili vengono fornite da Netlify/Supabase Edge Functions
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

// Solo in sviluppo mostra errori dettagliati
if ((!supabaseUrl || !supabaseAnonKey) && import.meta.env.DEV) {
  console.error('Supabase env missing in development. Check .env.local file.');
}

// In produzione usa valori di fallback se necessario
if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
  console.warn('Using fallback Supabase URL. Configure VITE_SUPABASE_URL in Netlify environment variables.');
}

if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key') {
  console.warn('Using fallback Supabase key. Configure VITE_SUPABASE_ANON_KEY in Netlify environment variables.');
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