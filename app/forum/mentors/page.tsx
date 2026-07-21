import React from 'react'
import Link from 'next/link'
import Container from '@/components/layout/Container'
import { Badge } from '@/components/ui/Badge'
import { getSujetsSansReponse } from '@/lib/actions/forum.actions'
import { TopicCard } from '@/components/features/forum/TopicCard'

export default async function MentorsPage() {
  const sujets = await getSujetsSansReponse(50)

  return (
    <main className="flex-1 py-12 pb-24 md:pb-12 animate-slide-up">
      <Container className="flex flex-col gap-8 max-w-6xl">
        {/* Navigation */}
        <Link href="/forum" className="text-xs font-mono text-attaya hover:underline flex items-center gap-1">
          ← Retour aux forums
        </Link>

        {/* En-tête */}
        <div className="flex flex-col gap-2">
          <Badge variant="role-mentor" className="w-max">
            Espace Mentors
          </Badge>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-indigo-nuit">
            Sujets sans réponse
          </h1>
          <p className="text-sm text-brume">
            Aidez la communauté en répondant à ces questions en attente d'aide.
          </p>
        </div>

        {/* Liste des sujets */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-indigo-nuit">
              {sujets.length} sujet{sujets.length > 1 ? 's' : ''} en attente de réponse
            </span>
          </div>

          {sujets.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full bg-pousse/10 text-pousse flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-brume">
                Tous les sujets ont reçu une réponse. Excellent travail !
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {sujets.map((sujet) => (
                <TopicCard 
                  key={sujet.id} 
                  topic={sujet} 
                  currentGroupId={sujet.groupe_id}
                />
              ))}
            </div>
          )}
        </div>
      </Container>
    </main>
  )
}
