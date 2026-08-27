'use client'

import { createClient } from '@/lib/supabase/client'

export async function getCurrentUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  window.location.href = '/'
}