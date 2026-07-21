import React from 'react'
import Link from 'next/link'
import Container from '@/components/layout/Container'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { ReactionButton } from '@/components/ui/ReactionButton'
import { getGroupesThematiques, getSujetById, getReponsesHierarchiques, deleteSujet, deleteReponse, signalerSujet, signalerReponse, toggleReaction } from '@/lib/actions/forum.actions'
import { ReplyList } from '@/components/features/forum/ReplyList'
import { ReplyForm } from '@/components/features/forum/ReplyForm'
import { ReportButton } from '@/components/features/forum/ReportButton'
import { ForumSidebar } from '@/components/features/forum/ForumSidebar'
import { ForumDrawer } from '@/components/features/forum/ForumDrawer'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

interface PageProps {
  params: Promise<{ groupeId: string; sujetId: string }>
}

export default async function SujetPage({ params }: PageProps) {
  const { groupeId, sujetId } = await params
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const sujet = await getSujetById(sujetId)
  const reponses = await getReponsesHierarchiques(sujetId, 50)
  const groups = await getGroupesThematiques()

  // Récupérer les comptes de sujets par groupe pour la sidebar
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

  if (!sujet) {
    return (
      <main className="flex-1 py-12 animate-slide-up">
        <Container className="text-center py-20 flex flex-col gap-4 items-center">
          <h2 className="text-2xl font-display font-bold text-indigo-nuit">Sujet non trouvé</h2>
          <p className="text-sm text-brume">Ce sujet n'existe pas ou a été supprimé.</p>
          <Link href={`/forum/${groupeId}`}>
            <button className="px-4 py-2 bg-indigo-nuit text-bone rounded-lg hover:bg-indigo-nuit/80 transition-colors">
              Retour aux sujets
            </button>
          </Link>
        </Container>
      </main>
    )
  }

  const dateCreated = new Date(sujet.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const dateUpdated = sujet.updated_at && sujet.updated_at !== sujet.created_at
    ? new Date(sujet.updated_at).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    : null

  async function handleDeleteSujet(formData: FormData) {
    'use server'
    const sujetId = formData.get('sujetId') as string
    const groupeId = formData.get('groupeId') as string
    
    await deleteSujet(sujetId)
    revalidatePath(`/forum/${groupeId}`)
  }

  async function handleDeleteReponse(formData: FormData) {
    'use server'
    const reponseId = formData.get('reponseId') as string
    await deleteReponse(reponseId)
    revalidatePath(`/forum/${groupeId}/${sujetId}`)
  }

  async function handleSignalerSujet(formData: FormData) {
    'use server'
    const sujetId = formData.get('sujetId') as string
    await signalerSujet(sujetId)
    revalidatePath(`/forum/${groupeId}/${sujetId}`)
  }

  async function handleSignalerReponse(formData: FormData) {
    'use server'
    const reponseId = formData.get('reponseId') as string
    await signalerReponse(reponseId)
    revalidatePath(`/forum/${groupeId}/${sujetId}`)
  }

  async function handleReactionSujet(formData: FormData) {
    'use server'
    const sujetId = formData.get('sujetId') as string
    const type = formData.get('type') as 'utile' | 'merci'
    await toggleReaction('sujet', sujetId, type)
    revalidatePath(`/forum/${groupeId}/${sujetId}`)
  }

  return (
    <>
      {/* Drawer mobile */}
      <ForumDrawer 
        groups={groups} 
        sujetCounts={sujetCounts}
        currentGroupId={groupeId}
      />

      <main className="flex-1 py-12 pb-24 md:pb-12 animate-slide-up">
        <Container className="flex gap-8 max-w-7xl">
          {/* Sidebar desktop */}
          <ForumSidebar 
            groups={groups} 
            sujetCounts={sujetCounts}
            currentGroupId={groupeId}
          />

          {/* Contenu principal */}
          <div className="flex-1 min-w-0 flex flex-col gap-8">
            {/* Navigation */}
            <div className="flex items-center gap-2 text-xs font-mono text-brume flex-wrap">
              <Link href="/forum" className="hover:text-attaya hover:underline">
                Forums
              </Link>
              <span>→</span>
              <Link href={`/forum/${groupeId}`} className="hover:text-attaya hover:underline">
                {sujet.groupe_nom}
              </Link>
              <span>→</span>
              <span className="text-encre truncate max-w-[200px]">{sujet.titre}</span>
            </div>

            {/* Sujet principal */}
            <Card className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                {/* En-tête du sujet */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="filiere">
                        {sujet.groupe_filiere || 'Général'}
                      </Badge>
                      {sujet.signale && (
                        <Badge variant="statut-resolue" className="text-xs">
                          ⚠️ Signalé
                        </Badge>
                      )}
                    </div>
                    
                    <form action={handleSignalerSujet}>
                      <input type="hidden" name="sujetId" value={sujetId} />
                      <ReportButton type="sujet" id={sujetId} />
                    </form>
                  </div>

                  <h1 className="font-display text-2xl md:text-3xl font-bold text-indigo-nuit">
                    {sujet.titre}
                  </h1>

                  <div className="flex items-center gap-3">
                    <Avatar name={sujet.auteur_nom || 'User'} size="md" />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-indigo-nuit">
                        {sujet.auteur_nom || 'Anonyme'}
                      </span>
                      <span className="text-xs text-brume">
                        {sujet.auteur_filiere || 'N/A'} • {sujet.auteur_niveau || 'N/A'}
                      </span>
                    </div>
                    <span className="text-xs text-brume ml-auto font-mono">
                      {dateCreated}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                {sujet.tags && sujet.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {sujet.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-1 bg-bone text-indigo-nuit rounded-full font-mono">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Contenu du sujet */}
                {sujet.contenu && (
                  <div className="prose prose-sm max-w-none text-encre leading-relaxed whitespace-pre-wrap border-t border-indigo-nuit/10 pt-6">
                    {sujet.contenu}
                  </div>
                )}

                {/* Pied du sujet avec réactions */}
                <div className="flex items-center justify-between pt-4 border-t border-indigo-nuit/10">
                  <div className="flex items-center gap-4">
                    {/* Réactions */}
                    <div className="flex items-center gap-1">
                      <form action={handleReactionSujet}>
                        <input type="hidden" name="sujetId" value={sujetId} />
                        <input type="hidden" name="type" value="utile" />
                        <button type="submit" className="pointer-events-auto">
                          <ReactionButton 
                            reactionType="utile" 
                            count={sujet.utile_count || 0}
                            size="sm"
                          />
                        </button>
                      </form>
                      <form action={handleReactionSujet}>
                        <input type="hidden" name="sujetId" value={sujetId} />
                        <input type="hidden" name="type" value="merci" />
                        <button type="submit" className="pointer-events-auto">
                          <ReactionButton 
                            reactionType="merci" 
                            count={sujet.merci_count || 0}
                            size="sm"
                          />
                        </button>
                      </form>
                    </div>

                    <span className="text-xs text-brume font-mono">
                      💬 {sujet.reponse_count} réponse{sujet.reponse_count > 1 ? 's' : ''}
                    </span>
                    {dateUpdated && (
                      <span className="text-xs text-brume font-mono" title={`Dernière activité: ${dateUpdated}`}>
                        🕒 Mis à jour le {dateUpdated}
                      </span>
                    )}
                  </div>
                  
                  <form action={handleDeleteSujet}>
                    <input type="hidden" name="sujetId" value={sujetId} />
                    <input type="hidden" name="groupeId" value={groupeId} />
                    <Button
                      variant="ghost"
                      size="sm"
                      type="submit"
                      className="text-xs text-terre hover:text-terre hover:bg-terre/5"
                    >
                      Supprimer le sujet
                    </Button>
                  </form>
                </div>
              </div>
            </Card>

            {/* Section réponses */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-indigo-nuit">
                  Réponses ({reponses.length})
                </h2>
              </div>

              {/* Formulaire de réponse */}
              <Card className="p-6 border-2 border-dashed border-indigo-nuit/20 bg-white/50">
                <ReplyForm sujetId={sujetId} />
              </Card>

              {/* Liste des réponses */}
              <ReplyList 
                replies={reponses.map(r => ({...r, current_user_id: user?.id}))}
                sujetId={sujetId}
                groupeId={groupeId}
                initialCount={10}
              />
            </div>
          </div>
        </Container>
      </main>
    </>
  )
}
