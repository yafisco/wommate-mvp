import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Liste des chemins qui nécessitent une authentification
const PROTECTED_ROUTES = ['/demandes', '/ressources', '/messages', '/profil']
const AUTH_ROUTES = ['/login', '/register']

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
    headers: {
      // CSP headers permissifs pour le développement
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.supabase.co; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.supabase.co; font-src 'self'; connect-src 'self' https://*.supabase.co;"
    }
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isProtectedRoute = PROTECTED_ROUTES.some(route => path.startsWith(route))
  const isAuthRoute = AUTH_ROUTES.some(route => path.startsWith(route))

  // 1. Redirection si non connecté sur une route protégée
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 2. Redirection si connecté sur une page de login/register
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // 3. Vérification du profil si connecté
  if (user && !path.startsWith('/auth/callback')) {
    // Si l'utilisateur est sur l'onboarding, on le laisse tranquille
    if (path === '/onboarding') {
      return supabaseResponse
    }

    // On vérifie si le profil est complet (filiere est notre critère d'onboarding minimum)
    const { data: profil } = await supabase
      .from('profils')
      .select('filiere')
      .eq('id', user.id)
      .single()

    const isProfileIncomplete = !profil || !profil.filiere

    if (isProfileIncomplete) {
      // Si incomplet et qu'il n'est pas sur /onboarding, on le redirige
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    } else if (path === '/onboarding') {
      // Si complet et qu'il essaie d'aller sur /onboarding, on le renvoie à l'accueil
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
