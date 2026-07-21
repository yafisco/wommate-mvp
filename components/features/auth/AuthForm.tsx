'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login, signup } from '@/lib/actions/auth.actions'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'

interface AuthFormProps {
  mode: 'login' | 'register'
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  const isLogin = mode === 'login'

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    
    // Validation côté client pour l'inscription
    if (!isLogin) {
      const password = formData.get('password') as string
      const confirmPassword = formData.get('confirmPassword') as string
      
      if (password !== confirmPassword) {
        setError('Les mots de passe ne correspondent pas.')
        setLoading(false)
        return
      }
    }

    const action = isLogin ? login : signup
    const result = await action(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else if (result?.needsEmailConfirmation) {
      setIsSuccess(true)
      setLoading(false)
    } else {
      router.push(isLogin ? '/' : '/onboarding')
    }
  }

  async function handleOAuth(provider: 'google' | 'github') {
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    }
  }

  if (isSuccess && !isLogin) {
    return (
      <Card className="w-full max-w-md mx-auto p-6 md:p-8 text-center">
        <div className="w-16 h-16 bg-pousse/10 text-pousse rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-display font-bold text-indigo-nuit mb-2">Vérifiez vos emails</h2>
        <p className="text-brume mb-6">
          Un lien de confirmation a été envoyé à votre adresse. Veuillez cliquer dessus pour valider votre compte.
        </p>
        <Link href="/login">
          <Button variant="primary" className="w-full">
            Retour à la connexion
          </Button>
        </Link>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto p-6 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-display text-indigo-nuit font-bold mb-2">
          {isLogin ? 'Rebonjour !' : 'Rejoindre le Grin'}
        </h1>
        <p className="text-brume text-sm">
          {isLogin 
            ? 'Connectez-vous pour accéder à la communauté' 
            : 'Créez votre compte pour commencer à échanger'}
        </p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        {!isLogin && (
          <Input
            label="Nom complet"
            name="name"
            id="name"
            type="text"
            required
            placeholder="Aïssatou Diallo"
          />
        )}
        
        <Input
          label="Email étudiant"
          name="email"
          id="email"
          type="email"
          required
          placeholder="prenom.nom@universite.edu"
        />
        
        <Input
          label="Mot de passe"
          name="password"
          id="password"
          type="password"
          required
          placeholder="••••••••"
        />

        {!isLogin && (
          <Input
            label="Confirmer le mot de passe"
            name="confirmPassword"
            id="confirmPassword"
            type="password"
            required
            placeholder="••••••••"
          />
        )}

        {error && (
          <div className="p-3 bg-terre/10 border border-terre/20 text-terre text-sm rounded-xl">
            {error}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Chargement...' : isLogin ? 'Se connecter' : "S'inscrire"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-brume">
        {isLogin ? (
          <div className="space-y-2">
            <p>
              Pas encore de compte ?{' '}
              <Link href="/register" className="text-attaya font-medium hover:underline">
                S'inscrire
              </Link>
            </p>
            <p>
              <Link href="/forgot-password" className="text-attaya font-medium hover:underline">
                Mot de passe oublié ?
              </Link>
            </p>
          </div>
        ) : (
          <p>
            Déjà membre ?{' '}
            <Link href="/login" className="text-attaya font-medium hover:underline">
              Se connecter
            </Link>
          </p>
        )}
      </div>

      {/* Social login */}
      <div className="mt-8 pt-6 border-t border-indigo-nuit/10">
        <div className="relative flex justify-center text-sm mb-4">
          <span className="bg-bone px-2 text-brume absolute -top-3">Ou continuer avec</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" className="w-full flex items-center justify-center gap-2" type="button" onClick={() => handleOAuth('google')}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </Button>
          <Button variant="secondary" className="w-full flex items-center justify-center gap-2" type="button" onClick={() => handleOAuth('github')}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub
          </Button>
        </div>
      </div>
    </Card>
  )
}
