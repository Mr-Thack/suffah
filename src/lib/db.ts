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

export const db: SupabaseClient = createClient(
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      detectSessionInUrl: true,
      persistSession: true,
    },
  },
)

export async function isUserSuperAdmin() {
  // get the current user
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error || !session) {
    return false
  }

  // Supabase v2: session.user.user_metadata holds top‑level claims
  const { is_super_admin } = session.user.user_metadata as {
    is_super_admin?: boolean
  }

  return is_super_admin === true
}
