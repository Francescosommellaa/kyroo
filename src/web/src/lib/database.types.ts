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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          display_name: string | null
          phone: string | null
          avatar_url: string | null
          role: 'user' | 'admin' | 'moderator'
          plan: 'free' | 'pro' | 'enterprise'
          plan_expires_at: string | null
          email_verified: boolean
          email_verification_code: string | null
          email_verification_expires_at: string | null
          password_reset_code: string | null
          password_reset_expires_at: string | null
          milvus_cluster_id: string | null
          milvus_cluster_endpoint: string | null
          milvus_api_key: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          display_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin' | 'moderator'
          plan?: 'free' | 'pro' | 'enterprise'
          plan_expires_at?: string | null
          email_verified?: boolean
          email_verification_code?: string | null
          email_verification_expires_at?: string | null
          password_reset_code?: string | null
          password_reset_expires_at?: string | null
          milvus_cluster_id?: string | null
          milvus_cluster_endpoint?: string | null
          milvus_api_key?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          display_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin' | 'moderator'
          plan?: 'free' | 'pro' | 'enterprise'
          plan_expires_at?: string | null
          email_verified?: boolean
          email_verification_code?: string | null
          email_verification_expires_at?: string | null
          password_reset_code?: string | null
          password_reset_expires_at?: string | null
          milvus_cluster_id?: string | null
          milvus_cluster_endpoint?: string | null
          milvus_api_key?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      workspaces: {
        Row: {
          id: string
          name: string
          description: string | null
          owner_id: string
          milvus_collection_name: string
          milvus_collection_id: string | null
          settings: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          owner_id: string
          milvus_collection_name: string
          milvus_collection_id?: string | null
          settings?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          owner_id?: string
          milvus_collection_name?: string
          milvus_collection_id?: string | null
          settings?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_workspaces: {
        Row: {
          id: string
          user_id: string
          workspace_id: string
          role: 'owner' | 'admin' | 'member' | 'viewer'
          permissions: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          workspace_id: string
          role?: 'owner' | 'admin' | 'member' | 'viewer'
          permissions?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          workspace_id?: string
          role?: 'owner' | 'admin' | 'member' | 'viewer'
          permissions?: Json
          created_at?: string
          updated_at?: string
        }
      }
      collections: {
        Row: {
          id: string
          workspace_id: string
          name: string
          milvus_collection_name: string
          milvus_collection_id: string | null
          dimension: number
          metric_type: string
          description: string | null
          schema_config: Json
          index_config: Json
          status: 'creating' | 'active' | 'error' | 'deleted'
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          name: string
          milvus_collection_name: string
          milvus_collection_id?: string | null
          dimension?: number
          metric_type?: string
          description?: string | null
          schema_config?: Json
          index_config?: Json
          status?: 'creating' | 'active' | 'error' | 'deleted'
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          name?: string
          milvus_collection_name?: string
          milvus_collection_id?: string | null
          dimension?: number
          metric_type?: string
          description?: string | null
          schema_config?: Json
          index_config?: Json
          status?: 'creating' | 'active' | 'error' | 'deleted'
          error_message?: string | null
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
