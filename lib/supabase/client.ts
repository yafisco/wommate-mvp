import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Crée un client Supabase pour une utilisation dans le navigateur (Client Components)
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
