import { createClient } from '@supabase/supabase-js'

// Environment variables with fallback and validation
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

// Validate environment variables at startup
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseServiceKey,
    url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'missing'
  })
}

// Create admin client only if we have the required variables
let supabaseAdmin: any = null
if (supabaseUrl && supabaseServiceKey) {
  try {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  } catch (error) {
    console.error('Failed to create Supabase client:', error)
  }
}

interface AdminRequest {
  action: 'update_user_role' | 'update_user_plan' | 'start_trial' | 'update_custom_limits'
  userId: string
  role?: 'user' | 'admin'
  plan?: string
  expiresAt?: string
  customLimits?: any
}

export default async function handler(request: Request) {
  console.log('Admin function called:', request.method, request.url)

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    // Check if Supabase client is available
    if (!supabaseAdmin) {
      console.error('Supabase client not initialized')
      return new Response(JSON.stringify({
        error: 'Server configuration error',
        details: 'Supabase client not available'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Verify admin authorization
    const authHeader = request.headers.get('Authorization')
    console.log('Auth header present:', !!authHeader)

    if (!authHeader?.startsWith('Bearer ')) {
      console.log('Missing or invalid authorization header')
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const token = authHeader.replace('Bearer ', '')
    console.log('Token extracted, length:', token.length)

    // Verify the user is authenticated and is admin
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError) {
      console.error('Auth error:', authError)
      return new Response(JSON.stringify({
        error: 'Invalid token',
        details: authError.message
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!user) {
      console.log('No user found for token')
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('User authenticated:', user.id)

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile error:', profileError)
      return new Response(JSON.stringify({
        error: 'Profile not found',
        details: profileError.message
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('User role:', profile?.role)

    if (profile?.role !== 'admin') {
      console.log('Access denied - user is not admin')
      return new Response(JSON.stringify({ error: 'Access denied' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Handle different admin actions
    if (request.method === 'GET') {
      const url = new URL(request.url)
      const action = url.searchParams.get('action')
      const userId = url.searchParams.get('userId')

      // Handle get_user_profile action
      if (action === 'get_user_profile' && userId) {
        console.log('Fetching user profile for:', userId)

        try {
          const { data: userProfile, error } = await supabaseAdmin
            .from('user')
            .select('id, display_name, custom_limits, plan, role')
            .eq('id', userId)
            .single()

          if (error) {
            console.error('User profile fetch error:', error)
            return new Response(JSON.stringify({
              error: 'Failed to fetch user profile',
              details: error.message
            }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }

          console.log('User profile fetched successfully:', userProfile)
          return new Response(JSON.stringify(userProfile), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } catch (fetchError) {
          console.error('Unexpected error fetching user profile:', fetchError)
          return new Response(JSON.stringify({
            error: 'Unexpected error',
            details: fetchError instanceof Error ? fetchError.message : 'Unknown error'
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      }

      // Default: List all users
      console.log('Fetching users list...')

      try {
        // List all users with simplified query first
        const { data: users, error } = await supabaseAdmin
          .from('user')
          .select('id, display_name, phone, avatar_url, role, plan, plan_expires_at, trial_start_date, trial_used, created_at, updated_at')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Users fetch error:', error)
          return new Response(JSON.stringify({
            error: 'Failed to fetch users',
            details: error.message,
            code: error.code,
            hint: error.hint
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        console.log('Users fetched successfully:', users?.length || 0)
        console.log('Sample user data:', users?.[0] ? Object.keys(users[0]) : 'No users')

        return new Response(JSON.stringify({ users: users || [] }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      } catch (fetchError) {
        console.error('Unexpected error fetching users:', fetchError)
        return new Response(JSON.stringify({
          error: 'Unexpected error',
          details: fetchError instanceof Error ? fetchError.message : 'Unknown error',
          stack: fetchError instanceof Error ? fetchError.stack : 'No stack'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    if (request.method === 'PUT') {
      const body: AdminRequest = await request.json()

      // Handle different PUT actions
      if (body.action === 'update_user_role') {
        if (!body.userId || !body.role) {
          return new Response(JSON.stringify({ error: 'Invalid request' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Prevent self-demotion
        if (body.userId === user.id && body.role !== 'admin') {
          return new Response(JSON.stringify({ error: 'Cannot demote yourself' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Linea 246 - Correzione update role
        const { error } = await supabaseAdmin
          .from('user')
          .update({ role: body.role })
          .eq('id', body.userId)

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Handle plan update
      if (body.action === 'update_user_plan') {
        if (!body.userId || !body.plan) {
          return new Response(JSON.stringify({ error: 'Invalid request - missing userId or plan' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const updateData: any = { plan: body.plan }

        // If expiresAt is provided, add it to the update
        if (body.expiresAt) {
          updateData.plan_expires_at = body.expiresAt
        }

        // Linea 280 - Correzione update plan
        const { error } = await supabaseAdmin
          .from('user')
          .update(updateData)
          .eq('id', body.userId)

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Handle trial start
      if (body.action === 'start_trial') {
        if (!body.userId) {
          return new Response(JSON.stringify({ error: 'Invalid request - missing userId' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Calculate trial expiration (7 days from now)
        const trialStartDate = new Date()
        const trialEndDate = new Date()
        trialEndDate.setDate(trialEndDate.getDate() + 7)

        // Linea 312 - Correzione start trial
        const { error } = await supabaseAdmin
          .from('user')
          .update({
            plan: 'pro',
            trial_start_date: trialStartDate.toISOString(),
            plan_expires_at: trialEndDate.toISOString(),
            trial_used: true
          })
          .eq('id', body.userId)

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Handle custom limits update
      if (body.action === 'update_custom_limits') {
        if (!body.userId || !body.customLimits) {
          return new Response(JSON.stringify({ error: 'Invalid request - missing userId or customLimits' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Linea 344 - Correzione update custom limits
        const { error } = await supabaseAdmin
          .from('user')
          .update({ custom_limits: body.customLimits })
          .eq('id', body.userId)

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // If no valid action found
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (request.method === 'DELETE') {
      // Delete user
      const url = new URL(request.url)
      const userId = url.searchParams.get('userId')

      if (!userId) {
        return new Response(JSON.stringify({ error: 'Missing userId' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Prevent self-deletion
      if (userId === user.id) {
        return new Response(JSON.stringify({ error: 'Cannot delete yourself' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Delete user from auth (this will cascade to user via trigger)
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Admin API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : 'No stack trace'

    console.error('Error stack:', errorStack)

    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: errorMessage,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}
