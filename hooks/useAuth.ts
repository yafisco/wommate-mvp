'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  id: string
  nom_complet: string | null
  email: string | null
  role: string
  filiere: string | null
  niveau: string | null
}

interface AuthUser extends User {
  nom_complet?: string | null
  role?: string
  filiere?: string | null
  niveau?: string | null
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Récupère l'utilisateur connecté et son profil au montage du hook
    const getActiveUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (authUser) {
          // Récupérer le profil depuis la table profils
          const { data: profile } = await supabase
            .from('profils')
            .select('*')
            .eq('id', authUser.id)
            .single()
          
          setUser({
            ...authUser,
            nom_complet: profile?.nom_complet || null,
            role: profile?.role || 'etudiant',
            filiere: profile?.filiere || null,
            niveau: profile?.niveau || null
          })
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Erreur de récupération de session auth:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getActiveUser()

    // Écoute les changements de statut auth de Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          // Récupérer le profil depuis la table profils
          const { data: profile } = await supabase
            .from('profils')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          setUser({
            ...session.user,
            nom_complet: profile?.nom_complet || null,
            role: profile?.role || 'etudiant',
            filiere: profile?.filiere || null,
            niveau: profile?.niveau || null
          })
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return { user, loading, isAuthenticated: !!user }
}
