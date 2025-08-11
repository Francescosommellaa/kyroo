import { supabaseAnon, supabaseServer } from './supabaseServer'
import type { User } from '@supabase/supabase-js'

export interface AuthError extends Error {
  status: number
}

/**
 * Estrae e verifica il token Bearer dall'header Authorization
 * @param req Request object con headers
 * @returns User object se token valido
 * @throws AuthError se token mancante o invalido
 */
export async function getUserFromBearer(req: Request): Promise<User> {
  const authHeader = req.headers.get('Authorization')
  
  if (!authHeader?.startsWith('Bearer ')) {
    const error = new Error('Missing or invalid Authorization header') as AuthError
    error.status = 401
    throw error
  }

  const token = authHeader.replace('Bearer ', '')
  
  const { data: { user }, error } = await supabaseAnon.auth.getUser(token)
  
  if (error || !user) {
    const authError = new Error('Invalid or expired token') as AuthError
    authError.status = 401
    throw authError
  }

  return user
}

/**
 * Verifica se un utente ha ruolo admin
 * @param userId ID dell'utente da verificare
 * @throws AuthError se utente non è admin
 */
export async function requireAdmin(userId: string): Promise<void> {
  const { data, error } = await supabaseServer
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (error) {
    const authError = new Error('Failed to verify admin status') as AuthError
    authError.status = 500
    throw authError
  }

  if (data?.role !== 'admin') {
    const authError = new Error('Admin access required') as AuthError
    authError.status = 403
    throw authError
  }
}

/**
 * Verifica se un utente ha ruolo admin (versione boolean)
 * @param userId ID dell'utente da verificare
 * @returns true se admin, false altrimenti
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseServer
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (error) return false
    return data?.role === 'admin'
  } catch {
    return false
  }
}

/**
 * Middleware per autenticazione e autorizzazione
 */
export async function withAuth(req: Request): Promise<User> {
  return await getUserFromBearer(req)
}

export async function withAdminAuth(req: Request): Promise<User> {
  const user = await getUserFromBearer(req)
  await requireAdmin(user.id)
  return user
}