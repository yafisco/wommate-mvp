import React from 'react'
import Link from 'next/link'
import Container from '@/components/layout/Container'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { getGroupesThematiques } from '@/lib/actions/forum.actions'
import { GroupList } from '@/components/features/forum/GroupList'
import { CreateGroupForm } from '@/components/features/forum/CreateGroupForm'
import { createClient } from '@/lib/supabase/server'

export default async function ForumPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Récupérer le rôle de l'utilisateur
  let userRole = 'etudiant'
  if (user) {
    const { data: profil } = await supabase
      .from('profils')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profil) {
      userRole = profil.role
    }
  }

  const groups = await getGroupesThematiques()

  // Récupérer les comptes de sujets par groupe
  const sujetCounts: Record<string, number> = {}
  for (const group of groups) {
    const { count, error } = await supabase
      .from('sujets_forum')
      .select('id', { count: 'exact', head: true })
      .eq('groupe_id', group.id)
    
    if (!error && count !== null) {
      sujetCounts[group.id] = count
    }
  }

  return (
    <main className="flex-1 py-12 pb-24 md:pb-12 animate-slide-up">
      <Container className="flex flex-col gap-8 max-w-6xl">
        {/* En-tête */}
        <div className="flex flex-col gap-2">
          <Badge variant="filiere" className="w-max">
            Forum communautaire
          </Badge>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-indigo-nuit">
            Forums par filière
          </h1>
          <p className="text-sm text-brume">
            Rejoignez les discussions, posez vos questions et partagez vos connaissances avec la communauté.
          </p>
        </div>

        {/* Actions rapides selon le rôle */}
        <div className="flex flex-wrap gap-2">
          {user && (
            <div className="flex justify-end flex-1">
              <CreateGroupForm />
            </div>
          )}
          
          {userRole === 'mentor' && (
            <Link href="/forum/mentors">
              <Button variant="secondary">
                🎓 Espace Mentors
              </Button>
            </Link>
          )}
          
          {userRole === 'admin' && (
            <Link href="/forum/moderation">
              <Button variant="secondary">
                ⚠️ Modération
              </Button>
            </Link>
          )}
        </div>

        {/* Liste des groupes */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-indigo-nuit">
              Groupes thématiques ({groups.length})
            </h2>
          </div>
          
          {groups.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-brume">
                Aucun groupe thématique disponible pour le moment. Créez-en un pour commencer !
              </p>
            </div>
          ) : (
            <GroupList groups={groups} sujetCounts={sujetCounts} />
          )}
        </div>
      </Container>
    </main>
  )
}
