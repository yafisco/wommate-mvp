import React from 'react'
import Link from 'next/link'
import Container from '@/components/layout/Container'
import { Badge } from '@/components/ui/Badge'
import { getGroupesThematiques, getSujetsByGroupe } from '@/lib/actions/forum.actions'
import { TopicList } from '@/components/features/forum/TopicList'
import { CreateTopicForm } from '@/components/features/forum/CreateTopicForm'
import { TopicFilters } from '@/components/features/forum/TopicFilters'
import { ForumSidebar } from '@/components/features/forum/ForumSidebar'
import { ForumDrawer } from '@/components/features/forum/ForumDrawer'
import { createClient } from '@/lib/supabase/server'

interface PageProps {
  params: Promise<{ groupeId: string }>
  searchParams: Promise<{ search?: string; filter?: string }>
}

export default async function GroupePage({ params, searchParams }: PageProps) {
  const { groupeId } = await params
  const { search, filter } = await searchParams
  
  const supabase = await createClient()
  const groups = await getGroupesThematiques()
  const currentGroup = groups.find(g => g.id === groupeId)
  
  const filterType = (filter as 'recent' | 'popular' | 'unanswered') || 'recent'
  const topics = await getSujetsByGroupe(groupeId, 50, 0, search, filterType)

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

  if (!currentGroup) {
    return (
      <main className="flex-1 py-12 animate-slide-up">
        <Container className="text-center py-20 flex flex-col gap-4 items-center">
          <h2 className="text-2xl font-display font-bold text-indigo-nuit">Groupe non trouvé</h2>
          <p className="text-sm text-brume">Ce groupe thématique n'existe pas.</p>
          <Link href="/forum">
            <button className="px-4 py-2 bg-indigo-nuit text-bone rounded-lg hover:bg-indigo-nuit/80 transition-colors">
              Retour aux forums
            </button>
          </Link>
        </Container>
      </main>
    )
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
            <Link href="/forum" className="text-xs font-mono text-attaya hover:underline flex items-center gap-1">
              ← Retour aux forums
            </Link>

            {/* En-tête du groupe */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="filiere">
                  {currentGroup.filiere || 'Général'}
                </Badge>
                <span className="text-xs text-brume font-mono">
                  {topics.length} sujet{topics.length > 1 ? 's' : ''}
                </span>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-indigo-nuit">
                {currentGroup.nom}
              </h1>
              {currentGroup.description && (
                <p className="text-sm text-brume max-w-2xl">
                  {currentGroup.description}
                </p>
              )}
            </div>

            {/* Layout 2 colonnes: formulaire + liste */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Colonne 1: Formulaire de création */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-4">
                  <CreateTopicForm 
                    groupeId={groupeId} 
                    groupeNom={currentGroup.nom}
                  />
                </div>
              </div>

              {/* Colonne 2: Liste des sujets avec filtres */}
              <div className="lg:col-span-3 space-y-4">
                <TopicFilters
                  currentFilter={filterType}
                  currentSearch={search || ''}
                />
                <TopicList 
                  topics={topics} 
                  currentGroupId={groupeId}
                  initialCount={15}
                />
              </div>
            </div>
          </div>
        </Container>
      </main>
    </>
  )
}
