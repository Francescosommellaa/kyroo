import { createClient } from '@supabase/supabase-js'

// Signup function
export async function signUp(email: string, password: string, displayName: string) {
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!
  )

  // Client-side validation
  if (displayName.length < 2 || displayName.length > 50) {
    throw new Error('Display name must be between 2 and 50 characters')
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long')
  }

  // Attempt signup
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  })

  if (error) {
    throw error
  }

  return data
}

// Login function
export async function signIn(email: string, password: string) {
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    throw error
  }

  return data
}

// Password reset function
export async function resetPassword(email: string) {
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/callback`
  })

  if (error) {
    throw error
  }

  return data
}
