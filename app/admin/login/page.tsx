'use client'

import React, { useState } from 'react'
import Container from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Vérifier si l'utilisateur est admin
      const { data: profil } = await supabase
        .from('profils')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profil?.role !== 'admin') {
        await supabase.auth.signOut()
        throw new Error('Accès refusé. Vous n\'êtes pas administrateur.')
      }

      router.push('/admin')
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex-1 py-12 pb-24 md:pb-12 animate-slide-up">
      <Container className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md p-8">
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h1 className="font-display text-2xl font-bold text-indigo-nuit">
                Connexion Admin
              </h1>
              <p className="text-sm text-brume mt-2">
                Accès réservé aux administrateurs
              </p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-medium text-indigo-nuit">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-indigo-nuit/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-attaya"
                  placeholder="admin@wommate.com"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-sm font-medium text-indigo-nuit">
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-indigo-nuit/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-attaya"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-terre/10 border border-terre/20 rounded-lg">
                  <p className="text-sm text-terre">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>

            <div className="text-center">
              <a
                href="/"
                className="text-sm text-brume hover:text-attaya transition-colors"
              >
                ← Retour à l'accueil
              </a>
            </div>
          </div>
        </Card>
      </Container>
    </main>
  )
}
