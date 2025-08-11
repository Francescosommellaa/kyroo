import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase, type Profile } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>
  uploadAvatar: (file: File) => Promise<{ error: Error | null; url?: string }>
  logout: () => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.warn('Session loading error:', error.message)
        setSession(null)
        setUser(null)
        setProfile(null)
        setLoading(false)
        return
      }

      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        loadProfile(session.user.id).finally(() => {
          setLoading(false)
        })
      } else {
        setLoading(false)
      }
    }).catch((error) => {
      console.warn('Session loading exception:', error)
      setSession(null)
      setUser(null)
      setProfile(null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id)
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId: string) => {
    try {
      // Optimized timeout for better UX (2 seconds instead of 5)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile loading timeout')), 2000)
      )
      
      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any

      if (error) {
        console.warn('Profile loading error:', error.message)
        setProfile(null)
        return
      }
      
      setProfile(data)
    } catch (error) {
      console.warn('Profile loading exception:', error)
      setProfile(null)
    }
  }

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName
          }
        }
      })
      return { error }
    } catch (err) {
      return { error: { message: 'Errore di connessione' } as any }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      return { error }
    } catch (err) {
      return { error: { message: 'Errore di connessione' } as any }
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    return { error }
  }

  const logout = signOut

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password })
    return { error }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('Non autenticato') }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error

      // Reload profile
      await loadProfile(user.id)
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const uploadAvatar = async (file: File) => {
    if (!user) return { error: new Error('Non autenticato') }

    try {
      console.log('Starting avatar upload for user:', user.id)
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/avatar.${fileExt}`
      
      console.log('Uploading file:', fileName)

      // First, try to remove existing file (ignore errors)
      await supabase.storage
        .from('avatars')
        .remove([fileName])
        .catch(() => {}) // Ignore removal errors

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        
        // If bucket doesn't exist, show helpful error
        if (uploadError.message.includes('Bucket not found')) {
          return { error: new Error('Il bucket per gli avatar non è configurato. Contatta il supporto.') }
        }
        
        throw uploadError
      }

      console.log('File uploaded successfully')

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      console.log('Generated public URL:', data.publicUrl)

      // Update profile with new avatar URL
      const updateResult = await updateProfile({ avatar_url: data.publicUrl })
      
      if (updateResult.error) {
        console.error('Profile update error:', updateResult.error)
        throw updateResult.error
      }

      console.log('Avatar updated successfully')
      return { error: null, url: data.publicUrl }
    } catch (error) {
      console.error('Avatar upload failed:', error)
      return { error: error as Error }
    }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    logout,
    resetPassword,
    updatePassword,
    updateProfile,
    uploadAvatar
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}