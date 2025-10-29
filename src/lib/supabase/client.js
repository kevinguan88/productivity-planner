'use client'

import { createBrowserClient } from '@supabase/ssr'

// Browser-safe Supabase client with anon key
// This client is for browser use with limited privileges

let supabaseInstance = null

export function createClient() {
  // Reuse instance if it exists (singleton pattern)
  if (supabaseInstance) {
    return supabaseInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.'
    )
  }

  supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey)

  return supabaseInstance
}
