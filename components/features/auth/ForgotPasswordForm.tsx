'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto p-6 md:p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-pousse/20 text-pousse flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-display font-bold text-indigo-nuit mb-2">
          Email envoyé !
        </h2>
        <p className="text-sm text-brume mb-6">
          Un lien de réinitialisation a été envoyé à votre adresse email. Veuillez vérifier votre boîte de réception et suivre les instructions.
        </p>
        <Button onClick={() => router.push('/login')} variant="primary" className="w-full">
          Retour à la connexion
        </Button>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto p-6 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-display text-indigo-nuit font-bold mb-2">
          Mot de passe oublié ?
        </h1>
        <p className="text-sm text-brume">
          Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          name="email"
          id="email"
          type="email"
          required
          placeholder="prenom.nom@universite.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-brume">
        <p>
          Vous vous souvenez de votre mot de passe ?{' '}
          <button
            onClick={() => router.push('/login')}
            className="text-attaya font-medium hover:underline"
          >
            Se connecter
          </button>
        </p>
      </div>
    </Card>
  )
}
