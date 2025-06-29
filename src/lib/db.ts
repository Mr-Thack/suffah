import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import {
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY,
} from '$env/static/public'

if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase environment variables: PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY',
  )
}

// Simple singleton pattern
function createSupabaseClient(): SupabaseClient {
  return createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    auth: {
      detectSessionInUrl: true,
      persistSession: true,
    },
  })
}

// Create singleton instance
let supabaseInstance: SupabaseClient | undefined

// Check if db already exists before creating a new connection
function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient()
  }
  return supabaseInstance
}

export const db: SupabaseClient = getSupabaseClient()

export async function isSuperAdmin() {
  const user = await getUserInfo()
  return !!user.is_super_admin
}

export async function getUserInfo() {
  // get the current user
  const {
    data: { session },
    error,
  } = await db.auth.getSession()

  if (error || !session) {
    return false
  }

  console.log('User Info:', session.user)
  return session.user
}
