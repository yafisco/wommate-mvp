import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  // Crée un client Supabase pour une utilisation côté serveur (Server Components, Actions, Routes)
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Le cookieStore.set() peut lever une exception s'il est appelé depuis un Server Component.
            // C'est géré et rattrapé par le middleware de rafraîchissement des sessions.
          }
        },
      },
    }
  )
}
