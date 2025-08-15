export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          display_name: string | null
          phone: string | null
          avatar_url: string | null
          role: 'user' | 'admin'
          plan: 'free' | 'pro' | 'enterprise'
          plan_expires_at: string | null
          email_verified: boolean
          email_verification_code: string | null
          email_verification_expires_at: string | null
          password_reset_code: string | null
          password_reset_expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          display_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin'
          plan?: 'free' | 'pro' | 'enterprise'
          plan_expires_at?: string | null
          email_verified?: boolean
          email_verification_code?: string | null
          email_verification_expires_at?: string | null
          password_reset_code?: string | null
          password_reset_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          display_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin'
          plan?: 'free' | 'pro' | 'enterprise'
          plan_expires_at?: string | null
          email_verified?: boolean
          email_verification_code?: string | null
          email_verification_expires_at?: string | null
          password_reset_code?: string | null
          password_reset_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_verification_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_verification_code_valid: {
        Args: {
          user_id: string
          code: string
          code_type?: string
        }
        Returns: boolean
      }
      clear_verification_codes: {
        Args: {
          user_id: string
          code_type?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
