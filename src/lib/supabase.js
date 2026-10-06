import { createClient } from '@supabase/supabase-js'

// Bisa dari .env atau dari localStorage (setting di UI)
const envUrl = import.meta.env.VITE_SUPABASE_URL || ''
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

const localUrl = localStorage.getItem('wargaku_supabase_url') || ''
const localKey = localStorage.getItem('wargaku_supabase_key') || ''

export const supabaseUrl = envUrl || localUrl
export const supabaseAnonKey = envKey || localKey

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project')
)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    })
  : null

export function setSupabaseCredentials(url, key) {
  if (url && key) {
    localStorage.setItem('wargaku_supabase_url', url.trim())
    localStorage.setItem('wargaku_supabase_key', key.trim())
  } else {
    localStorage.removeItem('wargaku_supabase_url')
    localStorage.removeItem('wargaku_supabase_key')
  }
  window.location.reload()
}
