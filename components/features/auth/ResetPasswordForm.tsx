'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    // Vérifier si le token de récupération est présent dans l'URL
    const accessToken = searchParams.get('access_token')
    if (!accessToken) {
      setError('Lien de réinitialisation invalide ou expiré. Veuillez demander un nouveau lien.')
    }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      setLoading(false)
      return
    }

    try {
      // Récupérer le token de l'URL
      const accessToken = searchParams.get('access_token')
      
      if (!accessToken) {
        throw new Error('Token de récupération manquant')
      }

      // Définir la session avec le token de récupération
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: searchParams.get('refresh_token') || ''
      })

      if (sessionError) {
        throw sessionError
      }

      // Maintenant que la session est active, mettre à jour le mot de passe
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        throw error
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue. Le lien a peut-être expiré.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto p-6 md:p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-pousse/20 text-pousse flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-display font-bold text-indigo-nuit mb-2">
          Mot de passe modifié !
        </h2>
        <p className="text-sm text-brume mb-6">
          Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion.
        </p>
        <Button onClick={() => router.push('/login')} variant="primary" className="w-full">
          Se connecter
        </Button>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto p-6 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-display text-indigo-nuit font-bold mb-2">
          Nouveau mot de passe
        </h1>
        <p className="text-sm text-brume">
          Entrez votre nouveau mot de passe pour terminer la réinitialisation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nouveau mot de passe"
          name="password"
          id="password"
          type="password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
        />

        <Input
          label="Confirmer le mot de passe"
          name="confirmPassword"
          id="confirmPassword"
          type="password"
          required
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          minLength={6}
        />

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
          {loading ? 'Modification en cours...' : 'Modifier le mot de passe'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-brume">
        <button
          onClick={() => router.push('/login')}
          className="text-attaya font-medium hover:underline"
        >
          Annuler
        </button>
      </div>
    </Card>
  )
}
