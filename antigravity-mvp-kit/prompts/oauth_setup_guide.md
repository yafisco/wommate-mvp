# Guide d'Implémentation Authentification Sociale (Google/GitHub)

## 📋 Étape 1 : Configuration Google OAuth

### 1.1 Créer un projet Google Cloud Console

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Connectez-vous avec votre compte Google
3. Cliquez sur "Sélectionner un projet" → "Nouveau projet"
4. Nom du projet : `Wommate-Auth`
5. Cliquez sur "Créer"

### 1.2 Activer Google+ API

1. Dans le menu, allez dans "API et services" → "Bibliothèque"
2. Recherchez "Google+ API"
3. Cliquez sur "Activer"

### 1.3 Créer des identifiants OAuth

1. Allez dans "API et services" → "Identifiants"
2. Cliquez sur "Créer des identifiants" → "ID client OAuth"
3. Type d'application : "Application web"
4. Nom : `Wommate Web Client`
5. Origines JavaScript autorisées :
   ```
   http://localhost:3000
   https://votre-domaine.vercel.app
   ```
6. URI de redirection autorisés :
   ```
   https://imdejfxjhmacnbnfmzgp.supabase.co/auth/v1/callback
   ```
7. Cliquez sur "Créer"
8. **Copiez le Client ID et le Client Secret** (vous en aurez besoin)

---

## 📋 Étape 2 : Configuration GitHub OAuth

### 2.1 Créer une application OAuth GitHub

1. Allez sur [GitHub Developer Settings](https://github.com/settings/developers)
2. Cliquez sur "New OAuth App"
3. Application name : `Wommate`
4. Homepage URL : `https://votre-domaine.vercel.app`
5. Application description : `Plateforme d'entraide étudiante`
6. Authorization callback URL :
   ```
   https://imdejfxjhmacnbnfmzgp.supabase.co/auth/v1/callback
   ```
7. Cliquez sur "Register application"
8. **Copiez le Client ID et générez un Client Secret** (vous en aurez besoin)

---

## 📋 Étape 3 : Configuration OAuth dans Supabase

### 3.1 Activer Google OAuth

1. Allez sur votre [Dashboard Supabase](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans "Authentication" → "Providers"
4. Activez "Google"
5. Collez le **Client ID** et **Client Secret** de Google
6. Activez "Sign up" et "Link" si nécessaire
7. Cliquez sur "Save"

### 3.2 Activer GitHub OAuth

1. Dans "Authentication" → "Providers"
2. Activez "GitHub"
3. Collez le **Client ID** et **Client Secret** de GitHub
4. Activez "Sign up" et "Link" si nécessaire
5. Cliquez sur "Save"

### 3.3 Configurer l'URL du site

1. Allez dans "Authentication" → "URL Configuration"
2. Site URL : `https://votre-domaine.vercel.app`
3. Redirect URLs :
   ```
   http://localhost:3000/auth/callback
   https://votre-domaine.vercel.app/auth/callback
   ```
4. Cliquez sur "Save"

---

## 📋 Étape 4 : Mise à jour des Variables d'Environnement

Ajoutez ces variables dans votre fichier `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
```

**Note :** Les clés OAuth sont stockées directement dans Supabase, pas dans les variables d'environnement Next.js.

---

## 📋 Étape 5 : Créer la Page de Callback OAuth

Créez le fichier `app/auth/callback/route.ts` :

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return redirect(next)
}
```

---

## 📋 Étape 6 : Mettre à jour la Page de Login

Modifiez `app/login/page.tsx` pour ajouter les boutons sociaux :

```typescript
'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleGoogleLogin = async () => {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  }

  const handleGitHubLogin = async () => {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Connexion</h1>
        
        {/* Boutons sociaux */}
        <div className="space-y-3 mb-6">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuer avec Google
          </button>

          <button
            onClick={handleGitHubLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Continuer avec GitHub
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">ou</span>
          </div>
        </div>

        {/* Formulaire email existant */}
        {/* ... votre formulaire existant ... */}

        <p className="text-center text-sm text-gray-600">
          Pas encore de compte ?{' '}
          <Link href="/register" className="text-blue-600 hover:underline">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  )
}
```

---

## 📋 Étape 7 : Mettre à jour la Page d'Inscription

Modifiez `app/register/page.tsx` de manière similaire avec les mêmes boutons sociaux.

---

## 📋 Étape 8 : Gestion Automatique du Profil

Créez un trigger dans Supabase pour créer automatiquement le profil après l'inscription OAuth :

```sql
-- Trigger pour créer le profil après inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profils (id, nom_complet, email, role, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Utilisateur'),
    NEW.email,
    'etudiant',
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## 📋 Étape 9 : Tests

1. **Test Google :**
   - Cliquez sur "Continuer avec Google"
   - Autorisez l'application
   - Vérifiez que vous êtes redirigé et connecté
   - Vérifiez que le profil est créé dans Supabase

2. **Test GitHub :**
   - Cliquez sur "Continuer avec GitHub"
   - Autorisez l'application
   - Vérifiez que vous êtes redirigé et connecté
   - Vérifiez que le profil est créé dans Supabase

3. **Test Complétion Profil :**
   - Après connexion OAuth, redirigez vers `/profil`
   - Demandez à l'utilisateur de compléter filière et niveau

---

## 📋 Étape 10 : Déploiement

1. Mettez à jour les URLs dans Google Console et GitHub pour le domaine de production
2. Mettez à jour les redirect URLs dans Supabase
3. Déployez sur Vercel
4. Testez en production

---

## ⚠️ Notes Importantes

- **Sécurité :** Ne partagez jamais vos Client Secrets
- **HTTPS :** OAuth nécessite HTTPS en production
- **Domaine :** Assurez-vous que le domaine est correctement configuré
- **Profil :** Les utilisateurs OAuth devront compléter leur profil (filière, niveau) après la première connexion

---

**Date de création :** 2026-07-18  
**Complexité :** Moyenne  
**Durée estimée :** 1-2 heures (configuration OAuth) + 30 min (implémentation)
